const { Configuration, OpenAIApi } = require('openai');
const config = require('./configs/config');
const { loadWallet } = require('./utils/wallet');
const { mockWallet } = require('./utils/mockUtils');
const { 
  createWarp, 
  createWarpDeploymentTransaction, 
  createWarpRegistrationTransaction, 
  sendTransaction, 
  generateWarpLink, 
  generateWarpQRCode,
  getNonce
} = require('./utils/warpUtils');
const { Address } = require('@multiversx/sdk-core');

/**
 * Parse the user prompt to extract intent and parameters
 * @param {string} prompt - The user's natural language prompt
 * @returns {Object} - The parsed intent data
 */
function parsePrompt(prompt) {
  // For demo purposes, we'll use a simple rule-based approach
  // In a real implementation, this would use a more sophisticated NLP model
  
  const promptLower = prompt.toLowerCase();
  
  // Check for staking intent
  if (promptLower.includes('stake') || promptLower.includes('staking')) {
    const amountMatch = promptLower.match(/(\d+(\.\d+)?)\s*(egld|erd)/i);
    const validatorMatch = promptLower.match(/validator\s+(erd[a-zA-Z0-9]{59})/i);
    
    return {
      intent: 'staking',
      params: {
        amount: amountMatch ? amountMatch[1] : '1',
        validatorAddress: validatorMatch ? validatorMatch[1] : 'erd1qqqqqqqqqqqqqpgqd9rvv2n378e27jcts8vfwynpkm8ng7g7945s2ey76d'
      }
    };
  }
  
  // Check for lending intent
  if (promptLower.includes('lend') || promptLower.includes('lending') || promptLower.includes('earn interest')) {
    const amountMatch = promptLower.match(/(\d+(\.\d+)?)\s*(usdc|usdt|busd|egld|erd)/i);
    const tokenMatch = promptLower.match(/(usdc|usdt|busd|egld|erd)/i);
    
    return {
      intent: 'lending',
      params: {
        amount: amountMatch ? amountMatch[1] : '100',
        tokenIdentifier: tokenMatch ? tokenMatch[1].toUpperCase() : 'USDC',
        lendingContractAddress: 'erd1qqqqqqqqqqqqqpgq9l7wjrf7rwnm4pj4xf6c2y8vw9eggl587vps5tm8ag'
      }
    };
  }
  
  // Check for borrowing intent
  if (promptLower.includes('borrow') || promptLower.includes('loan')) {
    const amountMatch = promptLower.match(/(\d+(\.\d+)?)\s*(usdc|usdt|busd)/i);
    const tokenMatch = promptLower.match(/(usdc|usdt|busd)/i);
    const collateralMatch = promptLower.match(/(\d+(\.\d+)?)\s*(egld|erd)\s+as\s+collateral/i);
    
    return {
      intent: 'borrowing',
      params: {
        amount: amountMatch ? amountMatch[1] : '500',
        tokenIdentifier: tokenMatch ? tokenMatch[1].toUpperCase() : 'USDC',
        collateralAmount: collateralMatch ? collateralMatch[1] : '1',
        collateralToken: 'EGLD',
        lendingContractAddress: 'erd1qqqqqqqqqqqqqpgq9l7wjrf7rwnm4pj4xf6c2y8vw9eggl587vps5tm8ag'
      }
    };
  }
  
  // Check for swap intent
  if (promptLower.includes('swap') || promptLower.includes('exchange')) {
    const amountInMatch = promptLower.match(/(\d+(\.\d+)?)\s*(egld|erd|usdc|usdt|busd)/i);
    const tokenInMatch = promptLower.match(/(egld|erd|usdc|usdt|busd)/i);
    const tokenOutMatch = promptLower.match(/for\s+(egld|erd|usdc|usdt|busd)/i);
    
    return {
      intent: 'swap',
      params: {
        amountIn: amountInMatch ? amountInMatch[1] : '0.1',
        tokenIn: tokenInMatch ? tokenInMatch[1].toUpperCase() : 'EGLD',
        tokenOut: tokenOutMatch ? tokenOutMatch[1].toUpperCase() : 'USDC',
        dexAddress: 'erd1qqqqqqqqqqqqqpgqmuk0q2saj0mgxmk26m3tzzhrrq4fraaea7qsuf8xm5'
      }
    };
  }
  
  // Default to a simple transfer if no specific intent is detected
  return {
    intent: 'transfer',
    params: {
      amount: '0.1',
      tokenIdentifier: 'EGLD',
      receiver: 'erd1qqqqqqqqqqqqqpgqd9rvv2n378e27jcts8vfwynpkm8ng7g7945s2ey76d'
    }
  };
}

/**
 * Create a warp from the parsed intent data
 * @param {Object} intentData - The parsed intent data
 * @returns {Promise<Object>} - The created warp
 */
async function createWarpFromIntent(intentData) {
  try {
    let warpData = {
      protocol: 'warp:0.5.0',
      name: '',
      title: '',
      description: '',
      preview: '',
      actions: []
    };
    
    // Configure the warp based on the intent
    switch (intentData.intent) {
      case 'staking':
        warpData.name = 'EGLD Staking';
        warpData.title = 'Stake EGLD';
        warpData.description = 'Stake your EGLD to earn rewards';
        warpData.preview = 'https://media.multiversx.com/tokens/staking.png';
        warpData.actions = [{
          type: 'contract',
          label: 'Stake EGLD',
          description: 'Delegate your EGLD to a validator',
          address: intentData.params.validatorAddress,
          func: 'delegate',
          args: [],
          value: intentData.params.amount,
          gasLimit: 12000000,
          inputs: []
        }];
        break;
        
      case 'lending':
        warpData.name = 'Crypto Lending';
        warpData.title = 'Lend Crypto Assets';
        warpData.description = 'Lend your crypto assets to earn interest';
        warpData.preview = 'https://media.multiversx.com/tokens/lending.png';
        warpData.actions = [{
          type: 'contract',
          label: 'Lend Assets',
          description: 'Deposit your assets to start earning interest',
          address: intentData.params.lendingContractAddress,
          func: 'deposit',
          args: [],
          value: intentData.params.tokenIdentifier === 'EGLD' ? intentData.params.amount : '0',
          gasLimit: 15000000,
          transfers: intentData.params.tokenIdentifier !== 'EGLD' ? [{
            token: intentData.params.tokenIdentifier,
            amount: intentData.params.amount
          }] : [],
          inputs: []
        }];
        break;
        
      case 'borrowing':
        warpData.name = 'Crypto Borrowing';
        warpData.title = 'Borrow Crypto Assets';
        warpData.description = 'Borrow crypto assets by providing collateral';
        warpData.preview = 'https://media.multiversx.com/tokens/borrowing.png';
        warpData.actions = [
          {
            type: 'contract',
            label: 'Provide Collateral',
            description: 'First, provide collateral to secure your loan',
            address: intentData.params.lendingContractAddress,
            func: 'provideCollateral',
            args: [],
            value: intentData.params.collateralToken === 'EGLD' ? intentData.params.collateralAmount : '0',
            gasLimit: 15000000,
            transfers: intentData.params.collateralToken !== 'EGLD' ? [{
              token: intentData.params.collateralToken,
              amount: intentData.params.collateralAmount
            }] : [],
            inputs: [],
            next: 'borrow'
          },
          {
            type: 'contract',
            label: 'Borrow Assets',
            description: 'Borrow the assets after providing collateral',
            address: intentData.params.lendingContractAddress,
            func: 'borrow',
            args: [intentData.params.tokenIdentifier, intentData.params.amount],
            value: '0',
            gasLimit: 15000000,
            inputs: []
          }
        ];
        break;
        
      case 'swap':
        warpData.name = 'Token Swap';
        warpData.title = 'Swap Tokens on DEX';
        warpData.description = 'Swap your tokens on a decentralized exchange';
        warpData.preview = 'https://media.multiversx.com/tokens/swap.png';
        warpData.actions = [{
          type: 'contract',
          label: 'Swap Tokens',
          description: 'Exchange your tokens at the current market rate',
          address: intentData.params.dexAddress,
          func: 'swapTokensFixedInput',
          args: [intentData.params.tokenIn, intentData.params.tokenOut, intentData.params.amountIn, '1'],
          value: intentData.params.tokenIn === 'EGLD' ? intentData.params.amountIn : '0',
          gasLimit: 20000000,
          transfers: intentData.params.tokenIn !== 'EGLD' ? [{
            token: intentData.params.tokenIn,
            amount: intentData.params.amountIn
          }] : [],
          inputs: [{
            name: 'Min Amount Out',
            description: 'Minimum amount to receive (slippage protection)',
            type: 'biguint',
            position: 'arg:3',
            source: 'field',
            required: true
          }]
        }];
        break;
        
      default:
        warpData.name = 'Token Transfer';
        warpData.title = 'Send Tokens';
        warpData.description = 'Transfer tokens to another address';
        warpData.preview = 'https://media.multiversx.com/tokens/transfer.png';
        warpData.actions = [{
          type: 'transfer',
          label: 'Send Tokens',
          description: 'Transfer tokens to the recipient',
          receiver: intentData.params.receiver,
          token: intentData.params.tokenIdentifier,
          amount: intentData.params.amount,
          gasLimit: 5000000
        }];
    }
    
    // Create the warp using the warpUtils
    const warp = await createWarp(warpData);
    console.log('Warp created:', warp);
    
    return warp;
  } catch (error) {
    console.error('Error creating warp from intent:', error);
    throw new Error('Failed to create warp from intent: ' + error.message);
  }
}

/**
 * Deploy a warp to the blockchain and optionally register an alias
 * @param {Object} warp - The warp to deploy
 * @param {string} alias - Optional alias for the warp
 * @returns {Promise<Object>} - The deployment result
 */
async function deployWarp(warp, alias = null) {
  try {
    let wallet;
    
    // Load the wallet based on the configuration
    if (config.appConfig.mockMode) {
      console.log('Using mock wallet');
      wallet = mockWallet;
    } else {
      console.log('Loading real wallet from keystore file...');
      wallet = await loadWallet();
      console.log(`Wallet loaded successfully: ${wallet.address}`);
    }
    
    // Create and sign the deployment transaction
    const { transaction, txHash } = await createWarpDeploymentTransaction(warp, wallet);
    
    // Send the transaction to the network
    const sentTxHash = await sendTransaction(transaction);
    console.log(`Warp deployed with transaction hash: ${sentTxHash}`);
    
    // Wait for the transaction to be processed before registering the alias
    console.log('Waiting for transaction to be processed before registering alias...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Register an alias if provided
    let aliasError = null;
    let finalLink = null;
    let finalQrCode = null;
    let registeredAlias = null;
    
    if (alias) {
      try {
        // Create the registration transaction
        const registerTx = await createWarpRegistrationTransaction(sentTxHash, alias);
        
        // Get the current nonce for the wallet address
        const nonce = await getNonce(wallet.address);
        registerTx.setNonce(nonce);
        
        // Sign the registration transaction
        const signature = await wallet.signer.sign(registerTx.serializeForSigning());
        registerTx.applySignature(signature);
        
        // Send the registration transaction
        const registerTxHash = await sendTransaction(registerTx);
        console.log(`Alias registered successfully. Registration transaction hash: ${registerTxHash}`);
        
        // Generate the link with the alias
        finalLink = generateWarpLink(alias, true);
        try {
          finalQrCode = await generateWarpQRCode(alias, true);
        } catch (qrError) {
          console.error('Error generating QR code:', qrError);
          finalQrCode = "QR code generation failed. Please use the link instead.";
        }
        
        registeredAlias = alias;
        
        return {
          txHash: sentTxHash,
          link: finalLink,
          qrCode: finalQrCode,
          alias: registeredAlias
        };
      } catch (error) {
        console.error('Error registering alias:', error);
        aliasError = error.message;
      }
    }
    
    // If alias registration failed or no alias was provided, use the transaction hash
    console.log('Continuing with hash-based link...');
    finalLink = generateWarpLink(sentTxHash, false);
    try {
      finalQrCode = await generateWarpQRCode(sentTxHash, false);
    } catch (qrError) {
      console.error('Error generating QR code:', qrError);
      finalQrCode = "QR code generation failed. Please use the link instead.";
    }
    
    const deploymentResult = {
      txHash: sentTxHash,
      link: finalLink,
      qrCode: finalQrCode,
      aliasError: aliasError
    };
    
    console.log('Deployment result:', deploymentResult);
    return deploymentResult;
  } catch (error) {
    console.error('Error deploying warp:', error);
    throw new Error('Failed to deploy warp: ' + error.message);
  }
}

/**
 * Process a user prompt to create and deploy a warp
 * @param {string} prompt - The user's natural language prompt
 * @param {string} alias - Optional alias for the warp
 * @returns {Promise<Object>} - The processing result
 */
async function processPrompt(prompt, alias = null) {
  try {
    // Check if this is a preview request
    if (prompt.toLowerCase().trim() === 'preview') {
      return { preview: true, message: 'Please provide a prompt to preview.' };
    }
    
    // Parse the prompt to extract intent
    console.log('⚙️  Analyzing your prompt with AI...');
    const intentData = parsePrompt(prompt);
    console.log('AI-parsed intent:', intentData);
    
    // Create a warp from the intent
    const warp = await createWarpFromIntent(intentData);
    
    // If this is a preview, return the warp without deploying
    if (prompt.toLowerCase().includes('preview')) {
      return { preview: true, warp };
    }
    
    // Deploy the warp to the blockchain
    const deploymentResult = await deployWarp(warp, alias);
    
    return {
      success: true,
      warp,
      deploymentResult
    };
  } catch (error) {
    console.error('Error processing prompt:', error);
    throw new Error('Failed to process prompt: ' + error.message);
  }
}

/**
 * Preview a warp without deploying it
 * @param {string} prompt - The user's natural language prompt
 * @returns {Promise<Object>} - The preview result
 */
async function previewWarp(prompt) {
  try {
    // Parse the prompt to extract intent
    console.log('⚙️  Analyzing your prompt with AI...');
    const intentData = parsePrompt(prompt);
    console.log('AI-parsed intent:', intentData);
    
    // Create a warp from the intent
    const warp = await createWarpFromIntent(intentData);
    
    return {
      success: true,
      warp
    };
  } catch (error) {
    console.error('Error previewing warp:', error);
    throw new Error('Failed to preview warp: ' + error.message);
  }
}

module.exports = {
  parsePrompt,
  createWarpFromIntent,
  deployWarp,
  processPrompt,
  previewWarp
}; 
const { warpRegistry } = require('./warpUtils');
const config = require('../configs/config');
const { ApiNetworkProvider, Address } = require('@multiversx/sdk-core');

/**
 * Get a list of warps owned by a specific address
 * @param {string} address - The owner's address
 * @returns {Promise<Array>} - Array of warp details
 */
async function getWarpsByOwner(address) {
  try {
    // Initialize the network provider
    const provider = new ApiNetworkProvider(config.warpConfig.chainApiUrl, {
      timeout: 10000,
      clientName: 'multiversx-warp-generator'
    });

    // Get aliases registered by this address
    const aliases = await warpRegistry.getAddressAliases(address);
    console.log(`Found ${aliases.length} aliases for address ${address}`);

    // Get details for each alias
    const warps = [];
    for (const alias of aliases) {
      try {
        const txHash = await warpRegistry.getAliasTxHash(alias);
        const warpData = await provider.getTransaction(txHash);
        
        warps.push({
          alias,
          txHash,
          deploymentTime: new Date(warpData.timestamp * 1000).toISOString(),
          status: warpData.status,
          link: `${config.warpConfig.clientUrl}/${alias}`
        });
      } catch (error) {
        console.error(`Error fetching details for alias ${alias}:`, error);
        warps.push({
          alias,
          error: error.message,
          link: `${config.warpConfig.clientUrl}/${alias}`
        });
      }
    }

    // Get hash warps (those without aliases)
    const hashWarps = await warpRegistry.getAddressHashes(address);
    for (const hash of hashWarps) {
      try {
        const warpData = await provider.getTransaction(hash);
        
        warps.push({
          txHash: hash,
          deploymentTime: new Date(warpData.timestamp * 1000).toISOString(),
          status: warpData.status,
          link: `${config.warpConfig.clientUrl}/hash:${hash}`
        });
      } catch (error) {
        console.error(`Error fetching details for hash ${hash}:`, error);
        warps.push({
          txHash: hash,
          error: error.message,
          link: `${config.warpConfig.clientUrl}/hash:${hash}`
        });
      }
    }

    return warps;
  } catch (error) {
    console.error('Error getting warps by owner:', error);
    throw new Error('Failed to get warps: ' + error.message);
  }
}

/**
 * Delete a warp alias (unregister it)
 * @param {string} alias - The alias to delete
 * @param {Object} wallet - The wallet object (with signer)
 * @returns {Promise<string>} - The transaction hash of the unregister operation
 */
async function deleteWarpAlias(alias, wallet) {
  try {
    // Initialize the registry
    await warpRegistry.init();
    
    // Create unregister transaction
    const tx = warpRegistry.createWarpUnregisterTransaction(alias);
    
    // Set nonce
    const provider = new ApiNetworkProvider(config.warpConfig.chainApiUrl);
    const account = await provider.getAccount(Address.fromString(wallet.address));
    tx.setNonce(account.nonce);
    
    // Sign transaction
    const signature = await wallet.signer.sign(tx.serializeForSigning());
    tx.applySignature(signature);
    
    // Send transaction
    const txHash = await provider.sendTransaction(tx);
    console.log(`Alias ${alias} unregistered. Transaction hash: ${txHash}`);
    
    return txHash;
  } catch (error) {
    console.error('Error deleting warp alias:', error);
    throw new Error('Failed to delete warp alias: ' + error.message);
  }
}

/**
 * Get global warp statistics
 * @returns {Promise<Object>} - Statistics about warps
 */
async function getWarpStats() {
  try {
    await warpRegistry.init();
    
    // Get total warps count
    const totalAliases = await warpRegistry.getTotalAliases();
    
    // Get recent aliases (last 10)
    const recentAliases = [];
    for (let i = totalAliases; i > Math.max(1, totalAliases - 10); i--) {
      try {
        const alias = await warpRegistry.getAliasAtIndex(i);
        const txHash = await warpRegistry.getAliasTxHash(alias);
        
        recentAliases.push({
          alias,
          txHash,
          link: `${config.warpConfig.clientUrl}/${alias}`
        });
      } catch (error) {
        console.error(`Error fetching alias at index ${i}:`, error);
      }
    }
    
    return {
      totalAliases,
      recentAliases
    };
  } catch (error) {
    console.error('Error getting warp stats:', error);
    throw new Error('Failed to get warp statistics: ' + error.message);
  }
}

/**
 * Check if an alias is available
 * @param {string} alias - The alias to check
 * @returns {Promise<boolean>} - True if available, false if taken
 */
async function isAliasAvailable(alias) {
  try {
    await warpRegistry.init();
    
    try {
      // If this call succeeds, the alias exists
      await warpRegistry.getAliasTxHash(alias);
      return false; // Alias is taken
    } catch (error) {
      if (error.message.includes('not found')) {
        return true; // Alias is available
      }
      throw error; // Some other error
    }
  } catch (error) {
    console.error('Error checking alias availability:', error);
    throw new Error('Failed to check alias availability: ' + error.message);
  }
}

/**
 * Generate analytics for a specific warp
 * @param {string} identifier - The alias or txHash
 * @param {boolean} isAlias - Whether identifier is an alias
 * @returns {Promise<Object>} - Analytics data
 */
async function getWarpAnalytics(identifier, isAlias = true) {
  try {
    let txHash = identifier;
    
    // If this is an alias, get the txHash
    if (isAlias) {
      await warpRegistry.init();
      txHash = await warpRegistry.getAliasTxHash(identifier);
    }
    
    // Initialize the network provider
    const provider = new ApiNetworkProvider(config.warpConfig.chainApiUrl);
    
    // Get the transaction
    const tx = await provider.getTransaction(txHash);
    
    // Get any operations triggered by this warp
    const operations = await provider.getTransactionsByAddress(
      Address.fromString(config.walletConfig.address),
      undefined,
      { searchAfter: tx.timestamp }
    );
    
    // Filter operations that might be related to this warp (within 1 hour)
    const relatedOperations = operations.filter(op => 
      op.timestamp > tx.timestamp && 
      op.timestamp < tx.timestamp + 3600
    );
    
    return {
      deployment: {
        txHash,
        timestamp: new Date(tx.timestamp * 1000).toISOString(),
        status: tx.status,
        sender: tx.sender,
        receiver: tx.receiver
      },
      relatedOperations: relatedOperations.map(op => ({
        txHash: op.txHash,
        timestamp: new Date(op.timestamp * 1000).toISOString(),
        status: op.status,
        sender: op.sender,
        receiver: op.receiver,
        value: op.value
      }))
    };
  } catch (error) {
    console.error('Error getting warp analytics:', error);
    throw new Error('Failed to get warp analytics: ' + error.message);
  }
}

module.exports = {
  getWarpsByOwner,
  deleteWarpAlias,
  getWarpStats,
  isAliasAvailable,
  getWarpAnalytics
}; 
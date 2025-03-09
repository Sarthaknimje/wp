# MultiversX AI Warp Generator

A web application that allows users to create MultiversX blockchain transactions using natural language prompts. The application leverages AI to interpret user intentions and generates Warp links that can be shared with others.

## Features

- Generate blockchain transactions using natural language
- Preview warps before deployment
- Register custom aliases for warps
- Generate QR codes for easy sharing
- Support for various transaction types (swap, stake, transfer, etc.)

## Technologies Used

- Node.js
- Express.js
- EJS templating
- MultiversX SDK
- @vleap/warps package
- OpenAI API for natural language processing

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Sarthaknimje/wp.git
cd wp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
# MultiversX Network Configuration
MULTIVERSX_NETWORK=devnet
MULTIVERSX_API_URL=https://devnet-api.multiversx.com

# Wallet Configuration
WALLET_KEYSTORE_FILE=./path-to-your-keystore.json
WALLET_PASSWORD=your-password
WALLET_ADDRESS=your-wallet-address

# Application Configuration
MOCK_MODE=false  # Set to false for real blockchain transactions

# Warp Configuration
WARP_REGISTRY_ADDRESS=erd1qqqqqqqqqqqqqpgqmuk0q2saj0mgxmk26m3tzzhrrq4fraaea7qsuf8xm5
WARP_BASE_URL=https://devnet.usewarp.to/
```

4. Start the application:
```bash
npm start
```

## Usage

1. Enter a natural language prompt describing the transaction you want to create
2. (Optional) Enter an alias for your warp
3. Click "Generate Warp" to create the transaction
4. Share the generated link or QR code with others

## Examples

- "Stake 10 EGLD with validator erd123..."
- "I want to lend 100 USDC to earn interest"
- "Borrow 500 USDC with 2 EGLD as collateral"
- "Swap 1 EGLD for USDC at the best rate"
- "Mint an NFT for 0.5 EGLD from collection X"

## License

MIT

## Created for MultiversX Hackathon 
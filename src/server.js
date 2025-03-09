const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { processPrompt, previewWarp } = require('./warpAgent');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'MultiversX AI Warp Generator',
    result: null,
    preview: null,
    error: null
  });
});

app.post('/generate', async (req, res) => {
  try {
    const { prompt, alias } = req.body;
    
    if (!prompt) {
      return res.render('index', { 
        title: 'MultiversX AI Warp Generator',
        result: null,
        preview: null,
        error: 'Please enter a prompt'
      });
    }
    
    const result = await processPrompt(prompt, alias || null);
    
    // Add explorer link to the result
    result.explorerLink = `https://devnet-explorer.multiversx.com/transactions/${result.txHash}`;
    
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result,
      preview: null,
      error: null
    });
  } catch (error) {
    console.error('Error generating warp:', error);
    
    // Prepare helpful error messages
    let helpfulTips = [];
    if (error.message.includes('wallet')) {
      helpfulTips = [
        'Check that your wallet keystore file exists at the path specified in .env',
        'Verify that your wallet password is correct',
        'Ensure your wallet has sufficient EGLD for transaction fees'
      ];
    } else if (error.message.includes('transaction')) {
      helpfulTips = [
        'Check your network connection',
        'Verify that the MultiversX devnet is operational',
        'Ensure your wallet has sufficient EGLD for transaction fees'
      ];
    }
    
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result: null,
      preview: null,
      error: error.message,
      helpfulTips
    });
  }
});

app.post('/preview', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.render('index', { 
        title: 'MultiversX AI Warp Generator',
        result: null,
        preview: null,
        error: 'Please enter a prompt'
      });
    }
    
    const preview = await previewWarp(prompt);
    
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result: null,
      preview,
      error: null
    });
  } catch (error) {
    console.error('Error previewing warp:', error);
    res.render('index', { 
      title: 'MultiversX AI Warp Generator',
      result: null,
      preview: null,
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 
// Enhanced UI script for MultiversX Warp Generator

document.addEventListener('DOMContentLoaded', function() {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Dark mode toggle
  const darkModeSwitch = document.getElementById('darkModeSwitch');
  const body = document.body;
  
  // Check for saved theme preference or use preferred color scheme
  const savedTheme = localStorage.getItem('darkMode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Apply theme based on saved preference or system preference
  if (savedTheme === 'dark' || (savedTheme === null && prefersDark)) {
    body.classList.add('dark-mode');
    if (darkModeSwitch) darkModeSwitch.checked = true;
  }
  
  // Toggle dark mode when switch is clicked
  if (darkModeSwitch) {
    darkModeSwitch.addEventListener('change', function() {
      if (this.checked) {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'dark');
      } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'light');
      }
    });
  }

  // Copy to clipboard functionality
  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const textToCopy = this.getAttribute('data-copy');
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Copied to clipboard!', 'success');
        
        // Visual feedback
        const originalHTML = this.innerHTML;
        this.innerHTML = '<i class="bi bi-check"></i>';
        this.classList.add('btn-success');
        
        setTimeout(() => {
          this.innerHTML = originalHTML;
          this.classList.remove('btn-success');
        }, 1500);
      }).catch(err => {
        showToast('Failed to copy: ' + err, 'danger');
      });
    });
  });

  // Example prompts click handler
  const examplePrompts = document.querySelectorAll('.example-prompt');
  examplePrompts.forEach(card => {
    card.addEventListener('click', function() {
      const prompt = this.getAttribute('data-prompt');
      const promptInput = document.getElementById('prompt') || document.getElementById('previewPrompt');
      if (promptInput) {
        promptInput.value = prompt;
        promptInput.focus();
        
        // Scroll to form
        promptInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // Custom styling options toggle
  const customStyleCheck = document.getElementById('customStyleCheck');
  const stylingOptions = document.getElementById('stylingOptions');
  
  if (customStyleCheck && stylingOptions) {
    customStyleCheck.addEventListener('change', function() {
      stylingOptions.style.display = this.checked ? 'flex' : 'none';
    });
    
    // Initialize styling options display
    stylingOptions.style.display = customStyleCheck.checked ? 'flex' : 'none';
  }
  
  // Apply styling options in real-time preview
  const primaryColorInput = document.getElementById('primaryColor');
  const secondaryColorInput = document.getElementById('secondaryColor');
  const fontFamilySelect = document.getElementById('fontFamily');
  const buttonStyleSelect = document.getElementById('buttonStyle');
  const backgroundStyleInputs = document.querySelectorAll('input[name="backgroundStyle"]');
  const animationToggles = {
    qr: document.getElementById('animateQr'),
    buttons: document.getElementById('animateButtons'),
    background: document.getElementById('animateBackground')
  };
  
  // Function to apply style changes
  function applyStyleChanges() {
    if (!customStyleCheck || !customStyleCheck.checked) return;
    
    // Create a style element for dynamic styles
    let styleEl = document.getElementById('dynamic-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-styles';
      document.head.appendChild(styleEl);
    }
    
    // Get selected values
    const primaryColor = primaryColorInput ? primaryColorInput.value : '#0066cc';
    const secondaryColor = secondaryColorInput ? secondaryColorInput.value : '#30b78d';
    const fontFamily = fontFamilySelect ? fontFamilySelect.value : "'Inter', sans-serif";
    const buttonStyle = buttonStyleSelect ? buttonStyleSelect.value : 'default';
    
    // Get background style
    let backgroundStyle = 'solid';
    backgroundStyleInputs.forEach(input => {
      if (input.checked) backgroundStyle = input.value;
    });
    
    // Get animation settings
    const animateQr = animationToggles.qr ? animationToggles.qr.checked : true;
    const animateButtons = animationToggles.buttons ? animationToggles.buttons.checked : true;
    const animateBackground = animationToggles.background ? animationToggles.background.checked : false;
    
    // Build CSS
    let css = `:root {
      --primary-color: ${primaryColor};
      --secondary-color: ${secondaryColor};
      --font-family: ${fontFamily};
    }`;
    
    // Button styles
    if (buttonStyle === 'rounded') {
      css += `.btn { border-radius: 12px; }`;
    } else if (buttonStyle === 'pill') {
      css += `.btn { border-radius: 50px; }`;
    } else if (buttonStyle === 'minimal') {
      css += `.btn { 
        border-radius: 4px; 
        box-shadow: none;
        border-width: 1px;
      }
      .btn:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }`;
    } else if (buttonStyle === '3d') {
      css += `.btn {
        border-radius: 8px;
        box-shadow: 0 4px 0 rgba(0,0,0,0.2);
        transform: translateY(0);
      }
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 0 rgba(0,0,0,0.2);
      }
      .btn:active {
        transform: translateY(0);
        box-shadow: 0 2px 0 rgba(0,0,0,0.2);
      }`;
    }
    
    // Background styles
    if (backgroundStyle === 'gradient') {
      css += `body { background: linear-gradient(135deg, ${primaryColor}15, ${secondaryColor}15); }`;
      css += `.dark-mode body { background: linear-gradient(135deg, ${primaryColor}25, ${secondaryColor}25); }`;
    } else if (backgroundStyle === 'pattern') {
      css += `body { 
        background-color: #f5f7fa;
        background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23${primaryColor.substring(1)}' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
      }`;
      css += `.dark-mode body { 
        background-color: var(--dark-color);
        background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23${primaryColor.substring(1)}' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
      }`;
    }
    
    // Animation options
    if (!animateQr) {
      css += `.qr-scanner-line { display: none; }`;
      css += `.qr-code { animation: none; }`;
    }
    
    if (!animateButtons) {
      css += `.btn:after { display: none; }`;
      css += `.btn:hover { transform: none; }`;
    }
    
    if (animateBackground) {
      css += `body {
        background-size: 400% 400%;
        animation: gradientBG 15s ease infinite;
      }
      @keyframes gradientBG {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }`;
    }
    
    // Apply CSS
    styleEl.textContent = css;
  }
  
  // Add event listeners to styling inputs
  [primaryColorInput, secondaryColorInput, fontFamilySelect, buttonStyleSelect, 
   ...backgroundStyleInputs, animationToggles.qr, animationToggles.buttons, 
   animationToggles.background].forEach(element => {
    if (element) {
      element.addEventListener('change', applyStyleChanges);
    }
  });
  
  // Apply initial styles if custom styling is checked
  if (customStyleCheck && customStyleCheck.checked) {
    applyStyleChanges();
  }
  
  // Add a help modal for the Help button
  const helpButton = document.getElementById('helpBtn');
  if (helpButton) {
    helpButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Create and show help modal
      showToast('Coming soon: Comprehensive help guide', 'info');
      
      // For a more comprehensive help, you could create a modal with detailed instructions
      // This is just a placeholder for now
    });
  }

  // Update warp preview when colors are changed
  window.updateWarpPreview = function() {
    const primaryColor = document.getElementById('primaryColor').value;
    const secondaryColor = document.getElementById('secondaryColor').value;
    const warpPreview = document.getElementById('warpPreview');
    
    if (warpPreview) {
      warpPreview.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
    }
  };

  // Alias availability check
  const checkAliasBtn = document.getElementById('checkAliasBtn');
  const aliasInput = document.getElementById('alias');
  const aliasResult = document.getElementById('aliasAvailabilityResult');
  
  if (checkAliasBtn && aliasInput && aliasResult) {
    checkAliasBtn.addEventListener('click', function() {
      const alias = aliasInput.value.trim();
      
      if (!alias) {
        aliasResult.innerHTML = '<span class="text-warning"><i class="bi bi-exclamation-triangle"></i> Please enter an alias to check</span>';
        return;
      }
      
      // Show loading state
      checkAliasBtn.disabled = true;
      checkAliasBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Checking...';
      aliasResult.innerHTML = '<span class="text-info loading">Checking availability</span>';
      
      // Call your API endpoint to check alias availability
      fetch(`/api/check-alias/${encodeURIComponent(alias)}`)
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => {
          if (data.available) {
            aliasResult.innerHTML = '<span class="text-success"><i class="bi bi-check-circle"></i> Alias is available!</span>';
          } else {
            aliasResult.innerHTML = '<span class="text-danger"><i class="bi bi-x-circle"></i> Alias is already taken</span>';
          }
        })
        .catch(error => {
          console.error('Error checking alias:', error);
          aliasResult.innerHTML = `<span class="text-danger"><i class="bi bi-exclamation-circle"></i> Error checking alias: ${error.message}</span>`;
        })
        .finally(() => {
          // Reset button state
          checkAliasBtn.disabled = false;
          checkAliasBtn.innerHTML = 'Check Availability';
        });
    });
  }

  // Form submission animation
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function() {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
        
        // Store the button for later access
        this.dataset.submitBtn = submitBtn;
        this.dataset.originalText = originalText;
      }
    });
  });

  // Toast notification system
  if (!document.querySelector('.toast-container')) {
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
});

// Function to simulate transaction status updates
function simulateTransaction(txHash, callback) {
  const txStatus = document.getElementById('txStatus');
  if (!txStatus) return;
  
  const states = [
    { status: 'pending', message: 'Transaction pending...', class: 'alert-warning' },
    { status: 'processing', message: 'Transaction is being processed...', class: 'alert-info' },
    { status: 'confirmed', message: 'Transaction confirmed!', class: 'alert-success' }
  ];
  
  let currentState = 0;
  
  // Show initial state
  txStatus.innerHTML = `
    <div class="alert ${states[0].class} fade-in">
      <i class="bi bi-hourglass-split me-2"></i>
      <strong>${states[0].status}:</strong> ${states[0].message}
    </div>
  `;
  
  // Update status every few seconds
  const interval = setInterval(() => {
    currentState++;
    
    if (currentState < states.length) {
      txStatus.innerHTML = `
        <div class="alert ${states[currentState].class} fade-in">
          <i class="bi bi-${currentState === 1 ? 'arrow-repeat spin' : 'check-circle'} me-2"></i>
          <strong>${states[currentState].status}:</strong> ${states[currentState].message}
        </div>
      `;
    } else {
      clearInterval(interval);
      if (callback) callback();
    }
  }, 3000);
  
  // Add hash link
  const explorerUrl = `https://devnet-explorer.multiversx.com/transactions/${txHash}`;
  txStatus.innerHTML += `
    <div class="mt-2 text-center">
      <a href="${explorerUrl}" target="_blank" class="btn btn-sm btn-outline-primary">
        <i class="bi bi-box-arrow-up-right me-1"></i> View on Explorer
      </a>
    </div>
  `;
}

// Function to show toast notifications
function showToast(message, type = 'info') {
  const toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) return;
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast show fade-in bg-${type} text-white`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  // Set toast content
  toast.innerHTML = `
    <div class="toast-header bg-${type} text-white">
      <strong class="me-auto">MultiversX Warp</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Remove after 5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
  
  // Add close handler
  const closeBtn = toast.querySelector('.btn-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
  }
}

// Add animation to elements when they come into view
function animateOnScroll() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  elements.forEach(element => {
    observer.observe(element);
  });
}

// Call animation function when page is loaded
window.addEventListener('load', animateOnScroll); 
/**
 * MultiversX AI Warp Generator - Modern JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the application
  initWarpGenerator();
  
  // Set up event listeners
  setupEventListeners();
  
  // Check for dark mode preference
  checkDarkModePreference();
  
  // Add animations to elements
  addEntryAnimations();
});

/**
 * Initialize the Warp Generator UI
 */
function initWarpGenerator() {
  console.log('Initializing MultiversX AI Warp Generator...');
  
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Initialize popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function(popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
  
  // Show welcome toast
  showToast('Welcome to MultiversX AI Warp Generator!', 'info');
}

/**
 * Set up event listeners for UI elements
 */
function setupEventListeners() {
  // Dark mode toggle
  const darkModeSwitch = document.getElementById('darkModeSwitch');
  if (darkModeSwitch) {
    darkModeSwitch.addEventListener('change', toggleDarkMode);
  }
  
  // Form submissions
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...';
        submitBtn.disabled = true;
      }
    });
  });
  
  // Example prompts
  const examplePrompts = document.querySelectorAll('.example-prompt');
  examplePrompts.forEach(example => {
    example.addEventListener('click', function() {
      const promptText = this.getAttribute('data-prompt');
      const promptTextarea = document.getElementById('prompt');
      if (promptTextarea && promptText) {
        promptTextarea.value = promptText;
        promptTextarea.focus();
        
        // Animate the textarea
        promptTextarea.classList.add('pulse');
        setTimeout(() => {
          promptTextarea.classList.remove('pulse');
        }, 1000);
      }
    });
  });
  
  // Alias availability check
  const checkAliasBtn = document.getElementById('checkAliasBtn');
  if (checkAliasBtn) {
    checkAliasBtn.addEventListener('click', checkAliasAvailability);
  }
  
  // Custom styling toggle
  const customStyleCheck = document.getElementById('customStyleCheck');
  if (customStyleCheck) {
    customStyleCheck.addEventListener('change', function() {
      const stylingOptions = document.getElementById('stylingOptions');
      if (stylingOptions) {
        if (this.checked) {
          stylingOptions.style.display = 'flex';
          stylingOptions.classList.add('fade-in');
        } else {
          stylingOptions.classList.remove('fade-in');
          stylingOptions.style.display = 'none';
        }
      }
    });
  }
  
  // Copy to clipboard buttons
  const copyButtons = document.querySelectorAll('.btn-copy');
  copyButtons.forEach(button => {
    button.addEventListener('click', function() {
      const textToCopy = this.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalText = this.innerHTML;
          this.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
          setTimeout(() => {
            this.innerHTML = originalText;
          }, 2000);
          
          showToast('Copied to clipboard!', 'success');
        }).catch(err => {
          showToast('Failed to copy text: ' + err, 'error');
        });
      }
    });
  });
  
  // QR Code animation
  const qrCodes = document.querySelectorAll('.qr-code');
  qrCodes.forEach(qr => {
    qr.addEventListener('mouseenter', function() {
      this.classList.add('pulse');
    });
    qr.addEventListener('mouseleave', function() {
      this.classList.remove('pulse');
    });
  });
}

/**
 * Check user's preferred color scheme and apply it
 */
function checkDarkModePreference() {
  const darkModeSwitch = document.getElementById('darkModeSwitch');
  
  // Check for saved preference
  const savedDarkMode = localStorage.getItem('darkMode');
  
  // Check for system preference if no saved preference
  if (savedDarkMode === null) {
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      document.body.classList.add('dark-mode');
      if (darkModeSwitch) darkModeSwitch.checked = true;
    }
  } else if (savedDarkMode === 'true') {
    document.body.classList.add('dark-mode');
    if (darkModeSwitch) darkModeSwitch.checked = true;
  }
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
  
  // Show toast
  if (document.body.classList.contains('dark-mode')) {
    showToast('Dark mode enabled', 'info');
  } else {
    showToast('Light mode enabled', 'info');
  }
}

/**
 * Add entry animations to UI elements
 */
function addEntryAnimations() {
  const header = document.querySelector('.card-header');
  if (header) {
    header.classList.add('fade-in');
  }
  
  const formElements = document.querySelectorAll('.form-group, .btn-primary, .nav-tabs');
  formElements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('fade-in');
    }, 100 * index);
  });
  
  const exampleCards = document.querySelectorAll('.example-prompt');
  exampleCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('fade-in-up');
    }, 200 + (100 * index));
  });
}

/**
 * Check if an alias is available
 */
function checkAliasAvailability() {
  const aliasInput = document.getElementById('alias');
  const resultElement = document.getElementById('aliasAvailabilityResult');
  
  if (!aliasInput || !resultElement) return;
  
  const alias = aliasInput.value.trim();
  
  if (!alias) {
    resultElement.innerHTML = '<span class="text-danger">Please enter an alias</span>';
    return;
  }
  
  // Show checking state
  resultElement.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Checking availability...';
  
  // Simulate a network request (in a real app this would be an actual API call)
  setTimeout(() => {
    // For demo purposes, randomly determine if alias is available
    const isAvailable = Math.random() > 0.3;
    
    if (isAvailable) {
      resultElement.innerHTML = '<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i> Alias is available!</span>';
      aliasInput.classList.add('is-valid');
      aliasInput.classList.remove('is-invalid');
    } else {
      resultElement.innerHTML = '<span class="text-danger"><i class="bi bi-x-circle-fill me-1"></i> Alias is already taken</span>';
      aliasInput.classList.add('is-invalid');
      aliasInput.classList.remove('is-valid');
    }
  }, 1000);
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, warning, info)
 */
function showToast(message, type = 'info') {
  // Create container if it doesn't exist
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = message;
  
  // Add to container
  container.appendChild(toast);
  
  // Remove after timeout
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, 3000);
}

/**
 * Create a stepped progress indicator
 * @param {string} elementId - The ID of the element to create the stepper in
 * @param {Array} steps - Array of step objects with name and optional status
 */
function createStepper(elementId, steps) {
  const container = document.getElementById(elementId);
  if (!container) return;
  
  const stepper = document.createElement('div');
  stepper.className = 'stepper';
  
  steps.forEach((step, index) => {
    const stepElement = document.createElement('div');
    stepElement.className = `step ${step.status || ''}`;
    
    const stepIcon = document.createElement('div');
    stepIcon.className = 'step-icon';
    stepIcon.innerText = index + 1;
    
    const stepLabel = document.createElement('div');
    stepLabel.className = 'step-label';
    stepLabel.innerText = step.name;
    
    stepElement.appendChild(stepIcon);
    stepElement.appendChild(stepLabel);
    stepper.appendChild(stepElement);
  });
  
  container.innerHTML = '';
  container.appendChild(stepper);
}

/**
 * Update blockchain data with live information
 */
function updateBlockchainInfo() {
  const priceElement = document.getElementById('egldPrice');
  if (priceElement) {
    // Simulate price update
    setInterval(() => {
      const currentPrice = parseFloat(priceElement.innerText.replace('$', ''));
      const change = (Math.random() - 0.5) * 2; // Random change between -1 and 1
      const newPrice = (currentPrice + change).toFixed(2);
      
      const direction = change >= 0 ? 'up' : 'down';
      priceElement.innerHTML = `$${newPrice} <small class="text-${direction === 'up' ? 'success' : 'danger'}"><i class="bi bi-arrow-${direction}"></i> ${Math.abs(change).toFixed(2)}</small>`;
    }, 5000);
  }
}

/**
 * Initialize charts for statistics page
 */
function initCharts() {
  if (typeof Chart === 'undefined') return;
  
  // Warp usage chart
  const usageCtx = document.getElementById('warpUsageChart');
  if (usageCtx) {
    new Chart(usageCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Warps Created',
          data: [12, 19, 24, 31, 45, 52],
          borderColor: 'rgba(62, 84, 211, 1)',
          backgroundColor: 'rgba(62, 84, 211, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

/**
 * Live preview for Warp styling
 */
function updateWarpPreview() {
  const primaryColor = document.getElementById('primaryColor').value;
  const secondaryColor = document.getElementById('secondaryColor').value;
  const previewElement = document.getElementById('warpPreview');
  
  if (previewElement) {
    previewElement.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
  }
}

/**
 * Simulate blockchain transaction process with progress updates
 * @param {string} txHash - The transaction hash
 * @param {Function} onComplete - Callback when complete
 */
function simulateTransaction(txHash, onComplete) {
  const statusElement = document.getElementById('txStatus');
  if (!statusElement) return;
  
  const steps = [
    { status: 'Sending transaction to network...', progress: 10 },
    { status: 'Transaction received by blockchain nodes...', progress: 30 },
    { status: 'Processing transaction...', progress: 50 },
    { status: 'Awaiting confirmation...', progress: 70 },
    { status: 'Transaction confirmed!', progress: 100 }
  ];
  
  let currentStep = 0;
  
  statusElement.innerHTML = `
    <div class="progress mb-2">
      <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%"></div>
    </div>
    <p class="mb-0 status-text">Initializing transaction...</p>
  `;
  
  const interval = setInterval(() => {
    if (currentStep >= steps.length) {
      clearInterval(interval);
      if (onComplete) onComplete();
      return;
    }
    
    const step = steps[currentStep];
    statusElement.querySelector('.progress-bar').style.width = `${step.progress}%`;
    statusElement.querySelector('.status-text').innerText = step.status;
    
    currentStep++;
  }, 1500);
} 
// Application Data
const appData = {
  contact: {
    phone: "+359 878 130 399",
    email: "contact@zuberovdesign.com", 
    web: "www.zuberovdesign.com"
  },
  currencies: {
    BGN: {symbol: "BGN", rate: 1.0}, // BGN is base currency
    EUR: {symbol: "EUR", rate: 1.96},
    USD: {symbol: "USD", rate: 2.16}
  },
  regions: {
    bulgaria: {name: "Bulgaria Local", multiplier: 0.7},
    eu: {name: "EU/International", multiplier: 1.0},
    premium: {name: "Premium International", multiplier: 1.4}
  },
  services: [
    {id: "graphic", name: "Graphic Design (Digital/Print)", rates: [49, 98, 167], description: "Professional graphic design for digital and print media"},
    {id: "webdesign", name: "Web Design Only", rates: [59, 118, 177], description: "User interface and visual design for websites"},
    {id: "webdev", name: "Web Design & Development", rates: [69, 137, 235], description: "Complete website design and development using modern platforms"},
    {id: "branding", name: "Brand Architecture & Development", rates: [98, 196, 294], description: "Comprehensive brand strategy and visual identity development"},
    {id: "research", name: "Research & Analysis", rates: [78, 157, 216], description: "Market research and business development analysis"},
    {id: "strategy", name: "Strategy & Consultation", rates: [118, 235, 392], description: "Strategic consulting and business planning services"},
    {id: "3d", name: "3D Services (Archviz, Product Viz)", rates: [88, 177, 294], description: "3D visualization for architecture and product design"},
    {id: "other", name: "Other Services", rates: [69, 137, 235], description: "Additional design and consulting services"}
  ],
  products: [
    {id: "logo", name: "Logo Design", prices: [1568, 3136, 6860], description: "Professional logo design with multiple concepts and revisions"},
    {id: "business-card", name: "Business Card Design", prices: [294, 588, 1176], description: "Professional business card design and print preparation"},
    {id: "brochure", name: "Brochure Design", prices: [1176, 2352, 4900], description: "Multi-page brochure design with professional layout"},
    {id: "poster", name: "Poster Design", prices: [588, 1176, 2352], description: "Eye-catching poster design for events and marketing"},
    {id: "folder", name: "Folder Design", prices: [784, 1568, 2940], description: "Professional folder design for corporate presentations"},
    {id: "flyer", name: "Flyer Design", prices: [392, 784, 1568], description: "Promotional flyer design for marketing campaigns"},
    {id: "stationery", name: "Business Stationery Package", prices: [1568, 3136, 5880], description: "Complete stationery set including letterhead, envelopes, and cards"},
    {id: "social", name: "Social Media Templates (10-set)", prices: [784, 1568, 2940], description: "Set of 10 social media templates for consistent branding"}
  ],
  tiers: ["Simple", "Standard", "Premium"],
  complexity: {
    standard: {name: "Standard", multiplier: 1.0},
    medium: {name: "Medium Complexity", multiplier: 1.3},
    high: {name: "High Complexity", multiplier: 1.7},
    "very-complex": {name: "Very Complex", multiplier: 2.2}
  },
  urgency: {
    standard: {name: "Standard Timeline", multiplier: 1.0},
    rush: {name: "Rush (1-3 days)", multiplier: 1.5},
    urgent: {name: "Urgent (24-48 hours)", multiplier: 2.0},
    emergency: {name: "Emergency (same day)", multiplier: 3.0}
  }
};

// Application State
let currentState = {
  currency: 'BGN',
  region: 'bulgaria',
  services: [],
  products: [],
  customServices: [],
  customProducts: [],
  complexity: 'standard',
  urgency: 'standard',
  discount: 0,
  additionalCosts: 0,
  logoUrl: null,
  showBaseRates: false
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  loadFromStorage();
  renderServices();
  renderProducts();
  setupEventListeners();
  calculateTotal();
});

function initializeApp() {
  // Initialize services state
  currentState.services = appData.services.map(service => ({
    ...service,
    selectedTier: 0,
    hours: 0,
    quantity: 1,
    isActive: false
  }));

  // Initialize products state
  currentState.products = appData.products.map(product => ({
    ...product,
    selectedTier: 0,
    quantity: 0,
    isActive: false
  }));
}

function setupEventListeners() {
  // Logo upload
  const logoUpload = document.getElementById('logoUpload');
  const logoInput = document.getElementById('logoInput');
  logoUpload.addEventListener('click', () => logoInput.click());
  logoInput.addEventListener('change', handleLogoUpload);

  // Currency and region selectors
  document.getElementById('currencySelect').addEventListener('change', (e) => {
    currentState.currency = e.target.value;
    renderServices();
    renderProducts();
    calculateTotal();
    saveToStorage();
  });

  document.getElementById('regionSelect').addEventListener('change', (e) => {
    currentState.region = e.target.value;
    calculateTotal();
    saveToStorage();
  });

  // Parameters
  document.getElementById('complexitySelect').addEventListener('change', (e) => {
    currentState.complexity = e.target.value;
    calculateTotal();
    saveToStorage();
  });

  document.getElementById('urgencySelect').addEventListener('change', (e) => {
    currentState.urgency = e.target.value;
    calculateTotal();
    saveToStorage();
  });

  document.getElementById('discountInput').addEventListener('input', (e) => {
    currentState.discount = parseFloat(e.target.value) || 0;
    calculateTotal();
    saveToStorage();
  });

  document.getElementById('additionalCosts').addEventListener('input', (e) => {
    currentState.additionalCosts = parseFloat(e.target.value) || 0;
    calculateTotal();
    saveToStorage();
  });

  // Show base rates toggle
  document.getElementById('showBaseRates').addEventListener('change', (e) => {
    currentState.showBaseRates = e.target.checked;
    saveToStorage();
  });

  // Custom service/product buttons
  document.getElementById('addCustomService').addEventListener('click', () => {
    document.getElementById('customServiceModal').style.display = 'block';
  });

  document.getElementById('addCustomProduct').addEventListener('click', () => {
    document.getElementById('customProductModal').style.display = 'block';
  });

  // Modal event listeners
  setupModalListeners();

  // Quote generation
  document.getElementById('generateQuote').addEventListener('click', generateQuote);
  document.getElementById('resetAll').addEventListener('click', resetAll);

  // Form inputs for saving
  const formInputs = ['clientName', 'clientCompany', 'clientEmail', 'clientPhone', 'clientAddress', 
                     'quoteGreeting', 'projectDuration', 'termsConditions', 'vatDisclaimer'];
  formInputs.forEach(id => {
    document.getElementById(id).addEventListener('input', saveToStorage);
  });

  document.getElementById('vatToggle').addEventListener('change', saveToStorage);
}

function setupModalListeners() {
  // Close modal listeners
  const closeButtons = document.querySelectorAll('.close, #cancelService, #cancelProduct, #closeQuote');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', closeModals);
  });

  // Add service
  document.getElementById('addServiceBtn').addEventListener('click', addCustomService);

  // Add product
  document.getElementById('addProductBtn').addEventListener('click', addCustomProduct);

  // Quote modal
  document.getElementById('closeQuoteModal').addEventListener('click', () => {
    document.getElementById('quoteModal').style.display = 'none';
  });

  document.getElementById('printQuote').addEventListener('click', printQuote);

  // Click outside modal to close
  window.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
}

function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Check file size (2MB limit)
  if (file.size > 2 * 1024 * 1024) {
    alert('File size must be less than 2MB');
    return;
  }

  // Check file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    alert('Only PNG, JPG, JPEG, and SVG files are allowed');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    currentState.logoUrl = e.target.result;
    document.getElementById('logoPlaceholder').style.display = 'none';
    document.getElementById('logoPreview').style.display = 'block';
    document.getElementById('logoPreview').src = e.target.result;
    saveToStorage();
  };
  reader.readAsDataURL(file);
}

function renderServices() {
  const container = document.getElementById('servicesContainer');
  container.innerHTML = '';

  const allServices = [...currentState.services, ...currentState.customServices];
  
  allServices.forEach((service, index) => {
    const isCustom = index >= currentState.services.length;
    const serviceElement = createServiceElement(service, index, isCustom);
    container.appendChild(serviceElement);
  });
}

function createServiceElement(service, index, isCustom) {
  const div = document.createElement('div');
  div.className = 'service-item';
  
  const rates = getCurrentRates(service.rates || service.prices);
  
  div.innerHTML = `
    <button class="delete-btn" onclick="deleteService(${index}, ${isCustom})">&times;</button>
    <div class="service-header">
      <div class="service-info">
        <div class="service-name editable" onclick="makeEditable(this, 'service', ${index}, ${isCustom}, 'name')" data-original="${service.name}">${service.name}</div>
        <div class="service-description editable" onclick="makeEditable(this, 'service', ${index}, ${isCustom}, 'description')" data-original="${service.description}">${service.description}</div>
      </div>
    </div>
    <div class="service-controls">
      <div class="tier-selector">
        ${appData.tiers.map((tier, tierIndex) => `
          <button class="tier-btn ${service.selectedTier === tierIndex ? 'active' : ''}" 
                  onclick="selectServiceTier(${index}, ${tierIndex}, ${isCustom})">
            <span class="tier-name editable" onclick="makeEditableTier(this, ${tierIndex})" data-original="${tier}">${tier}</span><br>
           <small>
  <input type="number" min="0" step="0.01"
    value="${service.rates[tierIndex]}"
    onchange="updateTierRate('service', ${index}, ${tierIndex}, this.value, ${isCustom})"
    style="width: 70px;">
  /hr
</small>
          </button>
        `).join('')}
      </div>
      <div class="quantity-controls">
        <label>Hours:</label>
        <button class="quantity-btn" onclick="updateServiceHours(${index}, -0.5, ${isCustom})">-</button>
        <input type="number" class="form-control quantity-input" value="${service.hours}" 
               onchange="setServiceHours(${index}, this.value, ${isCustom})" min="0" step="0.5">
        <button class="quantity-btn" onclick="updateServiceHours(${index}, 0.5, ${isCustom})">+</button>
      </div>
      <div class="quantity-controls">
        <label>Qty:</label>
        <button class="quantity-btn" onclick="updateServiceQuantity(${index}, -1, ${isCustom})">-</button>
        <input type="number" class="form-control quantity-input" value="${service.quantity}" 
               onchange="setServiceQuantity(${index}, this.value, ${isCustom})" min="0">
        <button class="quantity-btn" onclick="updateServiceQuantity(${index}, 1, ${isCustom})">+</button>
      </div>
    </div>
  `;
  
  return div;
}

function renderProducts() {
  const container = document.getElementById('productsContainer');
  container.innerHTML = '';

  const allProducts = [...currentState.products, ...currentState.customProducts];
  
  allProducts.forEach((product, index) => {
    const isCustom = index >= currentState.products.length;
    const productElement = createProductElement(product, index, isCustom);
    container.appendChild(productElement);
  });
}

function createProductElement(product, index, isCustom) {
  const div = document.createElement('div');
  div.className = 'product-item';
  
  const prices = getCurrentRates(product.prices || product.rates);
  
  div.innerHTML = `
    <button class="delete-btn" onclick="deleteProduct(${index}, ${isCustom})">&times;</button>
    <div class="product-header">
      <div class="product-info">
        <div class="product-name editable" onclick="makeEditable(this, 'product', ${index}, ${isCustom}, 'name')" data-original="${product.name}">${product.name}</div>
        <div class="product-description editable" onclick="makeEditable(this, 'product', ${index}, ${isCustom}, 'description')" data-original="${product.description}">${product.description}</div>
      </div>
    </div>
    <div class="product-controls">
      <div class="tier-selector">
        ${appData.tiers.map((tier, tierIndex) => `
          <button class="tier-btn ${product.selectedTier === tierIndex ? 'active' : ''}" 
                  onclick="selectProductTier(${index}, ${tierIndex}, ${isCustom})">
            <span class="tier-name editable" onclick="makeEditableTier(this, ${tierIndex})" data-original="${tier}">${tier}</span><br>
            <small>
  <input type="number" min="0" step="0.01"
    value="${product.prices[tierIndex]}"
    onchange="updateTierRate('product', ${index}, ${tierIndex}, this.value, ${isCustom})"
    style="width: 70px;">
</small>
          </button>
        `).join('')}
      </div>
      <div class="quantity-controls">
        <label>Quantity:</label>
        <button class="quantity-btn" onclick="updateProductQuantity(${index}, -1, ${isCustom})">-</button>
        <input type="number" class="form-control quantity-input" value="${product.quantity}" 
               onchange="setProductQuantity(${index}, this.value, ${isCustom})" min="0">
        <button class="quantity-btn" onclick="updateProductQuantity(${index}, 1, ${isCustom})">+</button>
      </div>
      <div></div>
    </div>
  `;
  
  return div;
}

function makeEditable(element, type, index, isCustom, field) {
  if (element.contentEditable === 'true') return;
  
  element.contentEditable = true;
  element.focus();
  
  // Select all text
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  
  element.addEventListener('blur', function() {
    finishEditing(element, type, index, isCustom, field);
  });
  
  element.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      element.blur();
    }
    if (e.key === 'Escape') {
      element.textContent = element.dataset.original;
      element.blur();
    }
  });
}

function makeEditableTier(element, tierIndex) {
  if (element.contentEditable === 'true') return;
  
  element.contentEditable = true;
  element.focus();
  
  // Select all text
  const range = document.createRange();
  range.selectNodeContents(element);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  
  element.addEventListener('blur', function() {
    finishEditingTier(element, tierIndex);
  });
  
  element.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      element.blur();
    }
    if (e.key === 'Escape') {
      element.textContent = element.dataset.original;
      element.blur();
    }
  });
}

function finishEditing(element, type, index, isCustom, field) {
  element.contentEditable = false;
  element.dataset.original = element.textContent;
  
  // Update the data
  if (type === 'service') {
    if (isCustom) {
      const customIndex = index - currentState.services.length;
      currentState.customServices[customIndex][field] = element.textContent;
    } else {
      currentState.services[index][field] = element.textContent;
    }
  } else if (type === 'product') {
    if (isCustom) {
      const customIndex = index - currentState.products.length;
      currentState.customProducts[customIndex][field] = element.textContent;
    } else {
      currentState.products[index][field] = element.textContent;
    }
  }
  
  saveToStorage();
}

function finishEditingTier(element, tierIndex) {
  element.contentEditable = false;
  element.dataset.original = element.textContent;
  appData.tiers[tierIndex] = element.textContent;
  
  // Re-render to update all tier references
  renderServices();
  renderProducts();
  saveToStorage();
}

// Service functions
function selectServiceTier(index, tier, isCustom) {
  if (isCustom) {
    currentState.customServices[index - currentState.services.length].selectedTier = tier;
  } else {
    currentState.services[index].selectedTier = tier;
  }
  renderServices();
  calculateTotal();
  saveToStorage();
}

function updateServiceHours(index, delta, isCustom) {
  const service = isCustom ? 
    currentState.customServices[index - currentState.services.length] : 
    currentState.services[index];
  
  service.hours = Math.max(0, service.hours + delta);
  renderServices();
  calculateTotal();
  saveToStorage();
}

function setServiceHours(index, value, isCustom) {
  const service = isCustom ? 
    currentState.customServices[index - currentState.services.length] : 
    currentState.services[index];
  
  service.hours = Math.max(0, parseFloat(value) || 0);
  calculateTotal();
  saveToStorage();
}

function updateServiceQuantity(index, delta, isCustom) {
  const service = isCustom ? 
    currentState.customServices[index - currentState.services.length] : 
    currentState.services[index];
  
  service.quantity = Math.max(0, service.quantity + delta);
  renderServices();
  calculateTotal();
  saveToStorage();
}

function setServiceQuantity(index, value, isCustom) {
  const service = isCustom ? 
    currentState.customServices[index - currentState.services.length] : 
    currentState.services[index];
  
  service.quantity = Math.max(0, parseInt(value) || 0);
  calculateTotal();
  saveToStorage();
}

function deleteService(index, isCustom) {
  if (confirm('Are you sure you want to delete this service?')) {
    if (isCustom) {
      currentState.customServices.splice(index - currentState.services.length, 1);
    } else {
      // Actually delete the service from the array
      currentState.services.splice(index, 1);
    }
    renderServices();
    calculateTotal();
    saveToStorage();
  }
}

// Product functions
function selectProductTier(index, tier, isCustom) {
  if (isCustom) {
    currentState.customProducts[index - currentState.products.length].selectedTier = tier;
  } else {
    currentState.products[index].selectedTier = tier;
  }
  renderProducts();
  calculateTotal();
  saveToStorage();
}

function updateProductQuantity(index, delta, isCustom) {
  const product = isCustom ? 
    currentState.customProducts[index - currentState.products.length] : 
    currentState.products[index];
  
  product.quantity = Math.max(0, product.quantity + delta);
  renderProducts();
  calculateTotal();
  saveToStorage();
}

function setProductQuantity(index, value, isCustom) {
  const product = isCustom ? 
    currentState.customProducts[index - currentState.products.length] : 
    currentState.products[index];
  
  product.quantity = Math.max(0, parseInt(value) || 0);
  calculateTotal();
  saveToStorage();
}

function updateTierRate(type, index, tierIndex, value, isCustom) {
  const newValue = parseFloat(value) || 0;
  if (newValue < 0) return;
  if (type === 'service') {
    const arr = isCustom ? currentState.customServices : currentState.services;
    arr[isCustom ? index - currentState.services.length : index].rates[tierIndex] = newValue;
    renderServices();
  } else if (type === 'product') {
    const arr = isCustom ? currentState.customProducts : currentState.products;
    arr[isCustom ? index - currentState.products.length : index].prices[tierIndex] = newValue;
    renderProducts();
  }
  calculateTotal();
  saveToStorage();
}

function deleteProduct(index, isCustom) {
  if (confirm('Are you sure you want to delete this product?')) {
    if (isCustom) {
      currentState.customProducts.splice(index - currentState.products.length, 1);
    } else {
      // Actually delete the product from the array
      currentState.products.splice(index, 1);
    }
    renderProducts();
    calculateTotal();
    saveToStorage();
  }
}

function addCustomService() {
  const name = document.getElementById('customServiceName').value.trim();
  const description = document.getElementById('customServiceDesc').value.trim();
  const simpleRate = parseFloat(document.getElementById('customServiceSimple').value) || 0;
  const standardRate = parseFloat(document.getElementById('customServiceStandard').value) || 0;
  const premiumRate = parseFloat(document.getElementById('customServicePremium').value) || 0;

  if (!name || !description || simpleRate <= 0 || standardRate <= 0 || premiumRate <= 0) {
    alert('Please fill in all fields with valid values');
    return;
  }

  currentState.customServices.push({
    id: 'custom_' + Date.now(),
    name: name,
    description: description,
    rates: [simpleRate, standardRate, premiumRate],
    selectedTier: 0,
    hours: 0,
    quantity: 1,
    isActive: false
  });

  // Clear form
  document.getElementById('customServiceName').value = '';
  document.getElementById('customServiceDesc').value = '';
  document.getElementById('customServiceSimple').value = '';
  document.getElementById('customServiceStandard').value = '';
  document.getElementById('customServicePremium').value = '';

  closeModals();
  renderServices();
  saveToStorage();
}

function addCustomProduct() {
  const name = document.getElementById('customProductName').value.trim();
  const description = document.getElementById('customProductDesc').value.trim();
  const simplePrice = parseFloat(document.getElementById('customProductSimple').value) || 0;
  const standardPrice = parseFloat(document.getElementById('customProductStandard').value) || 0;
  const premiumPrice = parseFloat(document.getElementById('customProductPremium').value) || 0;

  if (!name || !description || simplePrice <= 0 || standardPrice <= 0 || premiumPrice <= 0) {
    alert('Please fill in all fields with valid values');
    return;
  }

  currentState.customProducts.push({
    id: 'custom_' + Date.now(),
    name: name,
    description: description,
    prices: [simplePrice, standardPrice, premiumPrice],
    selectedTier: 0,
    quantity: 0,
    isActive: false
  });

  // Clear form
  document.getElementById('customProductName').value = '';
  document.getElementById('customProductDesc').value = '';
  document.getElementById('customProductSimple').value = '';
  document.getElementById('customProductStandard').value = '';
  document.getElementById('customProductPremium').value = '';

  closeModals();
  renderProducts();
  saveToStorage();
}

function closeModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.style.display = 'none';
  });
}

function getCurrentRates(rates) {
  if (currentState.currency === 'BGN') {
    return rates; // BGN rates are base rates, no conversion needed
  }
  
  const currencyRate = appData.currencies[currentState.currency].rate;
  // Convert BGN to target currency: BGN rate / currency rate
  return rates.map(rate => rate / currencyRate);
}

function calculateTotal() {
  let subtotal = 0;

  // Calculate service costs
  const allServices = [...currentState.services, ...currentState.customServices];
  allServices.forEach(service => {
    if (service.hours > 0 && service.quantity > 0) {
      const rates = getCurrentRates(service.rates);
      const rate = rates[service.selectedTier];
      subtotal += rate * service.hours * service.quantity;
    }
  });

  // Calculate product costs
  const allProducts = [...currentState.products, ...currentState.customProducts];
  allProducts.forEach(product => {
    if (product.quantity > 0) {
      const prices = getCurrentRates(product.prices);
      const price = prices[product.selectedTier];
      subtotal += price * product.quantity;
    }
  });

  // Apply multipliers to the converted rates
  const regionMultiplier = appData.regions[currentState.region].multiplier;
  const complexityMultiplier = appData.complexity[currentState.complexity].multiplier;
  const urgencyMultiplier = appData.urgency[currentState.urgency].multiplier;

  subtotal *= regionMultiplier * complexityMultiplier * urgencyMultiplier;

  // Apply discount
  const discountAmount = subtotal * (currentState.discount / 100);
  subtotal -= discountAmount;

  // Add additional costs
  const total = subtotal + currentState.additionalCosts;

  // Update display
  document.getElementById('subtotalAmount').textContent = formatCurrency(subtotal);
  document.getElementById('totalAmount').textContent = formatCurrency(total);
}

function formatCurrency(amount) {
  const currency = appData.currencies[currentState.currency];
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `${currency.symbol} ${formatted}`;
}

function generateQuote() {
  const quoteContent = createQuoteContent();
  document.getElementById('quoteContent').innerHTML = quoteContent;
  document.getElementById('quoteModal').style.display = 'block';
}

function createQuoteContent() {
  const clientName = document.getElementById('clientName').value;
  const greeting = document.getElementById('quoteGreeting').value.replace('[Client Name]', clientName);
  
  let content = `
    <div class="quote-header">
      ${currentState.logoUrl ? `<img src="${currentState.logoUrl}" alt="Logo" class="quote-logo">` : '<div></div>'}
      <div class="quote-contact">
        <strong>Phone:</strong> ${appData.contact.phone}<br>
        <strong>Email:</strong> ${appData.contact.email}<br>
        <strong>Web:</strong> ${appData.contact.web}
      </div>
    </div>
    
    <h1 class="quote-title">Project Quote</h1>
    
    <div class="quote-section">
      <h3>Client Information</h3>
      <p><strong>${document.getElementById('clientName').value}</strong><br>
      ${document.getElementById('clientCompany').value}<br>
      ${document.getElementById('clientEmail').value}<br>
      ${document.getElementById('clientPhone').value}<br>
      ${document.getElementById('clientAddress').value}</p>
    </div>
    
    <div class="quote-section">
      <p>${greeting}</p>
    </div>
    
    <div class="quote-section">
      <h3>Project Details</h3>
      <p><strong>Duration:</strong> ${document.getElementById('projectDuration').value}</p>
      <p><strong>Complexity:</strong> ${appData.complexity[currentState.complexity].name}</p>
      <p><strong>Timeline:</strong> ${appData.urgency[currentState.urgency].name}</p>
    </div>
  `;

  // Add services
  const activeServices = [...currentState.services, ...currentState.customServices]
    .filter(service => service.hours > 0 && service.quantity > 0);
    
  if (activeServices.length > 0) {
    content += `
      <div class="quote-section">
        <h3>Services</h3>
        <div class="quote-items">
          ${activeServices.map(service => {
            const rates = getCurrentRates(service.rates);
            const baseRate = rates[service.selectedTier];
            
            // Apply all multipliers to get the final adjusted rate
            const regionMultiplier = appData.regions[currentState.region].multiplier;
            const complexityMultiplier = appData.complexity[currentState.complexity].multiplier;
            const urgencyMultiplier = appData.urgency[currentState.urgency].multiplier;
            
            const adjustedRate = baseRate * regionMultiplier * complexityMultiplier * urgencyMultiplier;
            const total = adjustedRate * service.hours * service.quantity;
            
            return `
              <div class="quote-item">
                <div class="item-details">
                  <strong>${service.name}</strong> (${appData.tiers[service.selectedTier]})<br>
                  <small>${service.description}</small>
                </div>
                <div class="item-rate">${formatCurrency(adjustedRate)}/hr</div>
                <div class="item-quantity">${service.hours}h × ${service.quantity}</div>
                <div class="item-total"><strong>${formatCurrency(total)}</strong></div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Add products
  const activeProducts = [...currentState.products, ...currentState.customProducts]
    .filter(product => product.quantity > 0);
    
  if (activeProducts.length > 0) {
    content += `
      <div class="quote-section">
        <h3>Products</h3>
        <div class="quote-items">
          ${activeProducts.map(product => {
            const prices = getCurrentRates(product.prices);
            const basePrice = prices[product.selectedTier];
            
            // Apply all multipliers to get the final adjusted price
            const regionMultiplier = appData.regions[currentState.region].multiplier;
            const complexityMultiplier = appData.complexity[currentState.complexity].multiplier;
            const urgencyMultiplier = appData.urgency[currentState.urgency].multiplier;
            
            const adjustedPrice = basePrice * regionMultiplier * complexityMultiplier * urgencyMultiplier;
            const total = adjustedPrice * product.quantity;
            
            return `
              <div class="quote-item">
                <div class="item-details">
                  <strong>${product.name}</strong> (${appData.tiers[product.selectedTier]})<br>
                  <small>${product.description}</small>
                </div>
                <div class="item-rate">${formatCurrency(adjustedPrice)}</div>
                <div class="item-quantity">${product.quantity}</div>
                <div class="item-total"><strong>${formatCurrency(total)}</strong></div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Calculate totals
  let subtotal = 0;
  [...activeServices, ...activeProducts].forEach(item => {
    const rates = getCurrentRates(item.rates || item.prices);
    const baseRate = rates[item.selectedTier];
    
    const regionMultiplier = appData.regions[currentState.region].multiplier;
    const complexityMultiplier = appData.complexity[currentState.complexity].multiplier;
    const urgencyMultiplier = appData.urgency[currentState.urgency].multiplier;
    
    const adjustedRate = baseRate * regionMultiplier * complexityMultiplier * urgencyMultiplier;
    
    if (item.rates) { // Service
      subtotal += adjustedRate * item.hours * item.quantity;
    } else { // Product
      subtotal += adjustedRate * item.quantity;
    }
  });

  const discountAmount = subtotal * (currentState.discount / 100);
  const finalSubtotal = subtotal - discountAmount;
  const total = finalSubtotal + currentState.additionalCosts;

  content += `
    <div class="quote-totals">
      <div class="total-line">
        <span>Subtotal:</span>
        <span>${formatCurrency(subtotal)}</span>
      </div>
      ${currentState.discount > 0 ? `
        <div class="total-line">
          <span>Discount (${currentState.discount}%):</span>
          <span>-${formatCurrency(discountAmount)}</span>
        </div>
      ` : ''}
      ${currentState.additionalCosts > 0 ? `
        <div class="total-line">
          <span>Additional Costs:</span>
          <span>${formatCurrency(currentState.additionalCosts)}</span>
        </div>
      ` : ''}
      <div class="total-line final">
        <span>Total:</span>
        <span>${formatCurrency(total)}</span>
      </div>
    </div>
  `;

  // Add terms and conditions
  content += `
    <div class="quote-section">
      <h3>Terms and Conditions</h3>
      <pre>${document.getElementById('termsConditions').value}</pre>
    </div>
  `;

  // Add VAT disclaimer if enabled
  if (document.getElementById('vatToggle').checked) {
    content += `
      <div class="quote-section">
        <h3>VAT Information</h3>
        <p>${document.getElementById('vatDisclaimer').value}</p>
      </div>
    `;
  }

  return content;
}

function printQuote() {
  const quoteContent = document.getElementById('quoteContent').innerHTML;
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quote - ${document.getElementById('clientName').value}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
            .quote-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #2cff95; }
            .quote-logo { max-height: 60px; }
            .quote-contact { text-align: right; font-size: 14px; }
            .quote-title { text-align: center; margin: 30px 0; color: #1a1a1a; }
            .quote-section { margin-bottom: 25px; }
            .quote-section h3 { color: #1a1a1a; border-bottom: 1px solid #2cff95; padding-bottom: 5px; margin-bottom: 15px; }
            .quote-item { display: grid; grid-template-columns: 2fr auto auto auto; gap: 15px; padding: 8px 0; border-bottom: 1px solid #eee; align-items: center; }
            .quote-totals { margin-top: 25px; padding-top: 15px; border-top: 2px solid #2cff95; }
            .total-line { display: flex; justify-content: space-between; padding: 5px 0; }
            .total-line.final { font-weight: bold; font-size: 18px; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; }
            pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
        </style>
    </head>
    <body>
        ${quoteContent}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}

function resetAll() {
  if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
    currentState = {
      currency: 'BGN',
      region: 'bulgaria',
      services: [],
      products: [],
      customServices: [],
      customProducts: [],
      complexity: 'standard',
      urgency: 'standard',
      discount: 0,
      additionalCosts: 0,
      logoUrl: null,
      showBaseRates: false
    };
    
    localStorage.removeItem('pricingCalculatorState');
    location.reload();
  }
}

function saveToStorage() {
  // Get form values
  const formData = {
    clientName: document.getElementById('clientName').value,
    clientCompany: document.getElementById('clientCompany').value,
    clientEmail: document.getElementById('clientEmail').value,
    clientPhone: document.getElementById('clientPhone').value,
    clientAddress: document.getElementById('clientAddress').value,
    quoteGreeting: document.getElementById('quoteGreeting').value,
    projectDuration: document.getElementById('projectDuration').value,
    termsConditions: document.getElementById('termsConditions').value,
    vatToggle: document.getElementById('vatToggle').checked,
    vatDisclaimer: document.getElementById('vatDisclaimer').value
  };

  const stateToSave = { ...currentState, formData };
  localStorage.setItem('pricingCalculatorState', JSON.stringify(stateToSave));
}

function loadFromStorage() {
  const savedState = localStorage.getItem('pricingCalculatorState');
  if (!savedState) return;

  try {
    const parsed = JSON.parse(savedState);
    
    // Restore state
    Object.assign(currentState, parsed);
    
    // Restore form values
    if (parsed.formData) {
      Object.keys(parsed.formData).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === 'checkbox') {
            element.checked = parsed.formData[key];
          } else {
            element.value = parsed.formData[key];
          }
        }
      });
    }
    
    // Restore selects
    document.getElementById('currencySelect').value = currentState.currency;
    document.getElementById('regionSelect').value = currentState.region;
    document.getElementById('complexitySelect').value = currentState.complexity;
    document.getElementById('urgencySelect').value = currentState.urgency;
    document.getElementById('discountInput').value = currentState.discount;
    document.getElementById('additionalCosts').value = currentState.additionalCosts;
    document.getElementById('showBaseRates').checked = currentState.showBaseRates;
    
    // Restore logo
    if (currentState.logoUrl) {
      document.getElementById('logoPlaceholder').style.display = 'none';
      document.getElementById('logoPreview').style.display = 'block';
      document.getElementById('logoPreview').src = currentState.logoUrl;
    }
    
  } catch (error) {
    console.error('Error loading saved state:', error);
  }
}

const today = new Date();
const formatted = `${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}`;

// All fields per tab (shared fields + tab-specific)
const sharedFields = [
  'dialerNumber','leadType','callerName','dateSubmitted',
  'address','sellerName','phone','email','callbackTime',
  'condition','motivation','timeline','price',
  'notes','zillowLink','zillowEstimate'
];

const tabFields = {
  house:      ['house-propertyType','house-beds','house-baths','house-sqft','house-occupancy'],
  land:       ['land-type','land-sqft','land-utils'],
  commercial: ['comm-type','comm-sqft','comm-occupancy','comm-utils','comm-condition']
};

let currentTab = 'house';

// --- TAB SWITCHING ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const name = tab.dataset.tab;
    switchTab(name);
  });
});

function switchTab(name) {
  currentTab = name;

  // Update tab highlight
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));

  // Show correct property section
  document.querySelectorAll('.prop-section').forEach(s => s.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');

  // Hide condition pillar for land and commercial
  const conditionField = document.getElementById('condition').closest('.field');
  const hideCondition = (name === 'commercial' || name === 'land');
  conditionField.style.display = hideCondition ? 'none' : 'flex';

  // Update pillar numbering based on whether condition is shown
  const motivationLabel = document.querySelector('label[for="motivation"], #motivation').closest('.field').querySelector('label');
  const timelineLabel = document.querySelector('label[for="timeline"], #timeline').closest('.field').querySelector('label');
  const priceLabel = document.querySelector('label[for="price"], #price').closest('.field').querySelector('label');

  if (hideCondition) {
    motivationLabel.textContent = '1) Motivation / Reason for Selling';
    timelineLabel.textContent = '2) Timeline';
    priceLabel.textContent = '3) Price';
  } else {
    motivationLabel.textContent = '2) Motivation / Reason for Selling';
    timelineLabel.textContent = '3) Timeline';
    priceLabel.textContent = '4) Price';
  }

  // Save active tab
  chrome.storage.local.set({ activeTab: name });
}

// --- LOAD SAVED DATA ---
const allFields = [...sharedFields, ...tabFields.house, ...tabFields.land, ...tabFields.commercial];

chrome.storage.local.get(['activeTab', ...allFields], (saved) => {
  // Restore tab
  const tab = saved.activeTab || 'house';
  switchTab(tab);

  // Restore field values
  allFields.forEach(id => {
    const el = document.getElementById(id);
    if (el && saved[id]) el.value = saved[id];
  });

  // Always override these
  document.getElementById('callerName').value = 'Ray Asher';
  document.getElementById('dateSubmitted').value = formatted;
  chrome.storage.local.set({ callerName: 'Ray Asher', dateSubmitted: formatted });
});

// --- SAVE ON INPUT ---
allFields.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => {
      chrome.storage.local.set({ [id]: el.value });
    });
  }
});

// --- COPY ---
document.getElementById('copyBtn').addEventListener('click', () => {
  const v = (id) => {
    const el = document.getElementById(id);
    return el ? (el.value.trim() || '—') : '—';
  };

  let propDetails = '';

  if (currentTab === 'house') {
    propDetails = `Property Type: ${v('house-propertyType')}
Bed Count: ${v('house-beds')}
Bath Count: ${v('house-baths')}
Sqft: ${v('house-sqft')}
Occupancy: ${v('house-occupancy')}`;
  } else if (currentTab === 'land') {
    propDetails = `Land Type: ${v('land-type')}
Sqft / Acreage: ${v('land-sqft')}
Utilities Available: ${v('land-utils')}`;
  } else if (currentTab === 'commercial') {
    propDetails = `Type of Business / Property: ${v('comm-type')}
Sqft: ${v('comm-sqft')}
Occupancy: ${v('comm-occupancy')}
Utilities Available: ${v('comm-utils')}
Condition: ${v('comm-condition')}`;
  }

  const includeCondition = currentTab !== 'commercial' && currentTab !== 'land';

  let pillarsText;
  if (includeCondition) {
    pillarsText = `1) Condition: ${v('condition')}
2) Motivation/ Reason for selling: ${v('motivation')}
3) Timeline: ${v('timeline')}
4) Price: ${v('price')}`;
  } else {
    pillarsText = `1) Motivation/ Reason for selling: ${v('motivation')}
2) Timeline: ${v('timeline')}
3) Price: ${v('price')}`;
  }

  const text = `Dialer number: ${v('dialerNumber')}
Lead Type: ${v('leadType')}
Cold Caller Name: ${v('callerName')}
Date Submitted: ${v('dateSubmitted')}
Address: ${v('address')}
Seller's Full Name: ${v('sellerName')}
Phone: ${v('phone')}
Email: ${v('email')}
Best time for a callback: ${v('callbackTime')}
${propDetails}
4 PILLARS
${pillarsText}
Additional Notes: ${v('notes')}
Zillow Link: ${v('zillowLink')}
Zillow Estimate: ${v('zillowEstimate')}`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Copied to clipboard!');
  });
});

// --- CLEAR (only current tab's specific fields + shared) ---
document.getElementById('clearBtn').addEventListener('click', () => {
  const fieldsToClear = [...sharedFields, ...tabFields[currentTab]];
  fieldsToClear.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Restore fixed defaults
  document.getElementById('callerName').value = 'Ray Asher';
  document.getElementById('dateSubmitted').value = formatted;

  // Clear from storage
  chrome.storage.local.remove(fieldsToClear, () => {
    chrome.storage.local.set({ callerName: 'Ray Asher', dateSubmitted: formatted });
  });

  showToast('Tab cleared!');
});

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

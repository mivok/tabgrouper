// vim: sw=2 sts=2 et

// List of short names for options
const options = [
  {
    name: 'ignore_already_grouped',
    description: 'Ignore tabs that are already in a tab group',
    default: true,
  },
];

const rulesTextbox = document.getElementById('rules');

function loadRules() {
  chrome.storage.sync.get(['rules'], (result) => {
    if (result.rules) {
      rulesTextbox.value = result.rules;
    }
  });
}

function saveRules() {
  chrome.storage.sync.set({ rules: rulesTextbox.value });
}

function showMessage(message) {
  const messageDiv = document.getElementById('message');
  messageDiv.innerText = message;
  messageDiv.style.display = 'block';
  setTimeout(() => {
    messageDiv.innerText = '';
    messageDiv.style.display = 'none';
  }, 3000);
}

function handleOptionToggle(e) {
  const optionName = e.target.id;
  const optionValue = e.target.checked;
  // Save the value
  chrome.storage.sync.set({ [optionName]: optionValue });
  showMessage('Settings saved');
}

function setupOptions() {
  const optionNames = options.map((o) => o.name);
  const optionsDiv = document.getElementById('options');
  chrome.storage.sync.get(optionNames, (optionValues) => {
    options.forEach((option) => {
      const optionElement = document.createElement('div');

      // Checkbox
      const c = document.createElement('input');
      c.type = 'checkbox';
      c.id = option.name;
      if (optionValues[option.name] === undefined) {
        c.checked = option.default;
      } else {
        c.checked = optionValues[option.name];
      }
      c.addEventListener('click', handleOptionToggle);

      // Label
      const l = document.createElement('label');
      l.for = option.name;
      l.innerText = option.description;

      optionElement.appendChild(c);
      optionElement.appendChild(l);
      optionsDiv.appendChild(optionElement);
    });
  });
}

document.getElementById('revertButton').addEventListener('click', () => {
  loadRules();
  showMessage('Reverted changes');
});

document.getElementById('saveButton').addEventListener('click', () => {
  saveRules();
  showMessage('Applied updated rules');
});

loadRules();
setupOptions();

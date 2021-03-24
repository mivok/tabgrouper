// vim: sw=2 sts=2 et

// List of short names for options
const optionDefinitions = [
  {
    name: 'ignore_already_grouped',
    description: 'Ignore tabs that are already in a tab group',
    default: true,
  },
  {
    name: 'show_debug_logs',
    description: 'Enable debug logging',
    default: false,
  },
];

// Actual option values
const options = {};

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
  options[optionName] = optionValue;
  showMessage('Settings saved');
}

function setupOptions() {
  const optionNames = optionDefinitions.map((o) => o.name);
  const optionsDiv = document.getElementById('options');
  chrome.storage.sync.get(optionNames, (optionValues) => {
    optionDefinitions.forEach((option) => {
      const optionElement = document.createElement('div');

      // Checkbox
      const c = document.createElement('input');
      c.type = 'checkbox';
      c.id = option.name;
      if (optionValues[option.name] === undefined) {
        options[option.name] = option.default;
      } else {
        options[option.name] = optionValues[option.name];
      }
      c.checked = options[option.name];
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

function toggleLog() {
  const log = document.getElementById('log');
  const logButton = document.getElementById('logButton');
  if (log.classList.contains('hidden')) {
    // Show log
    chrome.storage.local.get('log', (result) => {
      if (result.log !== undefined) {
        log.value = result.log
          .filter((e) => e.level !== 'debug' || options.show_debug_logs)
          .map((e) => `${e.date} ${e.level.toUpperCase()}: ${e.message}`)
          .join('\n');
      } else {
        log.value = '';
      }
      log.classList.remove('hidden');
      logButton.innerText = 'Hide log';
    });
  } else {
    // Hide log
    log.classList.add('hidden');
    logButton.innerText = 'Show log';
  }
}

function clearLog() {
  chrome.storage.local.set({ log: [] });
  document.getElementById('log').value = '';
}

document.getElementById('revertButton').addEventListener('click', () => {
  loadRules();
  showMessage('Reverted changes');
});

document.getElementById('saveButton').addEventListener('click', () => {
  saveRules();
  showMessage('Applied updated rules');
});

document.getElementById('logButton').addEventListener('click', () => {
  toggleLog();
});

document.getElementById('clearLogButton').addEventListener('click', () => {
  clearLog();
});

loadRules();
setupOptions();

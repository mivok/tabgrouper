// List of short names for options
const options = [
    {
        'name': 'ignore_already_grouped',
        'description': 'Ignore tabs that are already in a tab group',
        'default': true,
    },
]

const rules_textbox = document.getElementById('rules');

function loadRules() {
    chrome.storage.sync.get(['rules'], (result) => {
        if (result.rules) {
            rules_textbox.value = result.rules;
        }
    });
}

function saveRules() {
    chrome.storage.sync.set({rules: rules_textbox.value})
}

function showMessage(message) {
    const message_div = document.getElementById('message');
    message_div.innerText = message;
    message_div.style.display = 'block'
    setTimeout(() => {
        message_div.innerText = '';
        message_div.style.display = 'none';
    }, 3000);
}

function handleOptionToggle(e) {
    const option_name = e.target.id;
    const option_value = e.target.checked;
    // Save the value
    chrome.storage.sync.set({[option_name]: option_value});
    showMessage("Settings saved");
}

function setupOptions() {
    const option_names = options.map(o => o.name)
    const optionsDiv = document.getElementById('options');
    chrome.storage.sync.get(option_names, (option_values) => {
        for (let option of options) {
            const optionElement = document.createElement('div');

            // Checkbox
            const c = document.createElement('input');
            c.type = 'checkbox';
            c.id = option.name;
            if (option_values[option.name] == undefined) {
                c.checked = option.default;
            } else {
                c.checked = option_values[option.name];
            }
            c.addEventListener('click', handleOptionToggle)

            // Label
            const l = document.createElement('label');
            l.for = option.name;
            l.innerText = option.description;

            optionElement.appendChild(c);
            optionElement.appendChild(l);
            optionsDiv.appendChild(optionElement);
        }
    });
}

document.getElementById('revertButton').addEventListener('click', () => {
    loadRules();
    showMessage("Reverted changes");
});

document.getElementById('saveButton').addEventListener('click', () => {
    saveRules();
    showMessage("Applied updated rules");
});

loadRules();
setupOptions();

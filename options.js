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

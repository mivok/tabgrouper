var rules = [];

// From https://developer.chrome.com/docs/extensions/reference/tabGroups/#type-Color
const valid_colors = [
    "grey",
    "blue",
    "red",
    "yellow",
    "green",
    "pink",
    "purple",
    "cyan",
]

function parseRules(rulesText) {
    rules = [];
    for (const line of rulesText.split("\n")) {
        // # denotes comments
        if (line.startsWith("#")) { continue }

        // Skip blank lines too
        if (line == "") { continue }

        // Whitespace separated pattern, group Name, color
        let [pattern, groupName, color] = line.split(/\s+/)

        // Check for a valid color, if specified
        if (color && !valid_colors.includes(color)) {
            console.log(`Invalid color: ${color}`);
            // Treat invalid colors as if they were unspecified
            color = undefined
        }

        // Make sure we have a valid pattern/name and skip if not
        if (!pattern || !groupName) {
            console.log(`Invalid rule (missing pattern or group name): ${rule}`)
            continue
        }

        rules.push({pattern, groupName, color})
    }
}

function addTabToGroup(tab, groupName, groupColor) {
    chrome.tabGroups.query({
        title: groupName,
        windowId: tab.windowId
    }, (groups) => {
        if (groups.length > 0) {
            // The group exists, put the tab into it
            chrome.tabs.group({
                groupId: groups[0].id,
                tabIds: tab.id,
            })
        } else {
            // We need to make a new group
            chrome.tabs.group({
                tabIds: tab.id,
                createProperties: {
                    windowId: tab.windowId,
                },
            }, (groupId) => {
                chrome.tabGroups.update(groupId, {
                    title: groupName,
                    color: groupColor,
                })
            })
        }
    });
}

chrome.storage.sync.get(['rules'], (result) => {
    if (result.rules) {
        parseRules(result.rules);
    }
});

// Update the rules if they are changed (e.g. through the options page)
chrome.storage.onChanged.addListener((changes) => {
    if (changes.rules?.newValue) {
        parseRules(changes.rules.newValue)
    }
})

// TODO - look to see if a webNavigation event can be used instead? This would
// allow event filters to be added based on the URL patterns that are
// configured.
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    // Look for if the URL changed
    if (changeInfo.url) {
        // Skip pinned tabs
        if (tab.pinned) { return }

        // Skip tabs already in a group
        if (tab.groupId != -1) { return }

        // Check for a pattern match
        for (const r of rules) {
            if (changeInfo.url.match(r.pattern)) {
                addTabToGroup(tab, r.groupName, r.color)
                break
            }
        }
    }
});

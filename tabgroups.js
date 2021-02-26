patterns = [
    {
        'pattern': 'atlassian.net/wiki',
        'groupName': 'Confluence',
        // Atlassian blue
        'color': 'blue',
    },
    {
        'pattern': 'atlassian.net',
        'groupName': 'Jira',
        // Atlassian blue
        'color': 'blue',
    },
    {
        'pattern': '^https?://www\.example\.com',
        'groupName': 'Example',
        'color': 'green',
    }
]

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

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    // Look for if the URL changed
    if (changeInfo.url) {
        // Skip pinned tabs
        if (tab.pinned) { return }

        // Skip tabs already in a group
        if (tab.groupId != -1) { return }

        // Check for a pattern match
        for (const p of patterns) {
            if (changeInfo.url.match(p.pattern)) {
                addTabToGroup(tab, p.groupName, p.color)
                break
            }
        }
    }
});

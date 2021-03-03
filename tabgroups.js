var rules = [];

var options = {};

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
        // # or ! denotes comments
        if (line.startsWith("#")) { continue }
        if (line.startsWith("!")) { continue }

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

        rules.push({
            pattern,
            regexp: patternToRegexp(pattern),
            groupName,
            color
        })
    }
    console.log("Updated rules")
    console.log(rules)
}

function patternToRegexp(pattern) {
    // Checks to see if the given URL matches the pattern we provided

    // First check to see if the pattern is a regexp (starts/ends with a
    // slash) and just strip the slashes if it is.
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
        return new RegExp(pattern.slice(1,-1))
    }

    // Otherwise, it's a regular pattern. Convert it to a regex and then
    // return it.

    // First, escape the pattern. This means all checks below that contain
    // special characters (e.g. starts with ||) need to look for already
    // escaped values.
    let regex_pattern = pattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');;

    // Deal with pipes at the beginning/end
    if (regex_pattern.startsWith('\\|\\|')) {
        // || is a substitute for http(s)://*
        regex_pattern = '^https?://([^/:#?]+\\.)?' + regex_pattern.slice(4)
    } else if (regex_pattern.startsWith('\\|')) {
        // | is an anchor at the beginning
        regex_pattern = '^' + regex_pattern.slice(2)
    }
    if (regex_pattern.endsWith('\\|')) {
        // | is an anchor at the end too
        regex_pattern = regex_pattern.slice(0,-2) + '$'
    }

    // Deal with asterisks (wildcards)
    regex_pattern = regex_pattern.replace(/\\\*/g, '.*')

    // Deal with ^ as a separator character
    regex_pattern = regex_pattern.replace(/\\\^/g, '([^0-9a-zA-Z_.%-]|$)')

    return new RegExp(regex_pattern)
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

// Load options/rules
chrome.storage.sync.get(null, (result) => {
    Object.keys(result).forEach((key) => {
        if (key == 'rules') {
            parseRules(result.rules);
        } else {
            // Anything else in storage is an option
            options[key] = result[key]
        }
    });
});

// Update options/rules if they are changed (e.g. through the options page)
chrome.storage.onChanged.addListener((changes) => {
    Object.keys(changes).forEach((key) => {
        if (key == 'rules') {
            if (changes.rules.newValue) {
                parseRules(changes.rules.newValue)
            }
        } else {
            // Anything else in storage is an option
            options[key] = changes[key].newValue
        }
    })
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
        if (options.ignore_already_grouped && tab.groupId != -1) {
            return
        }

        // Check for a pattern match
        for (const r of rules) {
            if (r.regexp.test(changeInfo.url)) {
                addTabToGroup(tab, r.groupName, r.color)
                break
            }
        }
    }
});

// vim: sw=2 sts=2 et

let rules = [];

const options = {};

// From https://developer.chrome.com/docs/extensions/reference/tabGroups/#type-Color
const validColors = [
  'grey',
  'blue',
  'red',
  'yellow',
  'green',
  'pink',
  'purple',
  'cyan',
];

function patternToRegexp(pattern) {
  // Checks to see if the given URL matches the pattern we provided

  // First check to see if the pattern is a regexp (starts/ends with a
  // slash) and just strip the slashes if it is.
  if (pattern.startsWith('/') && pattern.endsWith('/')) {
    return new RegExp(pattern.slice(1, -1));
  }

  // Otherwise, it's a regular pattern. Convert it to a regex and then
  // return it.

  // First, escape the pattern. This means all checks below that contain
  // special characters (e.g. starts with ||) need to look for already
  // escaped values.
  let regexPattern = pattern.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

  // Deal with pipes at the beginning/end
  if (regexPattern.startsWith('\\|\\|')) {
    // || is a substitute for http(s)://*
    regexPattern = `^https?://([^/:#?]+\\.)?${regexPattern.slice(4)}`;
  } else if (regexPattern.startsWith('\\|')) {
    // | is an anchor at the beginning
    regexPattern = `^${regexPattern.slice(2)}`;
  }
  if (regexPattern.endsWith('\\|')) {
    // | is an anchor at the end too
    regexPattern = `${regexPattern.slice(0, -2)}$`;
  }

  // Deal with asterisks (wildcards)
  regexPattern = regexPattern.replace(/\\\*/g, '.*');

  // Deal with ^ as a separator character
  regexPattern = regexPattern.replace(/\\\^/g, '([^0-9a-zA-Z_.%-]|$)');

  return new RegExp(regexPattern);
}

function parseRules(rulesText) {
  rules = [];
  rulesText.split('\n').forEach((line) => {
    // # or ! denotes comments
    if (line.startsWith('#')) { return; }
    if (line.startsWith('!')) { return; }

    // Skip blank lines too
    if (line === '') { return; }

    // Whitespace separated pattern, group Name, color
    const parts = line.split(/\s+/);
    const [pattern, groupName] = parts;
    let [, , color] = parts;

    // Check for a valid color, if specified
    if (color && !validColors.includes(color)) {
      console.log(`Invalid color: ${color}`);
      // Treat invalid colors as if they were unspecified
      color = undefined;
    }

    // Make sure we have a valid pattern/name and skip if not
    if (!pattern || !groupName) {
      console.log(`Invalid rule (missing pattern or group name): ${pattern}`);
      return;
    }

    rules.push({
      pattern,
      regexp: patternToRegexp(pattern),
      groupName,
      color,
    });
  });
  console.log('Updated rules');
  console.log(rules);
}

function addTabToGroup(tab, groupName, groupColor) {
  chrome.tabGroups.query({
    title: groupName,
    windowId: tab.windowId,
  }, (groups) => {
    if (groups.length > 0) {
      // The group exists, put the tab into it
      chrome.tabs.group({
        groupId: groups[0].id,
        tabIds: tab.id,
      });
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
        });
      });
    }
  });
}

// Load options/rules
chrome.storage.sync.get(null, (result) => {
  Object.keys(result).forEach((key) => {
    if (key === 'rules') {
      parseRules(result.rules);
    } else {
      // Anything else in storage is an option
      options[key] = result[key];
    }
  });
});

// Update options/rules if they are changed (e.g. through the options page)
chrome.storage.onChanged.addListener((changes) => {
  Object.keys(changes).forEach((key) => {
    if (key === 'rules') {
      if (changes.rules.newValue) {
        parseRules(changes.rules.newValue);
      }
    } else {
      // Anything else in storage is an option
      options[key] = changes[key].newValue;
    }
  });
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  // Look for if the URL changed
  if (changeInfo.url) {
    // Skip pinned tabs
    if (tab.pinned) { return; }

    // Skip tabs already in a group
    if (options.ignore_already_grouped && tab.groupId !== -1) {
      return;
    }

    // Check for a pattern match
    const match = rules.find((r) => r.regexp.test(changeInfo.url));
    if (match) {
      addTabToGroup(tab, match.groupName, match.color);
    }
  }
});

# Tab grouper

[![Available in the Chrome Web Store](images/webstore_badge.png)](https://chrome.google.com/webstore/detail/tab-grouper/cejjplkmdfnnlmphbhpbnfmkhkknnokg)

Automatically manage your tab groups in chrome based on the websites you visit and rules you define.

Tab grouper lets you create rules for each website saying which URL pattern to
match, the name of the tab group, and optionally a color, and the extension
will add matching websites to the appropriate tab groups as you browse to
them. For example, you could have all jira tickets in a single group, all
amazon pages in another, and all google search results in another.

## Creating rules

Before you use this extension, you need to create a set of rules for which
sites to group into which tabs. Go to the extension options, and there is a
textbox where you can add the list of rules.

Here are some examples of rules:

```
||google.com Google grey
||example.atlassian.net "Company JIRA" blue
||unnamed.example.com ""
```

The first example groups all google web pages (anything at google.com) in a tab
group called "Google" and colors the tab group grey.

The last example creates an unnamed tab group using empty quotes. It will also
have a default color assigned as none was specified.

Rules consist of a pattern (the `||google.com` part), the name of the tab
group to group matching tabs under, and an optional color for the tab group to
have when tabs are first grouped together by the extension. If you leave the
color off, the group color will be set automatically, which usually means the
tab group will be colored Grey.

The list of valid colors are: grey, blue, red, yellow, green, pink, purple,
and cyan.

## Pattern format

If you just want to group sites together by domain, the above example is
probably all you need, put `||` before the domain you want to group together
and add the name and color of the tab group afterwards. For simple domain
based grouping this is all you need.

The pattern format is based off of that used by adblocking tools in their
rulesets. You can see some details of the pattern format at: <https://kb.adguard.com/en/general/how-to-create-your-own-ad-filters#basic-rules-syntax>. As we only match on URLs and don't look for elements on the page, only the basic rule syntax that specifies whole web pages is used.

The pattern format is as follows:

* Any text given must appear somewhere in the URL. So `google.com` would match
  `https://google.com/` as well as
  `https://www.mysite.com/something/google.com.html`.
* If `||` is at the beginng of a pattern, then the text given matches the
  URL's domain. Subdomains also match, as do http and https. So `||google.com`
  will match http://google.com/, https://www.google.com/, and
  https://chrome.google.com/, but not https://example.com/google.com.
* A single pipe character (`|`) can be placed at the beginning or end of a
  pattern to match the beginning or end of the URL. In other words, a pipe at
  the beginning means that the text must appear at the beginning of the URL
  (including any `https://` at the beginning). So `|https://www.google.com/|`
  will only match the exact URL https://www.google.com/ and nothing else.
* Asterisks (`*`) are wildcards, and will match any text.
* A caret (`^`) is considered a separator character. It matches anything that
  isn't a number, letter or one of the characters `_`, `-`, `.`, `%`. It also
  matches the end of the URL.

You can also match URLs based on regular expressions. To do this, surround your
pattern with `/`. For example `/^https?://google.com/?$/`. You don't need to
escape slashes inside the regular expression.

## Temporarily disabling automatic tab grouping

If you want to stop automatically grouping tabs temporarily, click on the
extension's icon. The icon will then show "Off" in a badge to show that
automatic tab grouping is disabled. Clicking the icon again will re-enable
automatic grouping.

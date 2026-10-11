# Assistive-technology test matrix

Manual test record for the widget's own interface. Automated tests (axe-core, keyboard scripts) run in
CI; this file records what only people with real assistive technology can check. An ACR / VPAT for the
widget is based on these results, so record a full round before each major release.

**Result values:** `Pass` · `Fail` (link the issue) · `Partial` (explain in Notes) · `Not tested`.
Never mark a cell from an automated tool or from reading the code.

## Scenarios

| # | Scenario | What to check |
| --- | --- | --- |
| S1 | Open and close | Launcher name and "adjustments are on" state; `Alt+A`; dialog announced with its title; Escape and close button; focus returns to the launcher |
| S2 | Stay inside the dialog | Tab, Shift+Tab **and** the virtual cursor / swipe navigation stay in the panel and in read mode |
| S3 | Profiles | Card name (title + description) and pressed state; toggling announces the change |
| S4 | Sections | Accordion expanded/collapsed state; active count |
| S5 | Switches and radio groups | `switch` on/off; radio group name, arrow keys, selected state |
| S6 | Steppers | Name, value, "maximum"/"minimum" announcement, disabled state at limits |
| S7 | Colors | Color inputs are named; the low-contrast warning is announced and read as the input's description |
| S8 | Language menu | Change language; focus stays on the menu; the panel is read in the new language and direction |
| S9 | Read mode | Opens as a dialog; content is read in the page's language; links work; close returns focus |
| S10 | Hide widget | Announcement includes the shortcut; the shortcut brings the widget back |
| S11 | Zoom and reflow | 200% and 400% browser zoom; 320 CSS px width; no loss of content or function |
| S12 | Forced colors | Windows contrast themes: every control, state and focus outline visible |

## Rounds

Add one table per round, newest first.

### Round: _version, date, tester_

| AT + browser + OS | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | S12 | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NVDA + Firefox (Windows) | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | – | – | |
| NVDA + Chrome (Windows) | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | – | – | |
| JAWS + Chrome (Windows) | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | – | – | |
| Narrator + Edge (Windows) | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | – | – | |
| VoiceOver + Safari (macOS) | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | – | – | |
| VoiceOver + Safari (iOS) | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | – | – | |
| TalkBack + Chrome (Android) | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | – | – | |
| Voice Control / Dragon (speech input) | Not tested | – | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | – | – | – | Say the visible names |
| Keyboard only, Firefox | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | – | |
| Keyboard only, Safari | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | Not tested | – | |
| Windows contrast theme, Edge | – | – | – | – | – | – | – | – | – | – | – | Not tested | |

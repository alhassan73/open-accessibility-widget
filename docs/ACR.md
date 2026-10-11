# Accessibility Conformance Report — Open Accessibility Widget

**International Edition, based on VPAT® Version 2.5 INT** (VPAT is a registered service mark of the
Information Technology Industry Council, ITI).

> **Status: DRAFT, not a final conformance claim.** Automated and code evidence is filled in. The manual
> assistive-technology round in [`at-test-matrix.md`](./at-test-matrix.md) has not been recorded yet, so
> every result that depends on it is marked **Pending**. Pending is not a VPAT conformance level. This report
> becomes final when each Pending is replaced with a VPAT level, based on recorded manual results, and the
> status line above changes.

## Product information

| | |
| --- | --- |
| **Name of product / version** | Open Accessibility Widget (`open-accessibility-widget`), 1.3.1 plus the unreleased changes on `main` as of the report date |
| **Report date** | 2026-10-12 (draft) |
| **Product description** | A preferences menu that websites embed (launcher button, settings panel, language menu, read mode). Visitors use it to change how a page looks for themselves. |
| **Scope of this report** | **Only the widget's own interface**: the launcher, the skip link it adds, the panel, the language menu, read mode, the reading aids it draws, and its announcements. **Out of scope:** the websites it is installed on. The widget does **not** make a website conform to WCAG, EN 301 549 or Section 508, and this report says nothing about any website. |
| **Contact** | Issues: https://github.com/alhassan73/open-accessibility-widget/issues (label `accessibility`) |
| **Notes** | Tested in its default theme (light and dark `colorScheme`). A site that sets its own `theme` colors is responsible for their contrast. The widget logs a console warning when a theme pair is below 4.5:1 (`src/widget.ts`, `warnOnLowContrast`). |
| **Evaluation methods used** | (1) Automated: axe-core 4.14 on the panel, the open language menu, read mode and the dark panel, plus scripted keyboard, focus, reflow, forced-colors, reduced-motion and strict-CSP tests in headless Chrome. All run in CI on every commit and release (`test/widget.e2e.test.mjs`; test names quoted below). (2) Code review against each success criterion. (3) Manual assistive-technology testing (NVDA, JAWS, Narrator, VoiceOver macOS/iOS, TalkBack, speech input, keyboard in Firefox/Safari, Windows contrast themes, 200%/400% zoom): **Pending**, see [`at-test-matrix.md`](./at-test-matrix.md). |

## Applicable standards / guidelines

| Standard / guideline | Included in report |
| --- | --- |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Level A: Yes · Level AA: Yes · Level AAA: No |
| [EN 301 549 V3.2.1 (2021-03)](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf) | Yes |
| [Revised Section 508 standards (2017)](https://www.access-board.gov/ict/) | Yes |

## Terms

- **Supports:** the functionality meets the criterion without known defects, or meets it with equivalent facilitation.
- **Partially Supports:** some functionality does not meet the criterion.
- **Does Not Support:** the majority of functionality does not meet the criterion.
- **Not Applicable:** the criterion is not relevant to the product.
- **Pending (draft only):** waiting for the manual round. Not a VPAT conformance level.

Evidence keys: **T:** an automated test in `test/widget.e2e.test.mjs` (by name). **C:** code. **S#:** a manual scenario in the AT matrix that must confirm the result before this report is final.

## WCAG 2.2 report

Also covers EN 301 549 Chapter 9 (Web, clauses 9.1–9.4 = WCAG success criteria) and Section 508 Chapter 5 (501.1) / Chapter 7 (702.10.1), which point to WCAG for web content.

### Table 1: Level A

| Criteria | Conformance level | Remarks and explanations |
| --- | --- | --- |
| 1.1.1 Non-text Content | Supports | Icons are decorative SVGs (`aria-hidden`); every icon-only button has an accessible name (launcher, close, language). T: "axe-core: no violations in the panel or read mode". Read mode labels images by their alt text (C: `extractReadableContent`). Confirm: S1, S9. |
| 1.2.1 Audio-only and Video-only (Prerecorded) | Not Applicable | The widget has no media. |
| 1.2.2 Captions (Prerecorded) | Not Applicable | No media. |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | Not Applicable | No media. |
| 1.3.1 Info and Relationships | Supports | Modal dialog with a heading, accordion buttons with `aria-expanded`, radio groups, switches, profile toggle buttons, and the listbox are all programmatic. T: axe-core; "language menu: custom listbox with keyboard, Escape and pointer". Confirm: S3–S5, S8. |
| 1.3.2 Meaningful Sequence | Supports | DOM order matches the visual order, in left-to-right and right-to-left. C: `src/widget/ui.ts`. Confirm: S2. |
| 1.3.3 Sensory Characteristics | Supports | No instruction relies on shape, position or sound. |
| 1.4.1 Use of Color | Supports | Selected and on states also show a check badge, an inset ring, the switch knob position, or a filled segment. T: "selected option has a visible, high-contrast state"; "color filters are off in forced-colors mode". |
| 1.4.2 Audio Control | Not Applicable | The widget plays no audio. Its "Mute media" setting helps visitors with the page's audio. |
| 2.1.1 Keyboard | Supports | Every control works with Tab, Enter, Space and arrows; `Alt+A` toggles the panel. T: "keyboard: skip link, open, focus trap, arrow keys, Escape"; "language menu: …". Confirm: S1–S8, keyboard rows. |
| 2.1.2 No Keyboard Trap | Supports | The modal panel and read mode keep focus inside on purpose; Escape and the close button leave them, and focus returns to the launcher. T: "keyboard: …". |
| 2.1.4 Character Key Shortcuts | Supports | The only shortcut uses a modifier (`Alt+A`). Site owners can change it or turn it off (`shortcut: false`). It never consumes typed characters. T: "shortcut never swallows typed characters (macOS Option+A = å)". Listbox type-ahead works only while the listbox has focus. |
| 2.2.1 Timing Adjustable | Not Applicable | No time limits. |
| 2.2.2 Pause, Stop, Hide | Supports | Only short transitions (under 1 s) that stop on their own; nothing auto-updates. All motion is off with `prefers-reduced-motion`. T: "the widget's own motion follows prefers-reduced-motion". |
| 2.3.1 Three Flashes or Below Threshold | Supports | Nothing flashes. C: `src/engine/css.ts`. |
| 2.4.1 Bypass Blocks | Supports | The widget adds a "Skip to main content" link when the page has a target. Its own launcher is one tab stop. T: "skip link: only with a target, prefers <main>, leaves no tabindex". |
| 2.4.2 Page Titled | Not Applicable | A component, not a page. The panel and read mode dialogs are labelled by their headings. |
| 2.4.3 Focus Order | Supports | Opening moves focus to the close button. Order follows the panel layout. Closing returns focus to the launcher. The page behind dialogs is `inert`. T: "keyboard: …"; "open dialogs make the page behind them inert, and restore it". Confirm: S1, S2. |
| 2.4.4 Link Purpose (In Context) | Supports | The only link is "Accessibility statement". Its text states its purpose. |
| 2.5.1 Pointer Gestures | Supports | Single taps and clicks only. No path-based or multipoint gestures. |
| 2.5.2 Pointer Cancellation | Supports | Controls activate on click (the up event). A press outside closes the panel on the down event; this is reversible: reopening restores the panel with every setting kept (the "Abort or Undo" option). |
| 2.5.3 Label in Name | Supports | Accessible names start with, or equal, the visible text. Profile cards are named by their title and description. T: axe-core assertion `page.ax(".a11yw-profile")`. Icon-only buttons have no visible label. Confirm: speech-input row. |
| 2.5.4 Motion Actuation | Not Applicable | No device-motion input. |
| 3.1.1 Language of Page | Supports | The widget root carries the active language's `lang` and `dir`. T: "the optional language pack works with the script build (French, Hebrew right-to-left)". |
| 3.2.1 On Focus | Supports | Focus never changes the context. Arrowing through languages doesn't switch the language. T: "language menu: …". |
| 3.2.2 On Input | Supports | Settings change only the visitor's own view, which is the purpose of the control. Language changes only on an explicit choice (Enter, Space or click). |
| 3.2.6 Consistent Help | Not Applicable | The widget offers no help mechanism. The statement link always sits in the same place, in the footer. |
| 3.3.1 Error Identification | Not Applicable | No input can be in error. The custom-color contrast note is advice, not an error. |
| 3.3.2 Labels or Instructions | Supports | Steppers, color inputs, radio groups and switches have visible labels and programmatic names. T: axe-core; "custom colors with low contrast show a warning". Confirm: S6, S7. |
| 3.3.7 Redundant Entry | Not Applicable | No multi-step process. |
| 4.1.1 Parsing | Supports | Obsolete in WCAG 2.2 and treated as always satisfied for HTML (WCAG 2.2, 4.1.1 note). Kept for EN 301 549 V3.2.1, which still lists it. DOM built through the DOM API (C: `h()`). |
| 4.1.2 Name, Role, Value | Supports | Roles `dialog`, `switch`, `radiogroup`/`radio`, `combobox`/`listbox`/`option`, and toggle buttons with `aria-pressed`. Names and states update with the settings. T: axe-core; "language menu: …" (role and name assertions). Confirm: S1–S9 with screen readers. |

### Table 2: Level AA

| Criteria | Conformance level | Remarks and explanations |
| --- | --- | --- |
| 1.2.4 Captions (Live) | Not Applicable | No media. |
| 1.2.5 Audio Description (Prerecorded) | Not Applicable | No media. |
| 1.3.4 Orientation | Supports | No orientation lock. The panel becomes a bottom sheet on narrow screens. |
| 1.3.5 Identify Input Purpose | Not Applicable | No inputs that collect information about the user. |
| 1.4.3 Contrast (Minimum) | Supports | Default light and dark palettes pass. T: "axe-core: …" (light); "colorScheme auto follows the page's dark mode, passes axe, …" (dark). A site's own `theme` colors are the site's responsibility (console warning). |
| 1.4.4 Resize Text | Supports | The panel follows the browser's font size and reflows. T: "reflow: panel fits a 320px-wide viewport without horizontal scrolling". Confirm: S11 (200% zoom). |
| 1.4.5 Images of Text | Supports | No images of text (an owner logo is the owner's content). |
| 1.4.10 Reflow | Supports | T: "reflow: panel fits a 320px-wide viewport …"; "reflow: read mode fits a 320px-wide viewport; widget focus is visible". Confirm: S11 (400% zoom). |
| 1.4.11 Non-text Contrast | Supports | Focus rings, switch tracks, the selected states and the steppers' icons are at least 3:1 against their background. On the dark panel, brand-colored outlines and icons use a lighter tint of the brand color. Card borders are low contrast (about 1.2:1), but cards are identified by their text and icons, not by the border. T: "selected option has a visible, high-contrast state"; axe-core. |
| 1.4.12 Text Spacing | Pending | No fixed-height text containers by design (min-heights only), but this hasn't been tested with a text-spacing override yet. Next: an automated test plus S11. |
| 1.4.13 Content on Hover or Focus | Supports | The text magnifier, which the visitor switches on, can be dismissed with Escape and stays while the pointer or focus stays (C: `createPointerTools`, `onKey`). The language button's tooltip is the browser's native `title`. |
| 2.4.5 Multiple Ways | Not Applicable | A component, not a set of pages. |
| 2.4.6 Headings and Labels | Supports | The panel heading, section headings and control labels describe their purpose. |
| 2.4.7 Focus Visible | Supports | A 3 px focus outline on every widget control, kept in forced colors. T: "reflow: read mode … widget focus is visible"; "highlight links keeps the focus indicator distinct". |
| 2.4.11 Focus Not Obscured (Minimum) | Supports | Inside the panel, the header and footer don't overlap the scrolling area. On the page, the launcher steps aside when keyboard focus lands on a control under it, including after scrolling. T: "the launcher steps aside for a focused control under it (WCAG 2.4.11)". (For mouse and touch users the launcher still covers its corner; not part of this criterion.) |
| 2.5.7 Dragging Movements | Not Applicable | No dragging. Steppers use buttons. |
| 2.5.8 Target Size (Minimum) | Supports | Targets are at least 30 × 30 CSS px (steppers 32, header buttons 34, rows 48, launcher 56 by default; the owner-set `buttonSize` is limited to at least 24). C: `src/engine/css.ts`. |
| 3.1.2 Language of Parts | Supports | Each language option carries its own `lang`. Read mode keeps the page's language. T: "read mode keeps page language, tables, div text and links"; "language menu: …". |
| 3.2.3 Consistent Navigation | Not Applicable | Single component. |
| 3.2.4 Consistent Identification | Supports | The same functions have the same names and icons throughout. |
| 3.3.3 Error Suggestion | Not Applicable | No errors. |
| 3.3.4 Error Prevention (Legal, Financial, Data) | Not Applicable | No transactions. |
| 3.3.8 Accessible Authentication (Minimum) | Not Applicable | No authentication. |
| 4.1.3 Status Messages | Partially Supports | Stepper values, limits, reset and "adjustments are on" are announced through a polite live region. T: "stepper announces the new value with its name". **Known issue:** the live region is recreated when the panel rebuilds (for example on a language change), so an announcement made at that moment can be lost (review item P2-2). Confirm: S6, S10. |

### Table 3: Level AAA

Not evaluated (not in scope).

## Revised Section 508 report

### Chapter 3: Functional Performance Criteria (FPC)

| Criteria | Conformance level | Remarks and explanations |
| --- | --- | --- |
| 302.1 Without Vision | Pending | Screen-reader rows of the AT matrix (S1–S10). |
| 302.2 With Limited Vision | Pending | Supported by design (zoom, reflow, contrast, forced colors; see 1.4.x). Confirm with S11, S12. |
| 302.3 Without Perception of Color | Supports | See 1.4.1. |
| 302.4 Without Hearing | Not Applicable | No audio. |
| 302.5 With Limited Hearing | Not Applicable | No audio. |
| 302.6 Without Speech | Not Applicable | No speech input required. |
| 302.7 With Limited Manipulation | Pending | Keyboard-only and speech-input rows. Large targets (2.5.8), no gestures (2.5.1). |
| 302.8 With Limited Reach and Strength | Supports | Keyboard operable; single taps; no timing. See 2.1.1, 2.5.1, 2.2.1. |
| 302.9 With Limited Language, Cognitive, and Learning Abilities | Supports | Short plain labels, consistent layout, a reset button, 16 interface languages, no time limits. |

### Chapter 4: Hardware

Not Applicable (software component).

### Chapter 5: Software

| Criteria | Conformance level | Remarks and explanations |
| --- | --- | --- |
| 501.1 Scope (incorporation of WCAG 2.0 AA) | See WCAG 2.2 section | Web content. |
| 502 Interoperability with Assistive Technology | Not Applicable | Web content (not platform software). |
| 503 Applications | Not Applicable | Web content. It respects the platform's settings: font size, reduced motion and forced colors (503.2 user preferences). |
| 504 Authoring Tools | Not Applicable | Not an authoring tool. |

### Chapter 6: Support Documentation and Services

| Criteria | Conformance level | Remarks and explanations |
| --- | --- | --- |
| 602.2 Accessibility and Compatibility Features | Supports | Documented in the README (Features, Limitations, Privacy and storage), `ACCESSIBILITY.md`, and the docs site's "The widget's own accessibility" guide. |
| 602.3 Electronic Support Documentation | Partially Supports | The docs site was checked with axe-core during development (no violations on the main pages in English and Arabic). It is not yet tested in CI or with assistive technology. |
| 602.4 Alternate Formats for Non-Electronic Support Documentation | Not Applicable | Documentation is electronic only. |
| 603 Support Services | Supports | Support through GitHub issues, which are accessible web content. Accessibility information as in 602.2. |

## EN 301 549 report

### Chapter 4: 4.2 Functional Performance Statements (FPS)

| Criteria | Conformance level | Remarks and explanations |
| --- | --- | --- |
| 4.2.1 Usage without vision | Pending | See Section 508 302.1. |
| 4.2.2 Usage with limited vision | Pending | See 302.2. |
| 4.2.3 Usage without perception of colour | Supports | See 1.4.1. |
| 4.2.4 Usage without hearing | Not Applicable | No audio. |
| 4.2.5 Usage with limited hearing | Not Applicable | No audio. |
| 4.2.6 Usage with no or limited vocal capability | Not Applicable | No speech input required. |
| 4.2.7 Usage with limited manipulation or strength | Pending | See 302.7. |
| 4.2.8 Usage with limited reach | Supports | See 302.8. |
| 4.2.9 Minimize photosensitive seizure triggers | Supports | See 2.3.1. |
| 4.2.10 Usage with limited cognition, language or learning | Supports | See 302.9. |
| 4.2.11 Privacy | Supports | Settings stay in the visitor's browser (`localStorage`, which the site owner can turn off with `persist: false`). No network requests, no tracking. Accessibility features don't expose private data. |

### Chapter 5: Generic Requirements

| Criteria | Conformance level | Remarks and explanations |
| --- | --- | --- |
| 5.2 Activation of accessibility features | Supports | The widget's controls are available whenever the widget is shown. It never turns on an adjustment the visitor didn't choose (except a site's documented `initialSettings`). |
| 5.3 Biometrics | Not Applicable | — |
| 5.4 Preservation of accessibility information during conversion | Not Applicable | — |
| 5.5 Operable parts | Not Applicable | No hardware. |
| 5.6 Locking or toggle controls | Supports | Switches and toggle buttons expose their state programmatically (`aria-checked`, `aria-pressed`). See 4.1.2. |
| 5.7 Key repeat | Not Applicable | No key repeat handling. |
| 5.8 Double-strike key acceptance | Not Applicable | — |
| 5.9 Simultaneous user actions | Supports | No action needs simultaneous actions, except the optional `Alt+A` shortcut; every function is also reachable with single key presses. |

### Chapters 6–8

Not Applicable (no two-way voice communication, video capabilities or hardware).

### Chapter 9: Web

See the WCAG 2.2 section: clauses 9.1.1.1–9.4.1.3 correspond to WCAG success criteria 1.1.1–4.1.3, with the same results. (EN 301 549 V3.2.1 references WCAG 2.1; the WCAG 2.2-only criteria are reported above as well.)

### Chapter 10: Non-Web Documents

Not Applicable.

### Chapter 11: Software

Not Applicable: web content, see Chapter 9 (11.0). User preferences (11.7): the widget follows the platform's font size, `prefers-reduced-motion` and forced colors (T: "the widget's own motion follows prefers-reduced-motion"; "color filters are off in forced-colors mode").

### Chapter 12: Documentation and Support Services

| Criteria | Conformance level | Remarks and explanations |
| --- | --- | --- |
| 12.1.1 Accessibility and compatibility features | Supports | See Section 508 602.2. |
| 12.1.2 Accessible documentation | Partially Supports | See 602.3. |
| 12.2.2 Information on accessibility and compatibility features | Supports | See 603. |
| 12.2.3 Effective communication | Supports | GitHub issues, in writing. |
| 12.2.4 Accessible documentation | Partially Supports | See 602.3. |

### Chapter 13: ICT Providing Relay or Emergency Service Access

Not Applicable.

## Legal disclaimer

This report describes the widget's own interface as of the report date, based on the evaluation methods
listed above. It is not legal advice, it is not a certification, and it makes no statement about any website
that uses the widget. Installing the widget does not make a website conform to WCAG, EN 301 549, Section 508,
the ADA or the European Accessibility Act.

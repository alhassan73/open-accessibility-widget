/**
 * Every page adjustment is a class on <html> plus a CSS variable, so nothing
 * compounds and turning a feature off is a single class removal.
 * Anything inside `.a11yw-ignore` (the widget itself) is left untouched.
 */

/** Matches page content but never the widget. */
const OUT = ":not(.a11yw-ignore):not(.a11yw-ignore *)";
const HEADINGS = 'h1,h2,h3,h4,h5,h6,[role="heading"]';
/** Letter spacing breaks the joined letters of cursive scripts, so these keep normal spacing. */
const CURSIVE = ":lang(ar),:lang(fa),:lang(ur),:lang(ps),:lang(sd),:lang(ug),:lang(ckb),:lang(syr),:lang(dv)";
/** Controls whose name comes from an image: their images stay visible when images are hidden. */
const INTERACTIVE = 'a,button,label,summary,[role="button"],[role="link"],[role="tab"],[role="menuitem"]';
/** Selected / current states that sites often show with a background color only. */
const STATES =
  '[aria-selected="true"],[aria-pressed="true"],[aria-checked="true"],[aria-current]:not([aria-current="false"]),:checked';
const withDescendants = (list: string) =>
  list
    .split(",")
    .flatMap((s) => [s, `${s} *`])
    .join(",");

const ARROW = "M5 3v37l10-9 7 15 7-3-7-15h14z";
const HAND =
  "M17 4.5a3.5 3.5 0 0 1 7 0V20l1.2-.4a3.5 3.5 0 0 1 4.3 1.9l.4.1a3.5 3.5 0 0 1 4.6 1.7 3.5 3.5 0 0 1 4.5 2.6V34c0 5.5-4.5 10-10 10h-4.5c-3 0-5.8-1.4-7.7-3.8L5 30a3.4 3.4 0 0 1 5.2-4.4L17 31z";
const cursorSvg = (path: string, fill: string, stroke: string, hotspot: string, fallback: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="${path}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/></svg>`
  )}") ${hotspot}, ${fallback}`;
// The large cursor keeps the usual meaning: a hand on links and buttons, the text bar in fields.
const cursorRules = (name: string, fill: string, stroke: string) => `
html.a11yw-cursor-${name},html.a11yw-cursor-${name} *{cursor:${cursorSvg(ARROW, fill, stroke, "5 3", "auto")}!important}
html.a11yw-cursor-${name} :is(a[href],button,select,summary,label,[role="button"],[role="link"],[role="tab"],input:is([type="checkbox"],[type="radio"],[type="button"],[type="submit"],[type="reset"])),html.a11yw-cursor-${name} :is(a[href],button,[role="button"],[role="link"]) *{cursor:${cursorSvg(HAND, fill, stroke, "20 2", "pointer")}!important}
html.a11yw-cursor-${name} :is(textarea,[contenteditable]:not([contenteditable="false"]),input:not([type="checkbox"],[type="radio"],[type="button"],[type="submit"],[type="reset"],[type="range"],[type="color"],[type="image"])){cursor:text!important}`;

const EFFECTS_CSS = `
:root{--a11yw-hl:#d64000}
html.a11yw-scale body>${OUT}{zoom:var(--a11yw-scale)}
html.a11yw-lh body ${OUT}{line-height:var(--a11yw-lh)!important}
html.a11yw-ls body ${OUT}{letter-spacing:var(--a11yw-ls)!important;word-spacing:var(--a11yw-ws)!important}
html.a11yw-ls body :is(${CURSIVE})${OUT}{letter-spacing:normal!important}
html.a11yw-align body ${OUT}{text-align:var(--a11yw-align)!important}
html.a11yw-readable body ${OUT}:not(i,svg,svg *,code,pre,kbd,samp,[class*="icon"],[class*="Icon"],[class*="fa-"],[class*="material-"]){font-family:Verdana,Tahoma,Arial,sans-serif!important}
html.a11yw-no-motion *,html.a11yw-no-motion *::before,html.a11yw-no-motion *::after{animation-delay:-1ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;transition-delay:0s!important;scroll-behavior:auto!important}
@media screen{
html.a11yw-titles :is(${HEADINGS}):not(:focus-visible)${OUT}{outline:3px solid var(--a11yw-hl)!important;outline-offset:3px!important}
html.a11yw-links :is(a[href],[role="link"])${OUT}{text-decoration:underline!important;text-underline-offset:3px!important}
html.a11yw-links :is(a[href],[role="link"]):not(:focus-visible)${OUT}{outline:2px solid var(--a11yw-hl)!important;outline-offset:2px!important}
html.a11yw-hover :is(a,button,input,select,textarea,label,summary,img,p,li,${HEADINGS},[role="button"],[role="link"]):hover:not(:focus-visible)${OUT}{outline:2px dashed var(--a11yw-hl)!important;outline-offset:2px!important}
html.a11yw-hide-img :is(img,picture,svg[role="img"],[role="img"]):not(:is(${INTERACTIVE}) *)${OUT}{opacity:0!important}
html.a11yw-hide-img body :not(input,select,textarea,button,[role="checkbox"],[role="switch"],[role="radio"])${OUT}{background-image:none!important}
${cursorRules("black", "#000", "#fff")}
${cursorRules("white", "#fff", "#000")}
}
@media screen and (forced-colors:none){
html.a11yw-dark{color-scheme:dark}
html.a11yw-dark,html.a11yw-dark body,html.a11yw-dark body ${OUT}{background-color:#121212!important;color:#f1f1f1!important;border-color:#6b6b6b!important}
html.a11yw-dark :is(a[href],a[href] *)${OUT}{color:#8ab4f8!important}
html.a11yw-light{color-scheme:light}
html.a11yw-light,html.a11yw-light body,html.a11yw-light body ${OUT}{background-color:#fff!important;color:#000!important;border-color:#767676!important}
html.a11yw-light :is(a[href],a[href] *)${OUT}{color:#0645ad!important}
html.a11yw-text-color body ${OUT}{color:var(--a11yw-text-color)!important}
html.a11yw-text-color :is(a[href],[role="link"])${OUT}{text-decoration:underline!important}
html.a11yw-title-color :is(${withDescendants(HEADINGS)})${OUT}{color:var(--a11yw-title-color)!important}
html.a11yw-bg-color,html.a11yw-bg-color body,html.a11yw-bg-color body ${OUT}{background-color:var(--a11yw-bg-color)!important}
html:is(.a11yw-dark,.a11yw-light,.a11yw-bg-color) :is(${STATES})${OUT}{box-shadow:inset 0 0 0 3px currentColor!important}
html.a11yw-filter{filter:var(--a11yw-filter)}
}
@media screen{
html.a11yw-focus :focus-visible${OUT}{outline:4px solid #ffbf47!important;outline-offset:2px!important;box-shadow:0 0 0 7px #0b0c0c!important}
}
.a11yw-root,.a11yw-widget,.a11yw-layer{display:contents}
.a11yw-layer [hidden]{display:none!important}
.a11yw-guide{position:fixed;top:0;left:0;width:min(600px,90vw);height:12px;background:#111;border:3px solid #ffd400;border-radius:6px;pointer-events:none;z-index:var(--a11yw-layer-z,2147482999)}
.a11yw-mask{position:fixed;top:0;left:0;width:100vw;height:calc(140px * var(--a11yw-font,1));pointer-events:none;box-shadow:0 0 0 100vmax rgba(0,0,0,.7);z-index:var(--a11yw-layer-z,2147482999)}
.a11yw-magnifier{position:fixed;top:0;left:0;max-width:min(480px,90vw);padding:12px 16px;background:#111;color:#fff;font:600 28px/1.35 system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.35);pointer-events:none;z-index:var(--a11yw-layer-z,2147482999);overflow-wrap:anywhere}
@media print{.a11yw-root,.a11yw-layer{display:none!important}}
`;

const WIDGET_CSS = `
.a11yw-widget{--a11yw-primary:#0f766e;--a11yw-on-primary:#fff;--a11yw-bg:#fff;--a11yw-surface:#f4f6f8;--a11yw-text:#0f172a;--a11yw-muted:#475569;--a11yw-border:#e2e8f0;--a11yw-radius:16px;--a11yw-font-family:system-ui,-apple-system,"Segoe UI",Roboto,Tahoma,Arial,sans-serif;
font-family:var(--a11yw-font-family);font-size:medium;line-height:1.4;color:var(--a11yw-text);letter-spacing:normal;word-spacing:normal;text-align:start;text-transform:none;font-weight:400}
.a11yw-widget,.a11yw-widget *,.a11yw-widget *::before,.a11yw-widget *::after{box-sizing:border-box}
.a11yw-widget :is(button,input,select,a,output,label,h2,h3,p,ul){font:inherit;color:inherit;letter-spacing:inherit;margin:0;text-transform:none}
.a11yw-widget button{cursor:pointer;background:none;border:0;padding:0;min-width:0}
.a11yw-widget [aria-disabled="true"]{opacity:.4;cursor:not-allowed}
.a11yw-widget svg{display:block;flex:none;width:20px;height:20px}
.a11yw-widget [hidden]{display:none!important}
.a11yw-widget :focus-visible{outline:3px solid var(--a11yw-primary);outline-offset:2px}
.a11yw-widget .a11yw-flip:dir(rtl){transform:scaleX(-1)}
.a11yw-sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.a11yw-skip{position:fixed;top:8px;inset-inline-start:8px;z-index:var(--a11yw-z);padding:12px 18px;background:var(--a11yw-primary);color:var(--a11yw-on-primary)!important;font-weight:700;border-radius:10px;text-decoration:none;transform:translateY(-200%)}
.a11yw-skip:focus{transform:none}
.a11yw-launcher{position:fixed;bottom:var(--a11yw-y);z-index:var(--a11yw-z);width:var(--a11yw-size);height:var(--a11yw-size);border-radius:calc(var(--a11yw-size) * .32)!important;background:var(--a11yw-primary)!important;color:var(--a11yw-on-primary)!important;display:grid;place-items:center;box-shadow:0 8px 24px rgba(15,23,42,.25);transition:transform .18s ease,box-shadow .18s ease}
.a11yw-launcher[data-side="left"]{left:var(--a11yw-x)}
.a11yw-launcher[data-side="right"]{right:var(--a11yw-x)}
.a11yw-launcher:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(15,23,42,.3)}
.a11yw-launcher:focus-visible{outline:3px solid var(--a11yw-primary);outline-offset:3px;box-shadow:0 0 0 3px var(--a11yw-on-primary)}
.a11yw-widget .a11yw-launcher svg{width:58%;height:58%}
.a11yw-launcher img{width:100%;height:100%;object-fit:cover;border-radius:inherit}
.a11yw-launcher[data-active]::after{content:"";position:absolute;top:-3px;inset-inline-end:-3px;width:14px;height:14px;border-radius:50%;background:#f59e0b;border:3px solid var(--a11yw-text)}
.a11yw-panel,.a11yw-reader-backdrop{font-size:calc(1em * var(--a11yw-ui-scale,1))}
.a11yw-panel{position:fixed;bottom:calc(var(--a11yw-y) + var(--a11yw-size) + 12px);z-index:var(--a11yw-z);width:min(calc(400px * var(--a11yw-ui-scale,1)),calc(100vw - 24px));max-height:min(680px,calc(100vh - var(--a11yw-y) - var(--a11yw-size) - 36px));max-height:min(680px,calc(100dvh - var(--a11yw-y) - var(--a11yw-size) - 36px));display:flex;flex-direction:column;background:var(--a11yw-bg);border:1px solid var(--a11yw-border);border-radius:var(--a11yw-radius);box-shadow:0 24px 48px -12px rgba(15,23,42,.3);overflow:hidden;opacity:0;transform:translateY(12px) scale(.97);transition:opacity .2s ease,transform .2s cubic-bezier(.2,.8,.2,1);pointer-events:none}
.a11yw-panel[data-side="left"]{left:var(--a11yw-x);transform-origin:bottom left}
.a11yw-panel[data-side="right"]{right:var(--a11yw-x);transform-origin:bottom right}
.a11yw-panel[data-open]{opacity:1;transform:none;pointer-events:auto}
.a11yw-header{display:flex;align-items:center;gap:10px;padding-block:12px;padding-inline:14px 10px;border-bottom:1px solid var(--a11yw-border)}
.a11yw-badge{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;flex:none;overflow:hidden;background:var(--a11yw-primary);color:var(--a11yw-on-primary)}
.a11yw-widget .a11yw-badge svg{width:22px;height:22px}
.a11yw-badge img{width:100%;height:100%;object-fit:cover}
.a11yw-widget .a11yw-title{flex:1;min-width:0;font-size:1.0625em;font-weight:700;line-height:1.25}
.a11yw-lang-wrap{position:relative;display:flex;align-items:center;color:var(--a11yw-muted)}
.a11yw-widget .a11yw-lang-wrap svg{position:absolute;inset-inline-start:9px;width:16px;height:16px;pointer-events:none}
.a11yw-widget .a11yw-lang{min-height:36px;max-width:140px;padding-block:4px;padding-inline:30px 8px;border:1px solid var(--a11yw-border);border-radius:10px;background:var(--a11yw-bg);color:var(--a11yw-text);font-size:.8125em;font-weight:600;cursor:pointer}
.a11yw-icon-btn{width:40px;height:40px;border-radius:10px;display:grid;place-items:center;flex:none;color:var(--a11yw-muted)!important}
.a11yw-icon-btn:hover{background:var(--a11yw-surface)!important;color:var(--a11yw-text)!important}
.a11yw-body{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:14px 14px 6px}
.a11yw-widget .a11yw-block-title{margin:0 0 10px;font-size:.75em;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--a11yw-muted)}
.a11yw-profiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.a11yw-profile{position:relative;display:flex;align-items:flex-start;gap:10px;padding-block:10px!important;padding-inline:10px 26px!important;border:1px solid var(--a11yw-border)!important;border-radius:12px;background:var(--a11yw-bg)!important;text-align:start;transition:border-color .15s,background-color .15s}
.a11yw-profile>svg{margin-top:1px;color:var(--a11yw-primary)}
.a11yw-profile-label{display:block;font-size:.875em;font-weight:600;line-height:1.3}
.a11yw-profile-desc{display:block;margin-top:2px;font-size:.75em;line-height:1.35;color:var(--a11yw-muted)}
.a11yw-profile:hover{border-color:var(--a11yw-primary)!important}
.a11yw-profile[aria-pressed="true"]{border-color:var(--a11yw-primary)!important;background:color-mix(in srgb,var(--a11yw-primary) 8%,var(--a11yw-bg))!important;box-shadow:inset 0 0 0 1px var(--a11yw-primary)}
.a11yw-check{position:absolute;top:8px;inset-inline-end:8px;width:16px;height:16px;border-radius:50%;display:none;place-items:center;background:var(--a11yw-primary);color:var(--a11yw-on-primary)}
.a11yw-widget .a11yw-check svg{width:11px;height:11px;stroke-width:3}
[aria-pressed="true"]>.a11yw-check{display:grid}
.a11yw-section{border-top:1px solid var(--a11yw-border)}
.a11yw-section:first-of-type{margin-top:14px}
.a11yw-widget .a11yw-acc-heading{margin:0;font-size:inherit}
.a11yw-acc-btn{display:flex;align-items:center;gap:10px;width:100%;min-height:52px;padding:8px 2px!important;font-size:.9375em!important;font-weight:600!important;text-align:start}
.a11yw-acc-btn>svg:first-child{color:var(--a11yw-primary)}
.a11yw-acc-title{flex:1}
.a11yw-count{padding:2px 8px;border-radius:999px;font-size:.8em;font-weight:600;background:color-mix(in srgb,var(--a11yw-primary) 12%,var(--a11yw-bg));color:var(--a11yw-text)}
.a11yw-widget .a11yw-chev{width:18px;height:18px;color:var(--a11yw-muted);transition:transform .2s ease}
[aria-expanded="true"]>.a11yw-chev{transform:rotate(180deg)}
.a11yw-acc-panel{padding:0 0 12px}
.a11yw-acc-panel>*+*{border-top:1px solid color-mix(in srgb,var(--a11yw-border) 70%,transparent)}
.a11yw-row{display:flex;align-items:center;gap:12px;width:calc(100% + 16px);min-height:48px;margin:0 -8px!important;padding:6px 8px!important;border-radius:10px;text-align:start;font-size:.875em!important;font-weight:500!important}
.a11yw-row>svg:first-child{color:var(--a11yw-muted)}
button.a11yw-row:hover{background:var(--a11yw-surface)!important}
.a11yw-row-label{flex:1;min-width:0}
.a11yw-switch{position:relative;flex:none;width:40px;height:24px;border-radius:12px;background:#64748b;transition:background-color .15s}
.a11yw-switch::after{content:"";position:absolute;top:3px;inset-inline-start:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:inset-inline-start .15s}
[aria-checked="true"]>.a11yw-switch{background:var(--a11yw-primary)}
[aria-checked="true"]>.a11yw-switch::after{inset-inline-start:19px}
.a11yw-step{display:flex;align-items:center;gap:4px;flex:none}
.a11yw-step-btn{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;border:1px solid var(--a11yw-border)!important;background:var(--a11yw-bg)!important}
.a11yw-step-btn:not([aria-disabled="true"]):hover{border-color:var(--a11yw-primary)!important;color:var(--a11yw-primary)!important}
.a11yw-widget .a11yw-step-btn svg{width:16px;height:16px}
.a11yw-step-value{min-width:48px;text-align:center;font-weight:600;font-variant-numeric:tabular-nums}
.a11yw-mini-btn{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;color:var(--a11yw-muted)!important}
.a11yw-mini-btn:not([aria-disabled="true"]):hover{background:var(--a11yw-surface)!important;color:var(--a11yw-text)!important}
.a11yw-widget .a11yw-mini-btn svg{width:16px;height:16px}
.a11yw-widget .a11yw-row input[type="color"]{width:40px;height:28px;padding:0;border:1px solid var(--a11yw-border);border-radius:8px;background:none;cursor:pointer}
.a11yw-field{padding:10px 0}
.a11yw-field-label{display:flex;align-items:center;gap:12px;margin-bottom:8px;font-size:.875em;font-weight:500}
.a11yw-field-label>svg{color:var(--a11yw-muted)}
.a11yw-seg{display:flex;gap:2px;padding:3px;border-radius:11px;background:var(--a11yw-surface)}
.a11yw-seg>button{flex:1;min-height:36px;padding:4px 6px!important;border-radius:8px;font-size:.8125em!important;font-weight:500!important;color:var(--a11yw-muted)!important}
.a11yw-seg>button:hover{color:var(--a11yw-text)!important}
.a11yw-seg>button[aria-checked="true"]{background:var(--a11yw-primary)!important;color:var(--a11yw-on-primary)!important;font-weight:700!important}
.a11yw-footer{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;padding:10px 12px;border-top:1px solid var(--a11yw-border);background:var(--a11yw-surface)}
.a11yw-spacer{flex:1}
.a11yw-btn{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:8px 14px!important;border-radius:10px;background:var(--a11yw-primary)!important;color:var(--a11yw-on-primary)!important;font-size:.875em!important;font-weight:600!important}
.a11yw-widget .a11yw-btn svg{width:16px;height:16px}
.a11yw-link{display:inline-flex;align-items:center;min-height:40px;padding:4px 6px!important;font-size:.8125em!important;font-weight:600!important;color:var(--a11yw-primary)!important;text-decoration:underline!important;text-underline-offset:3px}
.a11yw-reader-backdrop{position:fixed;inset:0;z-index:var(--a11yw-z);display:flex;justify-content:center;padding:24px 16px;background:rgba(15,23,42,.55)}
.a11yw-reader{width:min(760px,100%);max-height:100%;display:flex;flex-direction:column;background:var(--a11yw-bg);border-radius:var(--a11yw-radius);overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.35)}
.a11yw-reader-bar{display:flex;align-items:center;gap:12px;padding-block:10px;padding-inline:24px 12px;border-bottom:1px solid var(--a11yw-border)}
.a11yw-reader-body{overflow-y:auto;padding:24px 32px 40px;font-size:1.25em;line-height:1.7}
.a11yw-reader-body :is(h1,h2,h3,h4,h5,h6){line-height:1.3!important;margin:1.2em 0 .5em!important;font-weight:700!important}
.a11yw-reader-body h1{font-size:1.6em!important}
.a11yw-reader-body h2{font-size:1.4em!important}
.a11yw-reader-body h3{font-size:1.2em!important}
.a11yw-reader-body :is(h4,h5,h6){font-size:1.05em!important}
.a11yw-reader-body :is(p,blockquote,pre){margin:0 0 1em!important}
.a11yw-reader-body a{color:var(--a11yw-primary)!important;text-decoration:underline!important;font-size:inherit}
.a11yw-reader-body blockquote{padding-inline-start:16px;border-inline-start:4px solid var(--a11yw-primary)}
.a11yw-reader-body pre{white-space:pre-wrap;font-family:ui-monospace,Consolas,monospace;font-size:.8em;padding:12px;border-radius:8px;background:var(--a11yw-surface)}
.a11yw-reader-body .a11yw-reader-li{position:relative;padding-inline-start:1.2em}
.a11yw-reader-li::before{content:"\\2022";position:absolute;inset-inline-start:0}
@media (max-width:560px){.a11yw-panel{left:0!important;right:0!important;bottom:0;width:auto;max-height:88vh;max-height:88dvh;border-radius:var(--a11yw-radius) var(--a11yw-radius) 0 0;transform:translateY(24px);transform-origin:bottom center}.a11yw-reader-body{padding:16px 18px 32px}}
@media (max-width:360px){.a11yw-profiles{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.a11yw-widget *,.a11yw-widget *::before,.a11yw-widget *::after{transition:none!important}.a11yw-launcher:hover{transform:none}}
@media (forced-colors:active){.a11yw-profile[aria-pressed="true"],.a11yw-seg>button[aria-checked="true"]{outline:3px solid Highlight}.a11yw-switch,.a11yw-check{border:1px solid ButtonText}[aria-checked="true"]>.a11yw-switch{background:Highlight}}
`;

const STYLE_ID = "a11yw-styles";

export function injectStyles(doc: Document, nonce?: string) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  if (nonce) style.nonce = nonce;
  style.textContent = EFFECTS_CSS + WIDGET_CSS;
  doc.head.appendChild(style);
}

export function removeStyles(doc: Document) {
  doc.getElementById(STYLE_ID)?.remove();
}

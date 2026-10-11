/**
 * The site's CSP requires Trusted Types for scripts, and a few Next/React internals pass plain strings to
 * guarded sinks once the app navigates on the client:
 * - Turbopack's runtime loads a linked route's JavaScript with `script.src = "<url>"`;
 * - React creates a `<script>` element (the JSON-LD of the next page) through `div.innerHTML =
 *   "<script></script>"`, then fills it with `innerHTML = json`.
 * This "default" policy accepts exactly those, and nothing else:
 * - script URLs only from the site's own build output (same origin, under /_next/static/);
 * - HTML only if it is React's empty `<script></script>` or has no "<" at all. Text without "<" cannot create
 *   an element or attribute anywhere, so it is inert in every HTML sink (JsonLdScript escapes "<").
 * Anything else (other script URLs, real markup, script text) is still blocked. The accessibility widget
 * needs no policy: it builds its DOM with createElement and never assigns HTML.
 *
 * An allowed script URL is returned exactly as given, not rewritten as an absolute URL: Turbopack registers a
 * loaded chunk under its `src` attribute, and a rewritten one never matches the path it waits for, so every
 * later navigation that needs that chunk would hang. The check resolves against document.baseURI, as the
 * browser does.
 */
const SCRIPT =
  'if(window.trustedTypes&&trustedTypes.createPolicy)trustedTypes.createPolicy("default",{' +
  "createScriptURL:function(u){var x=new URL(u,document.baseURI);" +
  'if(x.origin===location.origin&&x.pathname.indexOf("/_next/static/")===0)return u;' +
  'throw new TypeError("Blocked script URL: "+u)},' +
  'createHTML:function(h){if(h==="<script>\\x3c/script>"||h.indexOf("<")===-1)return h;' +
  'throw new TypeError("Blocked HTML")}})';

export function TrustedTypesScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}

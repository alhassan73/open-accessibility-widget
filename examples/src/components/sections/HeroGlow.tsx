/**
 * Decorative hero background: a still teal glow, two soft orbs and a dot grid. It covers the whole hero and
 * fades out at the bottom, so it blends into the page with no edge. The orbs are radial gradients, not blur()
 * filters: large blurred layers crash WebKit on Linux.
 */
export function HeroGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden mask-[linear-gradient(to_bottom,#000_55%,transparent)]"
    >
      <div className="absolute -inset-x-[5%] -top-[5%] bottom-0 bg-glow" />
      <div className="absolute -top-28 start-[6%] size-112 bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_18%,transparent),transparent)]" />
      <div className="absolute end-[4%] top-40 size-96 bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--brand-cyan)_10%,transparent),transparent)]" />
      <div className="absolute inset-0 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:26px_26px] mask-[radial-gradient(ellipse_70%_55%_at_50%_0%,#000,transparent)]" />
    </div>
  );
}

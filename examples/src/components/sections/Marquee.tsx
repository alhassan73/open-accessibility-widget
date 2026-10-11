import type { CSSProperties, ReactNode } from "react";

/**
 * A looping row. Pass the items twice as `children` (the second set `aria-hidden`): the track moves by half
 * its width. It pauses on hover and keyboard focus, and is a static wrapped row with reduced motion.
 */
export function Marquee({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group overflow-hidden mask-[linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)] motion-reduce:mask-none">
      <ul
        role="list"
        aria-label={label}
        style={{ "--marquee-duration": "55s" } as CSSProperties}
        className="flex w-max animate-marquee items-center gap-12 py-2 group-focus-within:paused group-hover:paused motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:justify-center"
      >
        {children}
      </ul>
    </div>
  );
}

import { Cta } from "./Cta";
import { Features } from "./Features";
import { FrameworkGrid } from "./Frameworks";
import { Hero } from "./Hero";
import { Honest } from "./Honest";
import { Playground } from "./Playground";
import { TrustStrip } from "./TrustStrip";

/**
 * The home page: hero, trust strip and the live playground, features, what the widget is not, the framework
 * grid, closing call to action.
 */
export function HomePage() {
  return (
    <>
      <section aria-labelledby="hero-title" className="relative">
        <Hero />
        <TrustStrip />
      </section>
      <Playground />
      <Features />
      <Honest />
      <FrameworkGrid />
      <Cta />
    </>
  );
}

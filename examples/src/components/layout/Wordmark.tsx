import styles from "./Wordmark.module.css";
import { WidgetIcon } from "./WidgetIcon";

const NAME = "Open Accessibility Widget";

/**
 * The mark: the widget's own launcher icon on a teal tile, and the name beside it. `full` is the lockup,
 * `mark` is just the tile. Decorative: the link around it carries the accessible name.
 */
export function Wordmark({ variant = "full" }: { variant?: "full" | "mark" }) {
  return (
    <span className={styles.wm} dir="ltr" aria-hidden="true">
      <span className={styles.tile}>
        <WidgetIcon />
      </span>
      {variant === "full" && <span className={styles.name}>{NAME}</span>}
    </span>
  );
}

import { siGithub } from "simple-icons";
import { cn } from "@/lib/utils";

/** The GitHub mark (lucide has no brand icons), filled with the current text colour. */
export function GithubMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cn("size-4 fill-current", className)}
    >
      <path d={siGithub.path} />
    </svg>
  );
}

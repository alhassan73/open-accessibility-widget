/** One "### Added" (Changed, Fixed, …) block of a release. `kind` is the heading in lower case. */
export interface ChangeSection {
  kind: string;
  items: ChangeItem[];
}

/** A list item, with its nested list items (one level deep, as CHANGELOG.md uses). */
export interface ChangeItem {
  text: string;
  children: string[];
}

/** One "## x.y.z" (or "## Unreleased") entry of CHANGELOG.md. */
export interface Release {
  version: string;
  /** Anchor id, e.g. "v1-0-1" or "unreleased". */
  id: string;
  unreleased: boolean;
  /** Paragraphs between the version heading and its first section. */
  intro: string[];
  sections: ChangeSection[];
}

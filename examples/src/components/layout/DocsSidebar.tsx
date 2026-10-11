import { Link } from "@/i18n/navigation";
import type { DocsNavGroup } from "@/types";

const item =
  "flex min-h-9 items-center rounded-lg px-3 py-1.5 text-small text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground aria-[current=page]:bg-primary/10 aria-[current=page]:font-bold aria-[current=page]:text-link";

/**
 * The docs navigation: every docs page in groups. `current` is the route after the language ("api/"); the
 * page it names is marked. Rendered on the server, in the sticky column from `lg` and in the menu sheet below.
 */
export function DocsSidebar({
  label,
  groups,
  current,
}: {
  label: string;
  groups: DocsNavGroup[];
  current: string;
}) {
  return (
    <nav aria-label={label}>
      {groups.map((group, i) => (
        <div key={group.id} className={i ? "mt-6" : undefined}>
          <p className="mb-1.5 px-3 text-caption font-bold text-muted-foreground">{group.label}</p>
          <ul className="grid gap-0.5">
            {group.items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  aria-current={it.href === `/${current}` ? "page" : undefined}
                  className={item}
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

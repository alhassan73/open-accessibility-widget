/** The widget's own launcher icon (a person in a circle), drawn with the current text colour. Decorative. */
export function WidgetIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="6.8" r="1.5" fill="currentColor" stroke="none" />
      <path d="M7 9.6c1.7.5 3.3.7 5 .7s3.3-.2 5-.7M12 10.3v3.6m0 0-2.4 4.4m2.4-4.4 2.4 4.4" />
    </svg>
  );
}

/**
 * SmartPOS logo — "Receipt Check".
 * A receipt with a torn edge and a check mark: a completed sale, a business in order.
 *
 * - tone="light": for white / ivory backgrounds (navy receipt, lime check)
 * - tone="dark":  for navy backgrounds (lime receipt, navy check, white name)
 */

type Tone = "light" | "dark";

const COLORS = {
  light: { receipt: "#20283B", check: "#D0E66B" },
  dark: { receipt: "#D0E66B", check: "#20283B" },
} as const;

export function LogoMark({
  tone = "light",
  className = "h-9 w-9",
  title,
}: {
  tone?: Tone;
  className?: string;
  /** Pass a title when the mark is used on its own (no visible name) */
  title?: string;
}) {
  const c = COLORS[tone];
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path
        d="M16 10a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v44l-4-4-4 4-4-4-4 4-4-4-4 4-4-4-4 4z"
        fill={c.receipt}
      />
      <path
        d="M23.5 29.5l6.5 6.5 11.5-13.5"
        fill="none"
        stroke={c.check}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({
  tone = "light",
  className = "",
  markClassName = "h-11 w-11",
  textClassName = "text-[1.45rem]",
}: {
  tone?: Tone;
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      <LogoMark tone={tone} className={`-ml-2.5 shrink-0 ${markClassName}`} />
      <span
        className={`font-extrabold leading-none tracking-[-0.04em] ${
          tone === "dark" ? "text-white" : "text-ink"
        } ${textClassName}`}
      >
        SmartPOS
      </span>
    </span>
  );
}

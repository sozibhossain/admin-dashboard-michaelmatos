import { cn } from "@/lib/utils";

/**
 * Brand mark — a bold "R" with the orange → pink gradient used across the app.
 */
export function Logo({
  className,
  size = 48,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="Logo"
      role="img"
    >
      <defs>
        <linearGradient id="brandGrad" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7A1A" />
          <stop offset="0.55" stopColor="#FF4D6D" />
          <stop offset="1" stopColor="#FF1FA2" />
        </linearGradient>
      </defs>
      {/* stylised R */}
      <path
        d="M14 6h22c9.94 0 18 8.06 18 18 0 7.4-4.46 13.76-10.84 16.52L56 58H41.5L31 41H26v17H14V6Zm12 11v13h9.5c3.59 0 6.5-2.91 6.5-6.5S39.09 17 35.5 17H26Z"
        fill="url(#brandGrad)"
      />
    </svg>
  );
}

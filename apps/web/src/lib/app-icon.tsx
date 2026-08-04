/**
 * Shared visual for every generated app icon (favicon, apple touch icon,
 * PWA manifest icons). Kept as plain inline styles / JSX since it's
 * rendered through `next/og`'s `ImageResponse` (Satori), which only
 * supports a constrained subset of CSS — no Tailwind classes.
 */
export function AppIconMark({ size }: { size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#18181b',
        borderRadius: Math.round(size * 0.2),
      }}
    >
      <span
        style={{
          color: '#fafafa',
          fontSize: Math.round(size * 0.42),
          fontWeight: 700,
          fontFamily: 'sans-serif',
        }}
      >
        FT
      </span>
    </div>
  );
}

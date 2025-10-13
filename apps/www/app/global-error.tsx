// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>앱에 문제가 발생했습니다</h2>
        <button onClick={() => reset()}>새로고침</button>
      </body>
    </html>
  );
}

export default function Logo({ variant = "full" }: { variant?: "full" | "mark" }) {
  if (variant === "mark") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src="/logo-mark.png" alt="Gulf Cryo" width={40} height={40} className="h-10 w-10" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="Gulf Cryo" width={1600} height={782} className="h-11 w-auto" />
  );
}

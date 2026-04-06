import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex items-center h-full flex-1 justify-center">
      <div className="text-center">
        <div className="flex flex-col items-center mb-2">
          <span className="font-mono font-bold text-7xl leading-none">404</span>
          <span className="text-xl font-semibold">Page Not Found</span>
        </div>
        <Link href="/" className="btn btn-primary px-2 sm:px-4 text-base tracking-wide mb-2">
          Home
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";

export function Legal() {
  return (
    <nav className="mt-2.5 flex flex-wrap justify-center gap-x-3 text-center text-[11px] leading-4 text-[rgb(70_88_115/0.4)] [text-shadow:0_1px_0_rgb(255_255_255/0.7)]">
      <Link
        href="/terms"
        className="transition-colors duration-100 ease-out hover:text-[rgb(70_88_115/0.85)] motion-reduce:transition-none"
      >
        Terms
      </Link>

      <Link
        href="/privacy"
        className="transition-colors duration-100 ease-out hover:text-[rgb(70_88_115/0.85)] motion-reduce:transition-none"
      >
        Privacy
      </Link>

      <a
        href="mailto:support@danielbacsur.dev"
        className="transition-colors duration-100 ease-out hover:text-[rgb(70_88_115/0.85)] motion-reduce:transition-none"
      >
        Contact
      </a>
    </nav>
  );
}

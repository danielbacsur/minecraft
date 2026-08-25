import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-[#e3edf2] font-sans">{children}</div>;
}

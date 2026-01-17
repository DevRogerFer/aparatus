import type { ReactNode } from "react";

import "@/app/globals.css";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <div className="[&+footer]:hidden">{children}</div>;
}

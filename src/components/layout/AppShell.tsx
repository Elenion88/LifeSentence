import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { useIsMobile } from "../../hooks/useIsMobile";

export default function AppShell({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100dvh" }}>
        <main style={{ flex: 1, overflow: "auto", padding: "16px 16px 16px" }}>
          {children}
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        {children}
      </main>
    </div>
  );
}

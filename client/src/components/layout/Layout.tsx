import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <Topbar />
        <main className="flex-1 overflow-x-hidden p-6 animate-in fade-in duration-500">
          <div className="mx-auto max-w-7xl h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

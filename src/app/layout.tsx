import type { Metadata } from "next";
import { organicDisplay, organicReading } from "./fonts";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import { SkipLink, ShellHeader, ShellFooter, AnnounceProvider } from "@/components/shell";

export const metadata: Metadata = {
  title: "Celebration Planner",
  description: "Celebration and event planning assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${organicDisplay.variable} ${organicReading.variable}`}
    >
      <body>
        <AnnounceProvider>
          <SkipLink targetId="main-content">Skip to main content</SkipLink>
          <ShellHeader />
          <main id="main-content" tabIndex={-1} className="page-shell-main">
            {children}
          </main>
          <ShellFooter />
        </AnnounceProvider>
      </body>
    </html>
  );
}

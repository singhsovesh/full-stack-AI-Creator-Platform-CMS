import Header from "@/components/ui/header"; // ✅ Ensure actual file is lowercase
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import { Inter } from "next/font/google";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from "sonner"; // ✅ Added missing import
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Content Platform",
  description: "Content Creation powered by AI",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: shadesOfPurple,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <Header />
              <main className="bg-slate-900 min-h-screen text-white overflow-x-hidden">
                {children}
              </main>
              <Toaster richColors /> {/* ✅ Works now */}
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

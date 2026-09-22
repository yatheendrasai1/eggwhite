import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Google_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { LoadingProvider } from "@/components/LoadingOverlay";
import { ToastProvider } from "@/components/Toast";
import { ConfirmProvider } from "@/components/ConfirmDialog";
import { getSessionTheme } from "@/lib/theme";

/** Logo wordmark. */
const googleSans = Google_Sans({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-brand",
  display: "swap",
});

/** Everything else. */
const googleSansFlex = localFont({
  src: "../fonts/GoogleSansFlex.ttf",
  variable: "--font-google-sans-flex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "egvit — English Tests",
  description:
    "Self-scoring English grammar and vocabulary tests. Your progress is saved to your account.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#3d63e8",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getSessionTheme();
  return (
    <html
      lang="en"
      className={`${googleSans.variable} ${googleSansFlex.variable}`}
      data-theme={theme === "system" ? undefined : theme}
    >
      <body>
        <ToastProvider>
          <ConfirmProvider>
            <LoadingProvider>
              <Navbar />
              {children}
            </LoadingProvider>
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

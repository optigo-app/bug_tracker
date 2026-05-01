import { Public_Sans } from "next/font/google";
import "@/styles/globals.scss";
import ThemeRegistry from "@/components/ThemeRegistry";
import MainLayout from "@/components/MainLayout";
import LocalizationProviderWrapper from "@/components/LocalizationProviderWrapper";
import { Toaster } from "react-hot-toast";
import { BugProvider } from "@/contexts/BugContext";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata = {
  title: "Bug Tracker - Optigo Apps",
  description: "Track and manage bugs efficiently with our bug tracking system",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={publicSans.variable}>
        <BugProvider>
          <LocalizationProviderWrapper>
            <ThemeRegistry>
              <MainLayout>
                {children}
              </MainLayout>
            </ThemeRegistry>
          </LocalizationProviderWrapper>
          <Toaster position="top-right" />
        </BugProvider>
      </body>
    </html>
  );
}

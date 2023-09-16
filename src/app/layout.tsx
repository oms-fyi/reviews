import { Analytics } from "@vercel/analytics/react";
import classnames from "classnames";
import { Open_Sans } from "next/font/google";
import type { PropsWithChildren as Props } from "react";

import { Footer } from "src/components/footer";
import { Header } from "src/components/header";

import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

export default function RootLayout({ children }: Props): JSX.Element {
  return (
    <html className="h-full">
      <body
        className={classnames(
          openSans.variable,
          "flex h-full flex-col bg-gray-100 font-sans"
        )}
      >
        <Header />
        <main className="grow">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}

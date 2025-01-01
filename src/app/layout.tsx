import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import classNames from "classnames";
import type { Metadata } from "next";
import Image from "next/image";
import { PropsWithChildren } from "react";

import { Header } from "src/components/header";
import { inter } from "src/styles/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to Next.js",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className="h-full">
      <body
        className={classNames(
          inter.variable,
          "flex h-full flex-col bg-gray-100 font-sans",
        )}
      >
        <Header />
        <main className="grow">{children}</main>
        <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-white px-4 py-2 text-gray-400">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} OMSCentral.{" "}
            <span className="max-sm:sr-only">All rights reserved.</span>
          </p>
          <a href="https://www.buymeacoffee.com/omstech">
            <Image
              height={32}
              width={150}
              src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=omstech&button_colour=4f46e5&font_colour=ffffff&font_family=Cookie&outline_colour=ffffff&coffee_colour=FFDD00"
              alt="Donate to omscentral.com"
            />
          </a>
        </footer>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import classNames from "classnames";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Head from "next/head";
import Image from "next/image";

import { Header } from "src/components/header";
import "src/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📝</text></svg>"
        />
      </Head>
      <Header />
      <main className={classNames(inter.className, "my-1 overflow-y-auto")}>
        <Component {...pageProps} />
        <SpeedInsights />
      </main>
      <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-white px-4 py-2 text-gray-400">
        <p className="text-center text-xs">
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
      <Analytics />
    </>
  );
}

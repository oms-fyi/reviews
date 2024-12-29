import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import classNames from "classnames";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import Head from "next/head";

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
      <footer className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="https://www.buymeacoffee.com/omstech">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=omstech&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff"
                alt="Donate to omscentral.com"
              />
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} OMSCentral. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      <Analytics />
    </>
  );
}

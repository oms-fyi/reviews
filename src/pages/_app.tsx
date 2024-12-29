import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

import { Footer } from "src/components/footer";
import { Header } from "src/components/header";
import "src/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Header />
      <div className={`${inter.className} grow`}>
        <Component {...pageProps} />
        <SpeedInsights />
      </div>
      <Footer />
      <Analytics />
    </>
  );
}

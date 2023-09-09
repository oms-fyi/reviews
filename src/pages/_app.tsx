import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";
import { Open_Sans } from "next/font/google";

import { Footer } from "src/components/footer";
import { Header } from "src/components/header";

import "../assets/css/global.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <div className={`${openSans.variable} font-sans`}>
      <Header />
      <div className="grow">
        <Component {...pageProps} />
      </div>
      <Footer />
      <Analytics />
    </div>
  );
}

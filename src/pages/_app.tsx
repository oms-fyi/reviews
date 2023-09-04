import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";

import { Footer } from "src/components/footer";
import { Header } from "src/components/header";
import "src/styles/globals.css";

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      {/* <Banner /> */}
      <Header />
      <div className="grow">
        <Component {...pageProps} />
      </div>
      <Footer />
      <Analytics />
    </>
  );
}

import { Analytics } from "@vercel/analytics/react";
import type { AppProps } from "next/app";

import { Footer } from "src/components/footer";
import { Header } from "src/components/header";
import "src/styles/globals.css";

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      {/* <Banner /> */}
      <div className="flex max-h-screen min-h-screen flex-col">
        <Header />
        <main className="flex w-screen grow flex-col justify-center">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
      <Analytics />
    </>
  );
}

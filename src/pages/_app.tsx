import type { AppProps } from "next/app";
import Script from "next/script";

import "src/styles/globals.css";
import { Header } from "src/components/header";
import { Footer } from "src/components/footer";
// import { Banner } from "src/components/banner";

const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      {/* <Banner /> */}
      <Header />
      <div className="grow">
        <Component {...pageProps} />
      </div>
      <Footer />
      {analyticsId && (
        <>
          <Script
            defer
            src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];

            function gtag(){ dataLayer.push(arguments); }

            gtag("js", new Date());
            gtag("config", "${analyticsId}");
          `}
          </Script>
        </>
      )}
    </>
  );
}

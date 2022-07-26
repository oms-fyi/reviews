import { FC } from "react";

import type { AppProps } from "next/app";
import Script from "next/script";

import "../styles/globals.css";
import { Header } from "../components/Header";

const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;

const MyApp: FC<AppProps> = function MyApp({ Component, pageProps, router }) {
  return (
    <>
      <Header router={router} />
      <Component {...pageProps} />
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
};

export default MyApp;

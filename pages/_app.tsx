import { useState, useEffect } from 'react';

import type { AppProps } from 'next/app';
import Script from 'next/script';
import Head from 'next/head';

import 'styles/globals.css';
import Header from 'components/Header';
import Banner from 'components/Banner';

const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  const [isDarkModePreferred, setIsDarkModePreferred] = useState<boolean>();

  useEffect(() => {
    const queryList = window.matchMedia('(prefers-color-scheme: dark)');

    if (typeof isDarkModePreferred === 'undefined') {
      setIsDarkModePreferred(queryList.matches);
      return function cleanup() {};
    }

    function listener(e: MediaQueryListEvent): void {
      setIsDarkModePreferred(e.matches);
    }

    if ('addEventListener' in queryList) {
      queryList.addEventListener('change', listener);
    } else {
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList
      // MQL didn't inherit from EventTarget (so no addEventListener) until
      // iOS Safari 14. Need this as a fallback
      queryList.addListener(listener);
    }

    return function cleanup() {
      queryList.removeEventListener('change', listener);
    };
  }, [isDarkModePreferred]);

  return (
    <>
      <Head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href={`/favicon-32x32${isDarkModePreferred ? '-dark' : ''}.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href={`/favicon-16x16${isDarkModePreferred ? '-dark' : ''}.png`}
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Banner />
      <Header />
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
}

import { useState, useEffect } from 'react';

import type { AppProps } from 'next/app';
import Script from 'next/script';

import 'src/styles/globals.css';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';
import Banner from 'src/components/Banner';

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
      <Banner />
      <Header />
      <Component {...pageProps} />
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

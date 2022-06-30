import "../styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import Banner from "../components/Banner";

const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;

const Analytics = () => {
  // Only really need to capture analytics in prod
  if (!analyticsId) return null;

  return (
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
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      {/* <Banner /> */}
    </>
  );
}

export default MyApp;

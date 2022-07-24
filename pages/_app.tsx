import { FC, useEffect, useState } from "react";

import type { AppProps } from "next/app";
import Script from "next/script";

import { Banner } from "../components/Banner";

import "../styles/globals.css";

const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;

const newFeatureAnnouncementMessage =
  process.env.NEXT_PUBLIC_NEW_FEATURE_ANNOUNCEMENT_MESSAGE;
const newFeatureAnnouncementKey =
  process.env.NEXT_PUBLIC_NEW_FEATURE_ANNOUNCEMENT_KEY;

const MyApp: FC<AppProps> = ({ Component, pageProps }) => {
  const [showBanner, setShowBanner] = useState<boolean>();

  useEffect(() => {
    setShowBanner(
      Boolean(
        newFeatureAnnouncementKey &&
          window.localStorage.getItem(newFeatureAnnouncementKey) === null
      )
    );
  }, []);

  useEffect(() => {
    if (showBanner === false && newFeatureAnnouncementKey) {
      window.localStorage.setItem(newFeatureAnnouncementKey, "1");
    }
  }, [showBanner]);

  return (
    <>
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
      {showBanner && newFeatureAnnouncementMessage && (
        <Banner
          onDismiss={() => setShowBanner(false)}
          message={newFeatureAnnouncementMessage}
        />
      )}
    </>
  );
};

export default MyApp;

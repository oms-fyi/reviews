import { Html, Head, Main, NextScript } from "next/document";

const MyDocument = function MyDocument(): JSX.Element {
  return (
    <Html className="h-full">
      <Head />
      <body className="h-full bg-gray-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default MyDocument;

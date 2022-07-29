import { Html, Head, Main, NextScript } from "next/document";

export default function Document(): JSX.Element {
  return (
    <Html className="h-full">
      <Head />
      <body className="h-full bg-gray-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

// src/pages/_document.js
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Preconnect & Google Inter font */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap"
            rel="stylesheet"
          />
          {/* Fav icon placeholder - optional */}
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <meta name="color-scheme" content="dark light" />
          <meta name="theme-color" content="#f3f4f6" media="(prefers-color-scheme: light)" />
          <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;

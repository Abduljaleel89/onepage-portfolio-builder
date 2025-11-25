import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Create a professional portfolio and CV in minutes" />
        <meta name="keywords" content="portfolio, cv, resume, builder, professional" />
        <meta name="author" content="Portfolio Builder" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Portfolio Builder - Create Professional CVs" />
        <meta property="og:description" content="Create a professional portfolio and CV in minutes" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Portfolio Builder" />
        <meta name="twitter:description" content="Create a professional portfolio and CV in minutes" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

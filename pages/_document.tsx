import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Dashboard Bimbingan Konseling untuk Guru BK" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="apple-touch-icon" href="/icons/icons.png" />
        <link rel="icon" href="/icons/icons.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

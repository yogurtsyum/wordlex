import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>twordle — custom wordle games</title>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </Head>
      <Component {...pageProps} />
      <script src="https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js" />
    </>
  )
  return <Component {...pageProps} />
}

export default MyApp;
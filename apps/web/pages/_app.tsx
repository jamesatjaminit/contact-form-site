import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";

import type { AppProps } from "next/app";
import { DefaultSeo } from "next-seo";

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({ Component, pageProps }: any) {
  return (
    <SessionProvider session={pageProps.session}>
      <DefaultSeo dangerouslySetAllPagesToNoIndex />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

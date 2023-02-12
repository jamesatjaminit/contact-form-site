import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import { DefaultSeo } from "next-seo";

export default function App({ Component, pageProps }: any) {
  return (
    <SessionProvider session={pageProps.session}>
      <DefaultSeo
        dangerouslySetAllPagesToNoIndex
        titleTemplate="%s | Contact Site"
      />
      <Component {...pageProps} />
    </SessionProvider>
  );
}

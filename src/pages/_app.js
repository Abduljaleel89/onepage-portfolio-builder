import "../styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

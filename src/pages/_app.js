import "../styles/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import GlobalChatbot from "@/components/GlobalChatbot";

export default function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PortfolioProvider>
          <Component {...pageProps} />
          <GlobalChatbot />
        </PortfolioProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

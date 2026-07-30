import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import { useEffect } from "react";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  useEffect(() => {
    // Add JSON-LD structured data for search engines
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.innerHTML = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      'name': 'Snooker Fair - 遊戲結算計算工具',
      'description': '專業遊戲結算計算工具。支持 Pot 波和啤珠兩種模式，自動計算每位玩家的水錢負擔、分數損益及最終結算金額。',
      'url': 'https://snooker-fair.pages.dev',
      'applicationCategory': 'UtilityApplication',
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'HKD'
      },
      'author': {
        '@type': 'Organization',
        'name': 'Snooker Fair'
      },
      'inLanguage': ['zh-TW', 'en'],
      'operatingSystem': 'Web',
      'browserRequirements': 'Requires JavaScript enabled'
    });
    document.head.appendChild(schemaScript);

    return () => {
      if (schemaScript.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

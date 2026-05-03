import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TradeMasteryAI | Free AI-Powered Forex Trading Tools & Education" },
      { name: "description", content: "Master forex trading with free AI tools, gold scalper strategies, and interactive learning. US-based trading education platform with real-time analysis." },
      { name: "keywords", content: "forex trading, free trading tools, AI trading, gold scalper, forex education, online trading platform, trading simulator, technical analysis, forex strategy, US trading" },
      { name: "author", content: "TradeMasteryAI" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "TradeMasteryAI | Learn Forex Trading with Free AI Tools" },
      { property: "og:description", content: "Free forex trading platform with AI analysis, gold scalper tools, technical indicators, and interactive learning. Available in the US." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://trademasteryai.com" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@TradeMasteryAI" },
      { name: "twitter:title", content: "TradeMasteryAI | Free Forex Trading Education" },
      { name: "twitter:description", content: "Learn forex with AI tutors, free tools, and real-time trading simulators. US trading community." },
      { name: "geo.region", content: "US" },
      { name: "geo.placename", content: "United States" },
      { name: "ICBM", content: "39.8283,-98.5795" },
      { httpEquiv: "Content-Language", content: "en-US" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "https://trademasteryai.com" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://trademasteryai.com/#organization",
        "name": "TradeMasteryAI",
        "url": "https://trademasteryai.com",
        "logo": "https://trademasteryai.com/logo.png",
        "description": "Free AI-powered forex trading education platform with trading tools and gold scalper strategies",
        "sameAs": ["https://twitter.com/TradeMasteryAI"],
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "US"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://trademasteryai.com/#website",
        "url": "https://trademasteryai.com",
        "name": "TradeMasteryAI",
        "description": "Learn forex trading with free AI tools, technical analysis, and trading simulators",
        "publisher": {
          "@id": "https://trademasteryai.com/#organization"
        }
      },
      {
        "@type": "EducationalOrganization",
        "@id": "https://trademasteryai.com/#education",
        "name": "TradeMasteryAI",
        "url": "https://trademasteryai.com",
        "description": "Online forex trading education platform offering AI-powered learning tools",
        "offers": {
          "@type": "EducationalOffer",
          "name": "Forex Trading Education",
          "description": "Learn forex trading with interactive simulators and AI tutors"
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <HeadContent />
        {/* Anti-FOUC: apply saved theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('tmai-theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();` }} />
        {/* Schema.org structured data for SEO */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}

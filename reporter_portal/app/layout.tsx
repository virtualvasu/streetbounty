import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StreetBounty | Road Incident Reporting DApp',
  description: 'StreetBounty is a civic-tech DApp for reporting road incidents and earning XLM rewards on Stellar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var key = 'streetbounty-theme';
                  var saved = localStorage.getItem(key);
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved || (prefersDark ? 'dark' : 'light');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
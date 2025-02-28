import "./globals.css";
import "../css/styles.css";
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={""}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

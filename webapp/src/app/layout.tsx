import "@/app/globals.css";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "ScriptHelper",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-light text-secondary overflow-hidden">
        {children}
      </body>
    </html>
  );
}

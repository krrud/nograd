import type {Metadata} from "next";
import {Inter, Nunito, Fira_Sans} from "next/font/google";
import "./globals.css";
import * as tf from '@tensorflow/tfjs';

const inter = Inter({ subsets: ["latin"] });
const nunito = Nunito({ subsets: ["latin"] });
const firaSans = Fira_Sans({ weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NoGrad",
  description: "Intuitive AI for Everyone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={firaSans.className}>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Image from "next/image";
import {PhoneIcon} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bird Alert - By Iowa Bird Rehabilitation",
  description: "​Wild birds play a critical role in our ecosystem, and with the population of birds in decline, now is the time to make changes. At IBR, we not only want to support our community in providing a place to take injured and orphaned wild birds, but also provide education, outreach, and be a beacon for wildlife conservation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
      <div>
        <Card className="bg-fill bg-center text-white rounded-none" style={{ backgroundImage: "url('../images/birds.jpg')" }}>
          <CardTitle className="text-2xl font-bold px-6 pt-12"><Image
              src="/images/logo.png"
              width={70}
              height={70}
              className={"float-left pr-2"}
              alt="Iowa Bird Rehabilitation Logo"
          />
            Iowa Bird Rehabilitation</CardTitle>
          <CardContent>
            <div className="flex items-center text-sm text-stone-300 pb-6">
              <span>Creating a future for our feathered friends.</span>
            </div>
          </CardContent>
        </Card>
        <div className={inter.className}>
          {children}
        </div>
        <Card key="emergency"
              className="rounded-xl border text-card-foreground overflow-hidden border-none shadow-none bg-stone-100">
          <CardHeader className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg font-semibold">Emergency</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            If you're having an emergency with a bird rescue, call us.
          </CardContent>
          <CardFooter className="bg-stone-50 p-4">
            <a href="tel:5152075008"
               className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm hover:text-accent-foreground h-9 px-4 py-2 w-full bg-red-600 hover:bg-red-300 transition-colors duration-200 ease-in-out text-white"
            >
              <PhoneIcon className="mr-2"/> Call
            </a>
          </CardFooter>
        </Card>
      </div>
      </body>
    </html>
);
}

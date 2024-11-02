'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Image from "next/image";
import {PhoneIcon} from "lucide-react";
import {Amplify} from "aws-amplify"
import awsExports from "../aws-exports"
import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from "@aws-amplify/ui-react";


const inter = Inter({ subsets: ["latin"] });
Amplify.configure({ ...awsExports });

const formFields = {
  signUp: {
    email: {
      order: 1
    }
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <html lang="en">
      <head>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="googlebot" content="noindex,nofollow" />
        <title>Bird Alert - By Iowa Bird Rehabilitation</title>
        <meta name="description" content="​Wild birds play a critical role in our ecosystem, and with the population of birds in decline, now is the time to make changes. At IBR, we not only want to support our community in providing a place to take injured and orphaned wild birds, but also provide education, outreach, and be a beacon for wildlife conservation." />
      </head>
      <body className="content-center items-center" >
        <Card className=" bg-center text-white bg-cover rounded-none flex justify-between items-center absolute right-0 left-0 top-0 w-100" style={{ backgroundImage: "url('../images/birds.jpg')" }}>
          <div>
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
          </div>
        </Card>
            
        <Authenticator formFields={formFields}>
          {({ signOut, user }) => (
          <div>
            <div className="mr-6 absolute top-10 right-0 mt-3 md:block hidden">
              <p className="mb-2 text-stone-300">Current User: {user?.username}</p>
              <button className="w-32 py-1 rounded-md bg-red-700 hover:bg-red-800 text-white transition-colors duration-200" onClick={signOut}>Sign out</button>
            </div>

            <div className={`${inter.className} pt-40`}>
              {children}
            </div>

            <div className="-mt-10 gap-5 md:hidden bg-stone-100 w-100 pt-5 pl-4 text-stone-500">
                <p className="mb-2">Current User: {user?.username}</p>
                <button className="w-32 py-1 rounded-md bg-red-700 hover:bg-red-800 text-white transition-colors duration-200" onClick={signOut}>Sign out</button>
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
              <CardFooter className="bg-stone-100 p-4">
                <a href="tel:5152075008"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm hover:text-accent-foreground h-9 px-4 py-2 w-full bg-red-600 hover:bg-red-300 transition-colors duration-200 ease-in-out text-white"
                >
                  <PhoneIcon className="mr-2"/> Call
                </a>
              </CardFooter>
            </Card>
            <div className=" bg-stone-100 pb-4 border-t border-white/10 pt-8 ">
              <p className="text-xs leading-5 text-stone-400 text-center	">COPYRIGHT &copy; Iowa Bird Rehabilitation 2012-2024. ALL RIGHTS RESERVED.
              </p>
            </div>
          </div>
          )}
        </Authenticator>
      </body>
      
    </html>
);
}

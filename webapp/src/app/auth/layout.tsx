"use client";
import Link from "next/link";
import Image from "next/image";
import { ApolloWrapper } from "../../../lib/ApolloWrapper";
import { AuthProvider } from "@/context/AuthContext";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApolloWrapper>
      <AuthProvider>
        <main className="h-screen overflow-y-auto scrollWrapper">
          <div className="flex flex-col items-center justify-between h-screen">
            <div className="my-auto flex w-[330px] max-w-full flex-col items-center justify-center relative pb-32">
              <Link href="/" className="relative py-12">
                <Image
                  src="/sh-logo.svg"
                  width="256"
                  height="50"
                  alt="Script Helper icon"
                  priority={true}
                />
              </Link>
              {children}
            </div>
          </div>
        </main>
      </AuthProvider>
    </ApolloWrapper>
  );
}

"use client";
import { AuthProvider } from "@/context/AuthContext";
import { ApolloWrapper } from "../../../lib/ApolloWrapper";
import HomeSidebar from "../HomeSidebar";
import Head from "next/head";
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApolloWrapper>
      <AuthProvider>
        <main className="grid grid-cols-[64px_260px_minmax(540px,1fr)] grid-rows-[64px_74px_1fr_95px] h-screen relative pr-8 scrollWrapper">
          <HomeSidebar />
          {children}
        </main>
      </AuthProvider>
    </ApolloWrapper>
  );
}

"use client";
import Sidebar from "@/app/Sidebar";
import Titlebar from "@/app/Titlebar";
import { useSearchParams } from "next/navigation";
import { ApolloWrapper } from "../../../lib/ApolloWrapper";
import { AuthProvider } from "@/context/AuthContext";
import { MovieProvider } from "@/context/MovieContext";
import { SceneProvider } from "@/context/SceneContext";
export default function MovieLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const query = useSearchParams();
  const movieId = query.get("id");
  return (
    <ApolloWrapper>
      <AuthProvider>
        <MovieProvider>
          <SceneProvider projectId={movieId}>
            <main className="grid grid-cols-[64px_350px_750px_80px] grid-rows-[64px_74px_1fr] overflow-hidden h-screen max-h-screen max-w-[1300px] relative">
              <Sidebar movieId={movieId} />
              <Titlebar movieId={movieId} />
              {children}
            </main>
          </SceneProvider>
        </MovieProvider>
      </AuthProvider>
    </ApolloWrapper>
  );
}

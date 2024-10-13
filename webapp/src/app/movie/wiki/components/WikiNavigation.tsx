"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
export default function WikiNavigation() {
  const query = useSearchParams();
  const pathname = usePathname();
  const movieId = query.get("id");
  return (
    <div className="absolute bottom-8 left-[50%] translate-x-[-50%] bg-secondary/80 backdrop-blur-[2px] text-offwhite  rounded-full py-3 px-6 w-max flex gap-1 items-center text-[16px]">
      {/* <Link
        href={`/movie/wiki/synopsis?id=${movieId}`}
        className={`opacity-80 cursor-pointer hover:opacity-100 transition focus:outline-none ${
          pathname === `/movie/wiki/synopsis`
            ? "font-displayBold !opacity-100"
            : ""
        }`}
      >
        Synopsis
      </Link>
      &nbsp; | &nbsp; */}
      <Link
        href={`/movie/wiki/characters?id=${movieId}`}
        className={`opacity-80 cursor-pointer hover:opacity-100 transition focus:outline-none ${
          pathname === `/movie/wiki/characters`
            ? "font-displayBold !opacity-100"
            : ""
        }`}
      >
        Characters
      </Link>
      &nbsp; | &nbsp;
      <Link
        href={`/movie/wiki/locations?id=${movieId}`}
        className={`opacity-80 cursor-pointer hover:opacity-100 transition focus:outline-none ${
          pathname === `/movie/wiki/locations`
            ? "font-displayBold !opacity-100"
            : ""
        }`}
      >
        Locations
      </Link>
      &nbsp; | &nbsp;
      <Link
        href={`/movie/wiki/styles?id=${movieId}`}
        className={`opacity-80 cursor-pointer hover:opacity-100 transition focus:outline-none ${
          pathname === `/movie/wiki/styles`
            ? "font-displayBold !opacity-100"
            : ""
        }`}
      >
        Styles
      </Link>
      &nbsp; | &nbsp;
      <Link
        href={`/movie/wiki/flavors?id=${movieId}`}
        className={`opacity-80 cursor-pointer hover:opacity-100 transition focus:outline-none ${
          pathname === `/movie/wiki/flavors`
            ? "font-displayBold !opacity-100"
            : ""
        }`}
      >
        Flavors
      </Link>
    </div>
  );
}

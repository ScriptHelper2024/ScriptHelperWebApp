"use client";
import { useContext, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { MdArrowBackIosNew, MdHelp, MdLogout, MdPerson } from "react-icons/md";
import { useMeQuery } from "@/graphql/__generated__/me.generated";
import {
  Button,
  Dialog,
  DialogTrigger,
  OverlayArrow,
  Popover,
} from "react-aria-components";
interface SidebarProps {
  movieId: string | null;
}
export default function Sidebar({ movieId }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { setAuthState } = useContext(AuthContext);
  const { data, loading } = useMeQuery({ variables: {} });
  const [emailVerified, setEmailVerified] = useState(false);
  useEffect(() => {
    if (!loading && data?.me?.emailVerified) {
      setEmailVerified(data.me.emailVerified);
    }
  }, [loading, data]);
  const getInitials = (str: String | any) => {
    const words = str?.split(" ");
    if (!words) return "";
    const initials = words
      .slice(0, 2)
      .map((word: String | any) => word[0])
      .join("");
    return initials.toUpperCase();
  };
  const fullName = data?.me?.firstName + " " + data?.me?.lastName;
  const isRouteActive = (route: string): boolean => pathname === route;
  return (
    <div className="col-start-1 relative row-span-full flex flex-col justify-between items-center bg-white rounded-tr-2xl rounded-br-2xl shadow-xl shadow-black/30 z-50 h-screen max-h-screen w-[64px]">
      <Link
        href="/home"
        className="w-full flex justify-center items-center px-2 py-3 bg-secondary cursor-pointer rounded-tr-2xl group"
      >
        <Image
          src="/nav-icon.svg"
          width={40}
          height={40}
          alt="Script Helper icon"
          priority
        />
        <span className="opacity-0 group-hover:opacity-100 duration-500 fixed left-[75px] w-32 h-6 flex gap-2 items-center top-[20px] text-secondary hover:text-secondary-hover transition cursor-default">
          <Image src="/sh-wordmark.svg" alt="Script Helper" fill={true} />
        </span>
      </Link>
      <div className="my-auto pb-[70px]">
        <div className="my-auto flex flex-col gap-6">
          <Link href={`/movie/movie?id=${movieId}`}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask
                id="mask0_2020_19903"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="24"
                height="24"
              >
                <rect width="24" height="24" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_2020_19903)">
                <path
                  d="M4.3077 4.5L6.05768 7.99998H9.05768L7.3077 4.5H9.3077L11.0577 7.99998H14.0577L12.3077 4.5H14.3077L16.0577 7.99998H19.0577L17.3077 4.5H19.6923C20.1974 4.5 20.625 4.675 20.975 5.025C21.325 5.375 21.5 5.80257 21.5 6.3077V17.6923C21.5 18.1974 21.325 18.625 20.975 18.975C20.625 19.325 20.1974 19.5 19.6923 19.5H4.3077C3.80257 19.5 3.375 19.325 3.025 18.975C2.675 18.625 2.5 18.1974 2.5 17.6923V6.3077C2.5 5.80257 2.675 5.375 3.025 5.025C3.375 4.675 3.80257 4.5 4.3077 4.5ZM3.99998 9.49995V17.6923C3.99998 17.782 4.02883 17.8557 4.08653 17.9134C4.14423 17.9711 4.21795 18 4.3077 18H19.6923C19.782 18 19.8557 17.9711 19.9134 17.9134C19.9711 17.8557 20 17.782 20 17.6923V9.49995H3.99998Z"
                  fill="#132F3D"
                  className={
                    isRouteActive("/movie/movie")
                      ? "fill-primary"
                      : "fill-secondary"
                  }
                />
              </g>
            </svg>
          </Link>
          <Link href={`/movie/scenes?id=${movieId}`}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask
                id="mask0_2020_19906"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="24"
                height="24"
              >
                <rect width="24" height="24" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_2020_19906)">
                <path
                  d="M15.0653 14.4154L16.071 10.775L12.9537 8.62312L11.948 12.2635L15.0653 14.4154ZM4.30761 19.0558L3.68453 18.7616C3.16145 18.5385 2.80824 18.1629 2.62491 17.6347C2.44157 17.1065 2.46657 16.5872 2.69991 16.077L4.30761 12.6097V19.0558ZM8.49991 20.8846C7.94991 20.8846 7.47907 20.6862 7.08741 20.2894C6.69574 19.8926 6.49991 19.4192 6.49991 18.8692V13.5193L8.94413 20.2346C8.99413 20.3577 9.03901 20.4718 9.07876 20.5769C9.11849 20.6821 9.18002 20.7846 9.26336 20.8846H8.49991ZM13.2557 20.3365C12.7839 20.507 12.3185 20.4884 11.8595 20.2807C11.4005 20.0731 11.0858 19.7333 10.9153 19.2615L6.67301 7.57502C6.50249 7.10324 6.52268 6.64042 6.73358 6.18657C6.94446 5.73273 7.28581 5.42056 7.75761 5.25004L14.7249 2.70199C15.1967 2.53148 15.6595 2.55167 16.1133 2.76257C16.5672 2.97345 16.8793 3.31479 17.0499 3.78659L21.3075 15.4731C21.478 15.9449 21.4595 16.4077 21.2518 16.8615C21.0441 17.3154 20.7043 17.6276 20.2325 17.7981L13.2557 20.3365ZM12.7384 18.9135L19.7114 16.375C19.7947 16.343 19.854 16.2901 19.8893 16.2164C19.9246 16.1426 19.9262 16.0641 19.8941 15.9808L15.6403 4.30774C15.6082 4.22439 15.5553 4.16509 15.4816 4.12984C15.4079 4.09458 15.3294 4.09297 15.246 4.12502L8.28836 6.66347C8.20502 6.69552 8.14572 6.74841 8.11046 6.82214C8.07521 6.89586 8.07361 6.97439 8.10566 7.05774L12.3441 18.7308C12.3762 18.8141 12.429 18.8734 12.5028 18.9087C12.5765 18.9439 12.655 18.9455 12.7384 18.9135Z"
                  className={
                    isRouteActive("/movie/scenes") ||
                    isRouteActive("/movie/scenes/scene") ||
                    isRouteActive("/movie/scenes/scene/new")
                      ? "fill-primary"
                      : "fill-secondary"
                  }
                />
              </g>
            </svg>
          </Link>
          <Link href={`/movie/wiki/characters?id=${movieId}`}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask
                id="mask0_2020_19909"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="24"
                height="24"
              >
                <rect width="24" height="24" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_2020_19909)">
                <path
                  d="M1.79834 19.3077V17.0846C1.79834 16.5693 1.93136 16.1093 2.19739 15.7049C2.46341 15.3004 2.81867 14.9857 3.26319 14.7608C4.21354 14.2959 5.16916 13.9376 6.13004 13.6856C7.09094 13.4337 8.14703 13.3078 9.29832 13.3078C10.4496 13.3078 11.5057 13.4337 12.4666 13.6856C13.4275 13.9376 14.3831 14.2959 15.3334 14.7608C15.778 14.9857 16.1332 15.3004 16.3992 15.7049C16.6653 16.1093 16.7983 16.5693 16.7983 17.0846V19.3077H1.79834ZM18.7983 19.3077V16.9616C18.7983 16.3052 18.6375 15.6796 18.3161 15.0848C17.9947 14.4901 17.5387 13.9798 16.9483 13.5539C17.6188 13.6539 18.2553 13.8087 18.8579 14.0183C19.4604 14.228 20.0354 14.4757 20.5829 14.7616C21.0995 15.0372 21.4986 15.3621 21.78 15.7362C22.0614 16.1103 22.2021 16.5188 22.2021 16.9616V19.3077H18.7983ZM9.29832 11.6923C8.33583 11.6923 7.51188 11.3496 6.82646 10.6642C6.14105 9.97879 5.79834 9.15484 5.79834 8.19236C5.79834 7.22986 6.14105 6.40591 6.82646 5.72051C7.51188 5.03509 8.33583 4.69238 9.29832 4.69238C10.2608 4.69238 11.0847 5.03509 11.7702 5.72051C12.4556 6.40591 12.7983 7.22986 12.7983 8.19236C12.7983 9.15484 12.4556 9.97879 11.7702 10.6642C11.0847 11.3496 10.2608 11.6923 9.29832 11.6923ZM17.9328 8.19236C17.9328 9.15484 17.5901 9.97879 16.9047 10.6642C16.2193 11.3496 15.3953 11.6923 14.4329 11.6923C14.32 11.6923 14.1765 11.6795 14.0021 11.6539C13.8278 11.6282 13.6842 11.6 13.5714 11.5693C13.9657 11.0951 14.2688 10.5692 14.4806 9.99133C14.6924 9.4135 14.7983 8.81344 14.7983 8.19116C14.7983 7.56889 14.6903 6.97122 14.4742 6.39813C14.2582 5.82507 13.9573 5.29751 13.5714 4.81546C13.7149 4.76418 13.8585 4.73084 14.0021 4.71546C14.1457 4.70008 14.2893 4.69238 14.4329 4.69238C15.3953 4.69238 16.2193 5.03509 16.9047 5.72051C17.5901 6.40591 17.9328 7.22986 17.9328 8.19236ZM3.29831 17.8077H15.2983V17.0846C15.2983 16.8757 15.2461 16.6898 15.1416 16.5269C15.0371 16.3641 14.8714 16.2218 14.6445 16.1C13.8214 15.6757 12.9739 15.3542 12.1022 15.1356C11.2304 14.917 10.2957 14.8077 9.29832 14.8077C8.30088 14.8077 7.36626 14.917 6.49446 15.1356C5.62268 15.3542 4.77525 15.6757 3.95216 16.1C3.72525 16.2218 3.55954 16.3641 3.45504 16.5269C3.35056 16.6898 3.29831 16.8757 3.29831 17.0846V17.8077ZM9.29832 10.1924C9.84832 10.1924 10.3191 9.99653 10.7108 9.60486C11.1025 9.21319 11.2983 8.74236 11.2983 8.19236C11.2983 7.64236 11.1025 7.17153 10.7108 6.77986C10.3191 6.38819 9.84832 6.19236 9.29832 6.19236C8.74832 6.19236 8.27748 6.38819 7.88582 6.77986C7.49415 7.17153 7.29832 7.64236 7.29832 8.19236C7.29832 8.74236 7.49415 9.21319 7.88582 9.60486C8.27748 9.99653 8.74832 10.1924 9.29832 10.1924Z"
                  fill="#132F3D"
                  className={
                    isRouteActive("/movie/wiki/characters") ||
                    isRouteActive("/movie/wiki/locations") ||
                    isRouteActive("/movie/wiki/flavors") ||
                    isRouteActive("/movie/wiki/synopsis") ||
                    isRouteActive("/movie/wiki/styles")
                      ? "fill-primary"
                      : "fill-secondary"
                  }
                />
              </g>
            </svg>
          </Link>
          <DialogTrigger>
            <Button>
              <Image
                src="/cards.svg"
                width={24}
                height={24}
                alt="Script Helper icon"
              />
            </Button>
            <Popover>
              <OverlayArrow>
                <svg width={12} height={12} viewBox="0 0 12 12">
                  <path d="M0 0 L6 6 L12 0" />
                </svg>
              </OverlayArrow>
              <Dialog>
                <div className="bg-secondary text-white py-2 px-3 rounded-lg text-[12px]">
                  <div className="font-displayBold">Command Center</div>
                  <span className="opacity-50">Coming soon</span>
                </div>
              </Dialog>
            </Popover>
          </DialogTrigger>
        </div>
      </div>
      <div className="absolute bottom-0 pb-3 flex flex-col gap-3 justify-center items-center">
        <DialogTrigger>
          <Button>
            {fullName === "undefined undefined" || fullName === "null null" ? (
              <div className="bg-secondary/10 rounded-full w-[40px] h-[40px] flex items-center justify-center"></div>
            ) : (
              <div className="bg-secondary rounded-full w-[40px] h-[40px] flex items-center justify-center relative">
                {!emailVerified && (
                  <div className="bg-primary-hover w-[12px] h-[12px] rounded-full top-0 right-0 absolute"></div>
                )}
                <div className="font-displayBold text-white text-[11px]">
                  {getInitials(fullName)}
                </div>
              </div>
            )}
          </Button>
          <Popover>
            <OverlayArrow>
              <svg width={12} height={12} viewBox="0 0 12 12">
                <path d="M0 0 L6 6 L12 0" />
              </svg>
            </OverlayArrow>
            <Dialog>
              <div className="bg-secondary text-white pt-3 pb-2 px-4 flex flex-col gap-3 justify-start items-start rounded-lg">
                <div className="text-[13px] flex flex-col items-center gap-2 justify-start border-b-[1px] border-grey/50 pb-3 w-full text-center">
                  <div className="text-white/70">{data?.me?.email}</div>
                  {!emailVerified && (
                    <>
                      <Button
                        onPress={() => {
                          router.push("/auth/verify-email");
                          document.getElementById("userButton")?.click();
                        }}
                        className="rounded-full text-[12px] bg-primary hover:bg-primary-hover transition px-4 py-1 cursor-pointer w-full text-center"
                      >
                        Verify Email
                      </Button>
                      Your email address is unverified.
                    </>
                  )}
                </div>
                <Button
                  onPress={() => {
                    router.push("/home/settings");
                    document.getElementById("userButton")?.click();
                  }}
                  className="text-[13px] flex items-center gap-1 justify-start pb-1 w-full hover:text-white/70 transition"
                >
                  <div className="flex gap-2 items-center">
                    <MdPerson /> Account Settings
                  </div>
                </Button>
                <Link
                  href="/home/settings"
                  className="text-[13px] flex items-center gap-1 justify-start border-b-[1px] border-grey/50 pb-3 w-full hover:text-white/70 transition"
                >
                  <div className="flex gap-2 items-center">
                    <MdHelp /> Support
                  </div>
                </Link>
                <Button
                  onPress={() => {
                    setAuthState(null);
                    router.push("/");
                  }}
                  className="text-[13px] flex items-center gap-1 justify-start pb-2 w-full hover:text-white/70 transition"
                >
                  <div className="flex gap-2 items-center">
                    <MdLogout /> Log out
                  </div>
                </Button>
              </div>
            </Dialog>
          </Popover>
        </DialogTrigger>
      </div>
    </div>
  );
}

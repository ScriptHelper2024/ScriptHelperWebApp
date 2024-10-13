"use client";
import { useState, useEffect, useContext, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMeQuery } from "@/graphql/__generated__/me.generated";
import { AuthContext } from "@/context/AuthContext";
import { MdHelp, MdLogout, MdPerson } from "react-icons/md";
import {
  Button,
  Dialog,
  DialogTrigger,
  OverlayArrow,
  Popover,
} from "react-aria-components";

export default function HomeSidebar() {
  const router = useRouter();
  const { setAuthState, emailVerified, setEmailVerified } =
    useContext(AuthContext);
  const [initials, setInitials] = useState<string | null>(null);
  const { data, loading } = useMeQuery({ variables: {} });

  useEffect(() => {
    if (!loading && data?.me?.emailVerified && !emailVerified) {
      setEmailVerified(true);
    }
  }, [loading, data, emailVerified, setEmailVerified]);

  useEffect(() => {
    const getInitials = (str: string | null) => {
      const words = str?.split(" ");
      if (!words) return "";
      const initials = words
        .slice(0, 2)
        .map((word) => word[0])
        .join("");
      return initials.toUpperCase();
    };
    const fullName = data?.me?.firstName + " " + data?.me?.lastName;
    if (
      fullName.trim() !== "" &&
      fullName !== null &&
      fullName !== "undefined undefined" &&
      fullName !== undefined
    ) {
      const initialsFormatted = getInitials(fullName);
      setInitials(initialsFormatted);
    }
  }, [data]);

  return (
    <div className="fixed left-0 top-0 bottom-0 row-span-full flex flex-col justify-between items-center z-20 h-screen max-h-screen px-2 py-3 w-[64px]">
      <Link href="/home">
        <div className="w-full flex justify-center items-center rounded-tr-2xl rounded-br-2xl group">
          <Image
            src="/sh-icon.svg"
            width={40}
            height={40}
            alt="Script Helper icon"
            priority={true}
          />
          <span className="opacity-0 group-hover:opacity-100 duration-500 fixed left-[75px] w-32 h-6 flex gap-2 items-center top-[20px] text-secondary hover:text-secondary-hover transition cursor-default">
            <Image src="/sh-wordmark.svg" alt="Script Helper" fill={true} />
          </span>
        </div>
      </Link>
      <div className="mt-auto flex flex-col gap-3 justify-center items-center">
        <DialogTrigger>
          <Button id="userButton">
            {initials === null ? (
              <div className="bg-secondary/10 rounded-full w-[40px] h-[40px] flex items-center justify-center"></div>
            ) : (
              <div className="bg-secondary rounded-full w-[40px] h-[40px] flex items-center justify-center relative">
                {!emailVerified && (
                  <div className="bg-primary-hover w-[12px] h-[12px] rounded-full top-0 right-0 absolute"></div>
                )}
                <div className="font-displayBold text-white text-[11px]">
                  {initials}
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
                <button
                  onClick={() => {
                    setAuthState(null);
                    router.push("/");
                  }}
                  className="text-[13px] flex items-center gap-1 justify-start pb-2 w-full hover:text-white/70 transition"
                >
                  <div className="flex gap-2 items-center">
                    <MdLogout /> Log out
                  </div>
                </button>
              </div>
            </Dialog>
          </Popover>
        </DialogTrigger>
      </div>
    </div>
  );
}

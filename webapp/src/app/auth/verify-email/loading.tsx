import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-between h-screen">
      <div className="my-auto flex w-[330px] max-w-full flex-col items-center justify-center relative pb-32">
        <Image
          src="/sh-logo.svg"
          width="256"
          height="50"
          alt="Script Helper icon"
          priority={true}
        />
        <div className="bg-offwhite  mb-4 w-full rounded-2xl px-8 pb-8 pt-6">
          <div className="text-[24px] font-displayBold mb-4">
            Verify Email Address
          </div>

          <div className="mb-3">
            <div className="mb-2 block text-[11px] opacity-50">
              Verification Code
            </div>
          </div>
          <div
            className={`bg-secondary hover:bg-secondary-hover  text-offwhite mx-auto block mt-2 rounded-full px-6 py-2 transition focus:outline-none`}
          >
            Verify
          </div>
          <div className="text-xs cursor-pointer text-secondary mt-4 text-center hover:underline">
            Resend verification code
          </div>
        </div>
      </div>
    </div>
  );
}

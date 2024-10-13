import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-between h-screen">
      <div className="my-auto flex w-[330px] max-w-full flex-col items-center justify-center relative pb-32">
        <div className="relative py-12">
          <Image
            src="/sh-logo.svg"
            width="256"
            height="50"
            alt="Script Helper icon"
            priority={true}
          />
        </div>
        <div className="bg-offwhite mb-4 w-full rounded-2xl px-8 pb-8 pt-6">
          <div className="text-[24px] font-displayBold mb-4">Sign in</div>
          <div className="mb-4">
            <div className="block text-[10px] mb-2">Email Address</div>
            <input
              placeholder="Email Address"
              className="appearance-none w-full rounded-full h-[42px] bg-white border-[1px] border-light py-2 px-4 focus:outline-none"
            />
          </div>
          <div className="mb-3 relative">
            <div className="block text-[10px] mb-2">Password</div>
            <input
              placeholder="••••••••"
              className="appearance-none w-full rounded-full h-[42px] bg-white border-[1px] border-light py-2 pl-4 pr-[40px] focus:outline-none"
            />
          </div>
          <div className="flex justify-center gap-2">
            <div className="w-[100px] rounded-full bg-secondary transition hover:bg-secondary-hover text-offwhite py-2 px-4 focus:outline-none mt-2 text-center">
              Sign in
            </div>
            <div className="w-[100px] rounded-full bg-primary transition hover:bg-primary-hover text-offwhite py-2 px-4 focus:outline-none mt-2 text-center">
              Register
            </div>
          </div>
          <div className="text-[10px] text-center items-center flex flex-col text-primary  mt-8">
            <div className="flex gap-2">
              <div className="text-grey">
                Need help?{" "}
                <span className="underline hover:no-underline cursor-pointer">
                  Contact Support
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

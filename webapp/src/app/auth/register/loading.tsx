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
          <div className="text-[24px] font-displayBold mb-4">Register</div>
          <div className="mb-3">
            <div className="mb-2 block text-[11px] opacity-50">First Name</div>
            <input
              placeholder="First Name"
              className="border-light w-full appearance-none rounded-full h-[42px] border-[1px] bg-white px-4 py-2 focus:outline-none"
            />
          </div>
          <div className="mb-3">
            <div className="mb-2 block text-[11px] opacity-50">Last Name</div>
            <input
              placeholder="Last Name"
              className="border-light w-full appearance-none rounded-full h-[42px] border-[1px] bg-white px-4 py-2 focus:outline-none"
            />
          </div>
          <div className="mb-3">
            <div className="mb-2 block text-[11px] opacity-50">
              Email Address
            </div>
            <input
              placeholder="Email Address"
              className="border-light w-full appearance-none rounded-full h-[42px] border-[1px] bg-white px-4 py-2 focus:outline-none"
            />
          </div>
          <div className="relative mb-3">
            <div className="mb-2 block text-[11px] opacity-50">Password</div>
            <input
              placeholder="••••••••"
              className="border-light w-full appearance-none rounded-full h-[42px] border-[1px] bg-white py-2 pl-4 pr-[40px] focus:outline-none"
            />
          </div>
          <div className="bg-secondary hover:bg-secondary-hover  text-offwhite mx-auto block mt-2 w-[100px] rounded-full px-4 py-2 transition focus:outline-none cursor-pointer text-center">
            Register
          </div>
          <div className="mx-auto mt-3 mb-8 text-center text-sm">
            Already have an account? <div className="underline">Sign in</div>
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

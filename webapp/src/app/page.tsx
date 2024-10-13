import Image from "next/image";
import Link from "next/link";
export default function HomePage() {
  return (
    <main className="flex flex-col h-screen lg:flex-row items-center justify-between">
      <div className="w-full h-full lg:h-screen p-16 flex flex-col justify-between relative bg-light">
        <Image
          src="/sh-logo.svg"
          width="0"
          height="0"
          sizes="100vw"
          className="w-[256px] h-auto z-1 block mx-auto lg:mx-0"
          alt="Script Helper icon"
          priority={true}
        />
        <h3 className="z-1 font-display text-4xl leading-20 my-auto pt-16 text-center sm:text-5xl sm:leading-[50px] lg:pt-0 lg:text-left">
          The story starts&nbsp;here.
        </h3>
        <div className="bg-hero opacity-10 bg-cover z-0 absolute top-0 left-0 right-0 bottom-0"></div>
      </div>
      <div className="w-full h-full lg:h-screen flex flex-col items-center justify-center p-16 bg-offwhite ">
        <div className="my-auto">
          <h2 className="text-2xl text-center mb-5">Get started</h2>
          <div className="flex items-center gap-6 justify-between">
            <Link
              href="/auth/login"
              className="bg-secondary transition hover:bg-secondary-hover text-offwhite py-3 px-8 sm:px-12 sm:py-4 rounded-full focus:outline-none whitespace-nowrap font-displaySemiBold"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="bg-primary transition hover:bg-primary-hover text-offwhite py-3 px-8 sm:px-12 sm:py-4 rounded-full focus:outline-none whitespace-nowrap font-displaySemiBold"
            >
              Register
            </Link>
          </div>
        </div>
        <div className="relative mt-16 lg:mt-0 lg:absolute lg:bottom-16 text-xs text-center items-center flex flex-col text-primary">
          <Image
            src="/sh-wordmark-light.svg"
            width="0"
            height="0"
            sizes="100vw"
            className="w-auto h-[18px] mb-4"
            alt="Script Helper wordmark"
          />
          <div className="flex gap-2">
            <Link href="/" className="underline hover:no-underline">
              Terms of use
            </Link>
            <span>•</span>
            <Link href="/" className="underline hover:no-underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

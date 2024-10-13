export default function Loading() {
  return (
    <div className="col-start-2 col-span-full row-start-1 row-span-full flex flex-col gap-4 z-10">
      <div className="relative pt-16">
        <h3 className="mt-8 mb-8 z-1 font-displayBold text-[48px] leading-[52px] my-auto pt-16 lg:pt-0 pl-4">
          <span className="font-display opacity-20">Your story</span>{" "}
          <span className="font-sans">starts here.</span>
        </h3>
        <div className="flex gap-20 w-full max-w-[1100px]">
          <div className="grid grid-cols-1 gap-[20px] p-8 w-full sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <div className="h-[100px] w-full"></div>
          </div>
        </div>
        <div className="bg-gradient-to-t from-light to-transparent sticky bottom-0 left-0 right-0 h-[100px]"></div>
      </div>
    </div>
  );
}

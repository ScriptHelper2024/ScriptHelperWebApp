import { MdOutlineEditNote } from "react-icons/md";

export default function Loading() {
  <>
    <div className="col-start-1 col-span-2 pl-[64px] row-span-1 row-start-3 relative h-full bg-uiLight">
      <div className="flex flex-col p-4 h-full">
        <div className="font-displayBold pb-3 text-[12px]">Notes Generator</div>
        <div className="w-full border-secondary hover:border-secondary-hover text-secondary hover:text-secondary-hover transition border-dashed border-[1px] rounded-lg flex align-center justify-center gap-2 py-3 text-[14px] font-displayBold">
          <MdOutlineEditNote size={22} />
          Improve Text
        </div>
      </div>
    </div>
    <div className="row-span-1 row-start-3 h-full bg-white  relative overflow-hidden flex flex-col">
      <div className="scrollWrapper overflow-x-hidden w-full h-full">
        <div className="relative top-5 left-6 cursor-pointer w-[18px] opacity-10 transition hover:opacity-100"></div>
        <div className="w-full relative border-b-[1px] pt-4"></div>
        <div className="relative"></div>
      </div>
    </div>
    <div className="col-start-4 row-span-full row-start-2 h-full relative">
      <div className="flex flex-col justify-center items-center gap-5 bg-white px-2 py-3 rounded-full border-[1px] border-light w-fit top-[50%] translate-y-[-50%] absolute z-40 group">
        <div className="rounded-full w-[28px] h-[28px] flex justify-center items-center transition"></div>

        <div>
          <div className="bg-secondary hover:bg-secondary-hover rounded-full w-[28px] h-[28px] flex justify-center items-center"></div>
        </div>

        <div>
          <div className="bg-secondary hover:bg-secondary-hover rounded-full w-[28px] h-[28px] flex justify-center items-center"></div>
        </div>

        <div className="absolute -bottom-16 p-8 pt-4 transition-opacity">
          <div className="rounded-full bg-secondary hover:bg-secondary-hover text-white p-1"></div>
        </div>
      </div>
    </div>
  </>;
}

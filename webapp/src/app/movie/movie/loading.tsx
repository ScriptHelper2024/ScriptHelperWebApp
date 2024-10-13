import { MdOutlineEditNote } from "react-icons/md";
import { PiArrowLineLeftBold } from "react-icons/pi";

export default function Loading() {
  <>
    <div className="col-start-1 col-span-2 pl-[64px] row-span-1 row-start-3 relative max-h-full bg-uiLight">
      <div className="flex flex-col p-4 max-h-full">
        <div className="font-displayBold pb-3 text-[12px]">Notes Generator</div>
        <div className="w-full border-secondary hover:border-secondary-hover text-secondary hover:text-secondary-hover transition border-dashed border-[1px] rounded-lg flex align-center justify-center gap-2 py-3 text-[14px] font-displayBold">
          <MdOutlineEditNote size={22} />
          Improve Text
        </div>
      </div>
    </div>
    <div
      className={`col-start-3 row-span-1 row-start-3 max-h-full bg-white relative overflow-hidden flex flex-col`}
    >
      <div
        className={`scrollWrapper overflow-y-hidden overflow-x-hidden w-full h-full`}
      >
        <div className="relative top-5 left-6 cursor-pointer w-[18px] opacity-10 transition hover:opacity-100">
          <PiArrowLineLeftBold
            size={18}
            className="transition text-secondary hover:text-secondary-hover"
          />
        </div>
        <div className="grid grid-cols-[130px,1fr]">
          <div></div>
          <div className="col-start-2 pr-6 pt-4 pb-4 mb-4 w-full relative">
            <div className="font-displayBold pb-3 text-[12px] absolute left-0 top-4 z-10">
              Seed
            </div>
            <div className="relative">
              <div className="pt-12 pb-0">
                <div
                  id="seedText"
                  className="mb-[2px] whitespace-pre-wrap current-seed text-[14px] leading-[24px] w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 text-secondary/50 min-h-[63px]"
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full relative border-b-[1px] pt-4"></div>
        <div className={`relative`}>
          <div className={`grid grid-cols-[130px,1fr] transition`}>
            <div id="movieTextArea" className={`pt-8 relative`}>
              <div className="font-displayBold pb-3 text-[12px] absolute left-0 top-8 z-10">
                Movie Text
              </div>

              <div className="text-left pt-6">
                <div
                  className={`whitespace-pre-line flex flex-col overflow-hidden w-full leading-[24px] font-mono text-[12px] pb-12`}
                >
                  <div className="opacity-40">
                    <p className="text-light">
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                      &#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="col-start-4 row-span-full row-start-2 h-full relative"></div>
  </>;
}

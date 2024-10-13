import Image from "next/image";
import ScenesScaffold from "./components/Scenes-Scaffold";
export default function Loading() {
  return (
    <>
      <div className="col-start-1 col-span-3 pl-[64px] row-end-3 row-start-3 relative h-full bg-uiLight overflow-hidden">
        <div className="w-full max-w-[1300px] h-full pb-[61px] relative overflow-hidden">
          <div className="flex justify-between items-center bg-white px-6 py-3 border-b-[1px]">
            <h1 className="font-displayBold text-[24px]">Scenes Panel</h1>
            <div className="text-[16px] flex items-center gap-2">
              <Image
                src="/add_circle.svg"
                width={24}
                height={24}
                alt="Add scenes"
              />
            </div>
          </div>
          <div className="scrollWrapper h-full overflow-y-auto overflow-x-hidden">
            <div className="bg-uiLight p-6 pr-4">
              <div className="absolute bg-white left-0 right-0 top-[61px] bottom-0 z-10">
                <div className="absolute bottom-0 left-0 right-0 w-full h-[500px] bg-gradient-to-t from-white to-transparent z-20"></div>
                <ScenesScaffold />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

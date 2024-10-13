import { MdSettings } from "react-icons/md";
export default function Loading() {
  return (
    <>
      <div className="col-span-2 relative row-start-2 mt-4 col-start-2">
        <div className="bg-white z-10 w-full text-secondary/30 relative flex px-8 items-center justify-start h-[64px] rounded-tr-2xl rounded-tl-2xl gap-2 shadow-lg">
          <MdSettings /> Settings
        </div>
      </div>
      <div className="col-start-2 row-start-3 row-span-1 relative h-full bg-uiLight rounded-bl-2xl pt-8">
        <div className="w-full text-secondary  relative flex flex-col p-8 pt-12">
          <div className="text-2xl items-center font-displayBold mb-4">
            Your Settings
          </div>
          <p className="mb-8 text-[14px]">
            Update your profile or change your default Large Language Model.
          </p>
        </div>
      </div>
      <div className="col-start-3 row-start-3 row-span-1 h-full bg-uiLight  rounded-br-2xl relative flex flex-col pt-8">
        <div className="z-10 relative h-full mb-8">
          <div className="flex h-full relative">
            <div className="flex flex-col w-full p-8 pt-12 bg-white rounded-tl-2xl rounded-bl-2xl shadow-lg">
              <div className="w-full text-secondary  relative flex flex-col max-w-[400px]"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

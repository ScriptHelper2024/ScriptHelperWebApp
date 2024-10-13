import { MdArrowBackIosNew } from "react-icons/md";
export default function Loading() {
  return (
    <>
      <div className="col-span-2 relative row-start-2 mt-4 col-start-2">
        <div className="bg-white z-10 w-full text-secondary/30 relative flex px-8 items-center justify-between h-[64px] rounded-tr-2xl rounded-tl-2xl gap-2 shadow-lg">
          <div className="flex gap-2 items-center hover:opacity-100 transition text-[14px]">
            <span>
              <MdArrowBackIosNew />
            </span>
            Back to Projects
          </div>
        </div>
      </div>
      <div className="col-start-2 row-start-3 row-span-1 relative h-full bg-uiLight rounded-bl-2xl pt-8">
        <div className="w-full text-secondary  relative flex flex-col p-8 pt-12">
          <div className="text-2xl items-center font-displayBold mb-4">
            Questionnaire
          </div>
          <p className="mb-8 text-[14px]">
            Bring your movie idea to life! Fill out the form to jumpstart your
            scriptwriting journey.
          </p>
        </div>
      </div>
      <div className="col-start-3 row-start-3 row-span-1 h-full bg-uiLight  rounded-br-2xl relative flex flex-col py-8">
        <div className="z-10 relative h-full w-full">
          <div className="flex h-full relative">
            <div className="flex flex-col w-[800px] p-8 pt-12 bg-white rounded-tl-2xl rounded-bl-2xl shadow-lg">
              <div className="text-2xl items-center font-displayBold mb-4">
                Movie Idea
              </div>
              <p className="text-[18px] pr-8">
                Unleash your cinematic vision. Share your seed, grow your
                script.
              </p>
              <div className="rounded-2xl h-full mt-8">
                <div className="flex flex-col h-full pr-8"></div>
              </div>
            </div>
            <div className="w-full flex justify-center items-center h-full text-center p-8">
              <div className="font-displayBold text-white text-[32px] leading-[32px]">
                Your story starts here.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

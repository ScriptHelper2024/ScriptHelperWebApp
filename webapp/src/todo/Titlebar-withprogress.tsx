"use client";
import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  FieldError,
  Input,
  Label,
  OverlayArrow,
  Popover,
  ProgressBar,
  TextField,
} from "react-aria-components";
import { useUpdateProjectMutation } from "@/graphql/__generated__/updateProject.generated";
import {
  MdCheckCircleOutline,
  MdEdit,
  MdOutlineRadioButtonUnchecked,
} from "react-icons/md";
import { useGetProjectTitleQuery } from "@/graphql/__generated__/getProjectTitle.generated";
interface TitlebarProps {
  movieId: string | null;
}
export default function Titlebar({ movieId }: TitlebarProps) {
  const [editTitle, setEditTitle] = useState(false);
  const [hasSeed, setHasSeed] = useState(false);
  const [hasStory, setHasStory] = useState(false);
  const [hasNotes, setHasNotes] = useState(false);
  const story = storyData?.storyData;
  const [updateProject] = useUpdateProjectMutation();
  const { data } = useGetProjectTitleQuery({
    variables: {
      id: movieId,
    },
    skip: !movieId,
  });

  const [movieTitle, setMovieTitle] = useState<string>();

  useEffect(() => {
    setMovieTitle(data?.projectById?.title);
  }, [data]);

  useEffect(() => {
    if (
      story?.getStoryText?.textSeed &&
      story?.getStoryText.textSeed.trim() !== ""
    ) {
      setHasSeed(true);
    }
    if (
      story?.getStoryText?.textContent &&
      story?.getStoryText.textContent.trim() !== ""
    ) {
      setHasStory(true);
    }
    if (
      story?.getStoryText?.textNotes &&
      story?.getStoryText.textNotes.trim() !== ""
    ) {
      setHasNotes(true);
    }
  }, [story?.getStoryText]);
  useEffect(() => {
    setMovieTitle(movieTitle);
  }, [updateProject, movieTitle]);
  const handleEditTitle = () => {
    setEditTitle(true);
    setTimeout(() => {
      const input = document.getElementById("titleInput");
      if (input) {
        input.focus();
        input.style.width = `${input.scrollWidth}px`;
      }
    }, 0);
  };
  const handleCancelEditTitle = () => {
    setEditTitle(false);
    setMovieTitle(movieTitle);
  };
  const handleUpdateProject = () => {
    setEditTitle(false);
    updateProject({
      variables: {
        projectId: movieId,
        title: movieTitle,
      },
    });
  };
  const getInitials = (str: String | any) => {
    const words = str?.split(" ");
    if (!words) return "";
    const initials = words
      .slice(0, 2)
      .map((word: String | any) => word[0])
      .join("");
    return initials.toUpperCase();
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMovieTitle(e.target.value);
  };
  return (
    <div className="col-span-2 relative row-start-2 col-start-2 z-30">
      <div className="bg-white shadow-md shadow-black/5 z-10 w-full text-secondary relative flex px-6 items-center justify-between h-[74px] rounded-tr-2xl">
        <div className="flex items-center justify-start">
          {movieTitle && (
            <div className="bg-secondary rounded-full w-[50px] h-[50px] mr-3 flex items-center justify-center">
              <div className="font-displayBold text-white text-[18px]">
                {getInitials(movieTitle)}
              </div>
            </div>
          )}
          {editTitle ? (
            <>
              <TextField
                aria-label="Title field"
                isRequired
                className="relative"
              >
                <Input
                  id="titleInput"
                  className="border-[1px] border-light p-2 bg-offwhite rounded-md outline-none flex-1 min-w-[155px] pr-[30px] w-auto"
                  value={movieTitle}
                  onChange={handleChange}
                />
                <MdEdit className="opacity-100 text-secondary/30 hover:text-secondary absolute right-[10px] top-[12px] cursor-pointer" />
                <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
                  Please enter a title.
                </FieldError>
              </TextField>
              <div className="flex gap-2 pl-4">
                <div
                  className="outline-none rounded-full w-max flex gap-1 items-center bg-secondary text-offwhite hover:bg-secondary-hover transition py-[5px] px-4 text-[12px] cursor-pointer"
                  onClick={handleUpdateProject}
                >
                  Save
                </div>
                <div
                  className="outline-none rounded-full w-max flex gap-1 items-center bg-red-500 text-offwhite hover:bg-red-400 transition py-[5px] px-4 text-[12px] cursor-pointer"
                  onClick={handleCancelEditTitle}
                >
                  Cancel
                </div>
              </div>
            </>
          ) : (
            <div
              className="flex gap-3 group hover:border-[1px] border-light p-2 hover:bg-offwhite hover:rounded-md w-fit items-center relative pr-10 hover:cursor-text"
              onClick={handleEditTitle}
            >
              {movieTitle}
              <MdEdit className="opacity-0 group-hover:opacity-100 text-secondary/30 hover:text-secondary absolute right-[10px] top-[11px] cursor-pointer" />
            </div>
          )}
        </div>
        <DialogTrigger>
          <Button className="text-left" id="progressButton">
            <ProgressBar
              value={
                hasSeed && !hasStory && !hasNotes
                  ? 33.33
                  : hasSeed && hasStory && !hasNotes
                  ? 66.66
                  : hasSeed && hasStory && hasNotes
                  ? 100
                  : 0
              }
              className="flex flex-col gap-1 w-[400px] text-secondary text-[14px] pr-4"
            >
              {({ percentage, valueText }) => (
                <>
                  <Label>{valueText} complete</Label>
                  <div className="h-1 top-[50%] transform translate-y-[-50%] w-full rounded-full bg-grey/20 bg-opacity-100 transition-all ease-in-out duration-1000">
                    <div
                      className="absolute h-1 top-[50%] transform translate-y-[-50%] rounded-full bg-secondary transition-all ease-in-out duration-1000"
                      style={{ width: percentage + "%" }}
                    />
                  </div>
                </>
              )}
            </ProgressBar>
          </Button>
          <Popover>
            <OverlayArrow>
              <svg width={12} height={12} viewBox="0 0 12 12">
                <path d="M0 0 L6 6 L12 0" />
              </svg>
            </OverlayArrow>
            <Dialog>
              <div className="bg-secondary text-white px-4 py-3 flex flex-col gap-1 justify-start items-start rounded-lg text-[12px]">
                <div className="pb-1 text-[14px] w-full text-center">
                  Story Progress
                </div>
                {hasSeed ? (
                  <div className="flex gap-2 items-center">
                    <MdCheckCircleOutline className="text-primary-hover" />
                    <span className="font-displayBold">Seed</span>
                  </div>
                ) : (
                  <div className="flex gap-2 items-start text-left">
                    <MdOutlineRadioButtonUnchecked className="text-grey/70 mt-[2px] flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-white/70 font-displayBold">
                        Seed
                      </span>
                      <span className="text-white/70 text-[10px]">
                        {`Enter a seed and click "Write Movie Text"`}
                      </span>
                    </div>
                  </div>
                )}
                {hasStory ? (
                  <div className="flex gap-2 items-center">
                    <MdCheckCircleOutline className="text-primary-hover" />
                    <span className="font-displayBold">Movie Text</span>
                  </div>
                ) : (
                  <div className="flex gap-2 items-start text-left">
                    <MdOutlineRadioButtonUnchecked className="text-grey/70 mt-[2px] flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-white/70 font-displayBold">
                        Movie Text
                      </span>
                      <span className="text-white/70 text-[10px]">
                        {`Click "Write Movie Text" to generate the story`}
                      </span>
                    </div>
                  </div>
                )}
                {hasNotes ? (
                  <div className="flex gap-2 items-center">
                    <MdCheckCircleOutline className="text-primary-hover" />
                    <span className="font-displayBold">Notes</span>
                  </div>
                ) : (
                  <Button
                    onPress={() => {
                      document.getElementById("progressButton")?.click();
                    }}
                    className="flex gap-2 items-start text-left"
                  >
                    <MdOutlineRadioButtonUnchecked className="text-grey/70 mt-[2px] flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-white/70 font-displayBold">
                        Notes
                      </span>
                      <span className="text-white/70 text-[10px]">
                        {`Click "Improve Text" to add notes`}
                      </span>
                    </div>
                  </Button>
                )}
              </div>
            </Dialog>
          </Popover>
        </DialogTrigger>
      </div>
    </div>
  );
}

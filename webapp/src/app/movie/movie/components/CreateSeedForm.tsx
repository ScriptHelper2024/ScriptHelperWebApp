"use client";
import { FormEvent, useRef, useEffect, useState } from "react";
import { useGenerateStoryFromSeedMutation } from "@/graphql/__generated__/createStoryFromSeed.generated";
import { useGenerateStoryFromUpdateMutation } from "@/graphql/__generated__/updateStory.generated";
import { useSelection } from "@/context/SelectionContext";
import {
  TextField,
  Button,
  Form,
  TextArea,
  FieldError,
} from "react-aria-components";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { useMovieData } from "@/context/MovieContext";

export default function CreateSeedForm() {
  const [createStoryFromSeed] = useGenerateStoryFromSeedMutation();
  const [updateSeedText] = useGenerateStoryFromUpdateMutation();
  const {
    movieData,
    startPolling,
    pollingActive,
    storyText,
    recentlySavedSeed,
    setRecentlySavedSeed,
  } = useMovieData();

  const seedAreaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [editSeedState, setEditSeedState] = useState<boolean>(false);
  const [seedText, setSeedText] = useState<String>();
  const [seedTextOriginal, setSeedTextOriginal] = useState<String>();

  const { resetSelection } = useSelection();

  useEffect(() => {
    if (storyText) {
      setSeedText(storyText.textSeed || "");
      setSeedTextOriginal(storyText.textSeed || "");
    }
    if (
      storyText &&
      storyText.versionNumber &&
      storyText?.versionNumber === 1
    ) {
      handleGenerateStoryFromSeedAuto();
    }
  }, [storyText]);

  useEffect(() => {
    const resizeSeedArea = () => {
      const currentRef = seedAreaRef.current;
      if (currentRef) {
        currentRef.style.height = "auto";
        currentRef.style.height = `${currentRef.scrollHeight}px`;
      }
    };
    const currentRef = seedAreaRef.current;
    resizeSeedArea();
    if (currentRef) {
      currentRef.addEventListener("input", resizeSeedArea);
      return () => {
        currentRef.removeEventListener("input", resizeSeedArea);
      };
    }
  }, [editSeedState, seedText]);

  const handleSeedTextChange = (e: FormEvent<HTMLTextAreaElement>) => {
    setSeedText(e.currentTarget.value);
  };

  const handleGenerateStoryFromSeed = async (e: FormEvent<HTMLFormElement>) => {
    setEditSeedState(false);
    resetSelection("movieText");
    startPolling();
    setRecentlySavedSeed(false);
    e.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(e.currentTarget);
    let textSeed = formData.get("textSeed") as string;
    textSeed = textSeed || "";
    if (textSeed && textSeed.trim() !== "") {
      setSeedText(textSeed);
    }
    await createStoryFromSeed({
      variables: {
        projectId: movieData?.id,
        textId: storyText?.id,
        textSeed: textSeed,
      },
    });
  };

  const handleGenerateStoryFromSeedAuto = async () => {
    setEditSeedState(false);
    resetSelection("movieText");
    startPolling();
    setRecentlySavedSeed(false);

    const form = document.getElementById("movieForm") as HTMLFormElement;
    const formData = new FormData(form);

    let textSeed = formData.get("textSeed") as string;
    textSeed = textSeed || "";
    if (textSeed && textSeed.trim() !== "") {
      setSeedText(textSeed);
    }
    await createStoryFromSeed({
      variables: {
        projectId: movieData?.id,
        textId: storyText?.id,
        textSeed: textSeed,
      },
    });
  };

  const handleUpdateSeed = async () => {
    setEditSeedState(false);
    setRecentlySavedSeed(true);
    await updateSeedText({
      variables: {
        projectId: movieData?.id,
        textId: storyText?.id,
        textSeed: seedText,
      },
      onCompleted: (data) => {
        data && setSeedText(seedText);
        data && setSeedTextOriginal(seedText);
      },
    });
  };

  const handleEditSeed = () => {
    setEditSeedState(true);
    resetSelection("movieText");
  };

  const handleCancelEditSeed = () => {
    setEditSeedState(false);
    setSeedText(seedTextOriginal);
  };

  return (
    <>
      <div className="grid grid-cols-[130px,1fr]">
        <div></div>
        <div
          className="col-start-2 pr-6 pt-4 pb-4 mb-4 w-full relative"
          id="movieSeed"
        >
          <div className="font-displayBold pb-3 text-[12px] absolute left-0 top-4 z-10">
            Seed
          </div>
          <Form
            id="movieForm"
            ref={formRef}
            onSubmit={handleGenerateStoryFromSeed}
            className="relative"
          >
            <div className="sticky pb-4 pr-0 top-4 right-0 float-right z-30">
              <div className="flex gap-2">
                {storyText?.versionNumber === 1 && (
                  <Button
                    className={`outline-none rounded-full w-max flex gap-1 items-center text-[12px] bg-secondary text-offwhite hover:bg-secondary-hover transition py-[5px] px-4 ${
                      pollingActive ? "cursor-default" : "cursor-pointer"
                    }`}
                    id="generateMovieText"
                    isDisabled={pollingActive}
                    type="submit"
                  >
                    <MdOutlineAutoAwesome />{" "}
                    {` ${pollingActive ? "Writing movie..." : "Write Movie"}`}
                  </Button>
                )}
                {storyText?.textContent && recentlySavedSeed && (
                  <Button
                    className="outline-none rounded-full w-max flex gap-1 items-center text-[12px] bg-secondary text-offwhite hover:bg-secondary-hover transition py-[5px] px-4"
                    type="submit"
                  >
                    <MdOutlineAutoAwesome /> Rewrite Movie
                  </Button>
                )}
                {editSeedState && (
                  <>
                    <div
                      className="outline-none rounded-full w-max flex gap-1 items-center text-[12px] bg-secondary text-offwhite hover:bg-secondary-hover transition py-[5px] px-4 cursor-pointer"
                      onClick={handleUpdateSeed}
                    >
                      Save
                    </div>
                    <div
                      className="outline-none rounded-full w-max flex gap-1 items-center text-[12px] bg-red-500 text-offwhite hover:bg-red-400 transition py-[5px] px-4 cursor-pointer"
                      onClick={handleCancelEditSeed}
                    >
                      Cancel
                    </div>
                  </>
                )}
                {!editSeedState && seedText && (
                  <div
                    className="bg-light text-secondary transition  hover:bg-light-hover outline-none rounded-full py-[5px] px-4 text-[12px] w-max flex gap-1 items-center cursor-pointer"
                    onClick={handleEditSeed}
                  >
                    Edit Seed
                  </div>
                )}
              </div>
            </div>
            <TextField
              name="textSeed"
              aria-label="Text Seed"
              isRequired
              className="pt-12 pb-0"
            >
              {editSeedState ||
              !storyText?.textContent ||
              storyText?.textContent === null ? (
                <TextArea
                  id="seedTextEditor"
                  className="editable-seed text-[14px] leading-[24px] w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0"
                  ref={seedAreaRef}
                  value={seedText?.toString()}
                  onChange={handleSeedTextChange}
                  placeholder="Compose the seed text for your movie here..."
                  autoFocus={true}
                />
              ) : (
                <div
                  id="seedText"
                  className="mb-[2px] whitespace-pre-wrap current-seed text-[14px] leading-[24px] w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 text-secondary/50 min-h-[63px]"
                >
                  {seedText?.toString()}
                </div>
              )}
              <FieldError className="p-2 rounded-md bg-pink-50 text-sm text-red-500 mb-1 text-center ml-4">
                Seed text is required to generate the movie.
              </FieldError>
            </TextField>
          </Form>
        </div>
      </div>
    </>
  );
}

"use client";
import { FormEvent, useRef, useEffect, useState } from "react";
import { useSelection } from "@/context/SelectionContext";
import {
  TextField,
  Button,
  Form,
  TextArea,
  FieldError,
} from "react-aria-components";
import { useGenerateSceneFromSeedMutation } from "@/graphql/__generated__/createSceneFromSeed.generated";
import { useUpdateSceneTextMutation } from "@/graphql/__generated__/updateScene.generated";
import { MdOutlineAutoAwesome } from "react-icons/md";
import { useSceneData } from "@/context/SceneContext";

export default function CreateSceneSeedForm() {
  const [createSceneFromSeed] = useGenerateSceneFromSeedMutation();
  const [updateSceneSeedText] = useUpdateSceneTextMutation();
  const {
    movieId,
    sceneKey,
    startPollingScene,
    pollingSceneActive,
    sceneText,
    recentlySavedSeed,
    setRecentlySavedSeed,
    setRecentlySavedScene,
  } = useSceneData();

  const seedAreaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [editSeedState, setEditSeedState] = useState<boolean>(false); // State to track form submission
  const [seedText, setSeedText] = useState<String>();
  const [seedTextOriginal, setSeedTextOriginal] = useState<String>();

  const {
    resetSelection,
    setNotesForSelectedSceneText,
    setNotesForSelectedScriptText,
  } = useSelection();

  useEffect(() => {
    if (sceneText?.textSeed && sceneText.textSeed.trim() !== "") {
      const sceneSeed = sceneText?.textSeed;
      setSeedText(sceneSeed);
      setSeedTextOriginal(sceneSeed);
    }
  }, [sceneText?.textSeed]);

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

  const handleGenerateSceneFromSeed = async (e: FormEvent<HTMLFormElement>) => {
    setEditSeedState(false);
    setNotesForSelectedSceneText(false);
    setNotesForSelectedScriptText(false);
    setRecentlySavedSeed(false);
    startPollingScene();
    e.preventDefault();
    if (!formRef.current) return; // Ensure the formRef is defined
    const formData = new FormData(e.currentTarget);
    let textSeed = formData.get("textSeed") as string;
    textSeed = textSeed || "";
    if (textSeed && textSeed.trim() !== "") {
      setSeedText(textSeed);
    }
    await createSceneFromSeed({
      variables: {
        projectId: movieId,
        textId: sceneText?.id,
        textSeed: textSeed,
      },
      onCompleted: (data) => {
        data && setRecentlySavedScene(true);
      },
    });
  };

  const handleUpdateSeed = async () => {
    setEditSeedState(false);
    setRecentlySavedSeed(true);
    await updateSceneSeedText({
      variables: {
        projectId: movieId,
        textId: sceneText?.id,
        sceneKey: sceneKey,
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
    resetSelection("sceneText");
    resetSelection("scriptText");
    setNotesForSelectedSceneText(false);
    setNotesForSelectedScriptText(false);
  };

  const handleCancelEditSeed = () => {
    setEditSeedState(false);
    setSeedText(seedTextOriginal);
  };

  return (
    <div className="grid grid-cols-[100px,1fr]" id="sceneSeed">
      <div></div>
      <div className="p-6 w-full relative pt-4">
        <div className="font-displayBold text-[12px] absolute left-6 top-4 z-10">
          Seed
        </div>
        <Form
          ref={formRef}
          onSubmit={handleGenerateSceneFromSeed}
          className="bg-white relative"
        >
          <div className="flex gap-3 justify-end sticky top-4 right-0 z-30">
            {sceneText?.versionNumber === 1 && (
              <Button
                className={`outline-none rounded-full w-max flex gap-1 items-center text-[12px] bg-secondary text-offwhite hover:bg-secondary-hover transition py-[5px] px-4 ${
                  pollingSceneActive ? "cursor-default" : "cursor-pointer"
                }`}
                id="generateSceneText"
                type="submit"
                isDisabled={pollingSceneActive}
              >
                <MdOutlineAutoAwesome />{" "}
                {` ${pollingSceneActive ? "Writing Scene..." : "Write Scene"}`}
              </Button>
            )}
            {sceneText?.textContent && recentlySavedSeed && (
              <Button
                className="outline-none rounded-full w-max flex gap-1 items-center text-[12px] bg-secondary text-offwhite hover:bg-secondary-hover transition py-[5px] px-4"
                type="submit"
              >
                <MdOutlineAutoAwesome /> Rewrite Scene
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
          <TextField
            name="textSeed"
            aria-label="Text Seed"
            isRequired
            className="pt-4 pb-0"
          >
            {editSeedState ||
            !sceneText?.textSeed ||
            sceneText?.textSeed === null ? (
              <TextArea
                id="seedTextEditor"
                className="editable-seed text-[14px] leading-[24px] w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0"
                ref={seedAreaRef}
                value={seedText?.toString()}
                onChange={handleSeedTextChange}
                placeholder="Compose the seed text for your scene here..."
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
              Seed text is required to generate the scene.
            </FieldError>
          </TextField>
        </Form>
      </div>
    </div>
  );
}

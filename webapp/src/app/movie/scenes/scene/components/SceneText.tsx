"use client";
import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { useUpdateSceneTextMutation } from "@/graphql/__generated__/updateScene.generated";
import { useGenerateScriptTextFromSceneMutation } from "@/graphql/__generated__/createScriptFromScene.generated";
import { useGenerateScriptAndBeatSheetMutation } from "@/graphql/__generated__/createScriptAndBeatSheetFromScene.generated";
import { useGetScriptTextQuery } from "@/graphql/__generated__/getScriptText.generated";
import { useUpdateScriptTextMutation } from "@/graphql/__generated__/updateScript.generated";
import { useSelection } from "@/context/SelectionContext";
import { readingTime } from "reading-time-estimator";
import {
  Button,
  DialogTrigger,
  Dialog,
  OverlayArrow,
  Popover,
  TextArea,
  TextField,
} from "react-aria-components";
import { MdAutoAwesome, MdOutlineAutoAwesome } from "react-icons/md";
import { TbCursorText } from "react-icons/tb";
import SceneTextScaffold from "./SceneText-Scaffold";
import ScriptTextScaffold from "./SceneScript-Scaffold";
import { extractCharacters } from "@/utils/utils";
import { useSceneData } from "@/context/SceneContext";
import { useListProjectCharactersQuery } from "@/graphql/__generated__/listProjectCharacters.generated";
import { useCreateCharacterProfileMutation } from "@/graphql/__generated__/createCharacter.generated";
import { useMovieData } from "@/context/MovieContext";

interface SceneTextProps {
  selectionType: string;
  pushSceneCharacters: (value: string[]) => void;
  pushScriptCharacters: (value: string[]) => void;
}

const SceneText: React.FC<SceneTextProps> = ({
  selectionType,
  pushSceneCharacters,
  pushScriptCharacters,
}) => {
  const {
    movieId,
    sceneKey,
    sceneText,
    scriptText,
    sceneVersions,
    selectedSceneVersion,
    updateNewSceneVersion,
    updateSelectedSceneVersion,
    setSceneRefresh,
    pollingSceneActive,
    pollingSceneNotesActive,
    scriptVersions,
    selectedScriptVersion,
    updateNewScriptVersion,
    updateSelectedScriptVersion,
    setScriptRefresh,
    pollingScriptActive,
    pollingScriptNotesActive,
    startPollingScript,
    recentlySavedScene,
    setRecentlySavedScene,
  } = useSceneData();

  const {
    setSelection,
    resetSelection,
    removeSceneSpans,
    removeScriptSpans,
    selectedSceneMode,
    setSelectedSceneMode,
    selectedScriptMode,
    setSelectedScriptMode,
    notesForSelectedSceneText,
    setNotesForSelectedSceneText,
    notesForSelectedScriptText,
    setNotesForSelectedScriptText,
  } = useSelection();

  const [createCharacter] = useCreateCharacterProfileMutation();
  const { data: projectCharacters, refetch: refetchProjectCharacters } =
    useListProjectCharactersQuery({
      variables: { projectId: movieId },
      skip: !movieId,
    });

  const sceneAreaRef = useRef<HTMLTextAreaElement>(null);
  const scriptAreaRef = useRef<HTMLTextAreaElement>(null);

  const [createSceneFromUpdate] = useUpdateSceneTextMutation();
  const [createScriptFromUpdate] = useUpdateScriptTextMutation();
  const [generateScriptFromScene] = useGenerateScriptTextFromSceneMutation();
  const [generateScriptAndBeatSheet] = useGenerateScriptAndBeatSheetMutation();

  const [sceneVersionOptions, setSceneVersionOptions] = useState<any[]>([]);
  const [defaultSceneVersion, setDefaultSceneVersion] = useState({
    value: 0,
    label: "",
  });
  const [sceneTextContent, setSceneTextContent] = useState<string>();
  const [sceneTextUpdate, setSceneTextUpdate] = useState<string>();
  const [editSceneState, setEditSceneState] = useState<boolean>(false);
  const [sceneReadingData, setSceneReadingData] = useState<any>();
  const [sceneCharacters, setSceneCharacters] = useState<string[]>([]);
  const [scriptVersionOptions, setScriptVersionOptions] = useState<any[]>([]);
  const [defaultScriptVersion, setDefaultScriptVersion] = useState({
    value: 0,
    label: "",
  });
  const [scriptTextContent, setScriptTextContent] = useState<string>();
  const [scriptTextUpdate, setScriptTextUpdate] = useState<string>();
  const [editScriptState, setEditScriptState] = useState<boolean>(false);
  const [scriptReadingData, setScriptReadingData] = useState<any>();
  const [scriptCharacters, setScriptCharacters] = useState<string[]>([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setSceneRefresh(!refresh);
    setScriptRefresh(!refresh);
  }, [refresh]);

  useEffect(() => {
    if (sceneText?.textContent) {
      setSceneTextContent(sceneText?.textContent);
      setSceneTextUpdate(sceneText?.textContent);
      setSceneReadingData(readingTime(sceneText?.textContent, 90));
      const extractedCharacters = extractCharacters(sceneText?.textContent);
      extractedCharacters && pushSceneCharacters(extractedCharacters);
      extractedCharacters && setSceneCharacters(extractedCharacters);
    }
  }, [sceneText]);

  useEffect(() => {
    if (scriptText?.textContent) {
      setScriptTextContent(scriptText?.textContent);
      setScriptTextUpdate(scriptText?.textContent);
      setScriptReadingData(readingTime(scriptText?.textContent, 90));
      const extractedCharacters = extractCharacters(scriptText?.textContent);
      extractedCharacters && pushScriptCharacters(extractedCharacters);
      extractedCharacters && setScriptCharacters(extractedCharacters);
    }
  }, [scriptText]);

  useEffect(() => {
    if (sceneTextContent && !scriptTextContent) {
      scrollToElement("sceneTextArea");
    }
    if (scriptTextContent) {
      scrollToElement("scriptTextArea");
    }
  }, [scriptTextContent, sceneTextContent]);

  useEffect(() => {
    const sceneVersionOptions =
      sceneVersions
        ?.slice(1)
        ?.map((version: any) => ({
          value: version.id,
          label: `Version ${version.versionNumber - 1} (${
            version.versionType === "magic-note"
              ? "AI Notes"
              : version.versionType === "note"
              ? "Rewritten"
              : version.versionType === "new"
              ? "Generated"
              : version.versionType === "edit"
              ? "Manual Edit"
              : version.versionType
          })`,
        }))
        .reverse() || [];
    setSceneVersionOptions(sceneVersionOptions);
    const selectedVersion =
      sceneVersions &&
      sceneVersions.find((version: any) => version.id === selectedSceneVersion);
    if (selectedVersion) {
      setDefaultSceneVersion({
        value: selectedVersion.id,
        label: `Version ${selectedVersion.versionNumber - 1} (${
          selectedVersion.versionType === "magic-note"
            ? "AI Notes"
            : selectedVersion.versionType === "note"
            ? "Rewritten"
            : selectedVersion.versionType === "new"
            ? "Generated"
            : selectedVersion.versionType === "edit"
            ? "Manual Edit"
            : selectedVersion.versionType
        })`,
      });
    }
  }, [sceneVersions]);

  useEffect(() => {
    const scriptVersionOptions =
      scriptVersions
        ?.slice(1)
        ?.filter((version: any) => version.sceneTextId === selectedSceneVersion)
        ?.map((version: any) => ({
          value: version.id,
          label: `Version ${version.versionNumber - 1} (${
            version.versionType === "magic-note"
              ? "AI Notes"
              : version.versionType === "note"
              ? "Rewritten"
              : version.versionType === "new"
              ? "Generated"
              : version.versionType === "edit"
              ? "Manual Edit"
              : version.versionType
          })`,
        }))
        .reverse() || [];
    setScriptVersionOptions(scriptVersionOptions);
    const selectedVersion =
      scriptVersions &&
      scriptVersions.find(
        (version: any) => version.id === selectedScriptVersion
      );
    if (selectedVersion) {
      setDefaultScriptVersion({
        value: selectedVersion.id,
        label: `Version ${selectedVersion.versionNumber - 1} (${
          selectedVersion.versionType === "magic-note"
            ? "AI Notes"
            : selectedVersion.versionType === "note"
            ? "Rewritten"
            : selectedVersion.versionType === "new"
            ? "Generated"
            : selectedVersion.versionType === "edit"
            ? "Manual Edit"
            : selectedVersion.versionType
        })`,
      });
    }
  }, [scriptVersions]);

  useEffect(() => {
    const resizeTextAreas = () => {
      const currentRef = sceneAreaRef.current;
      if (currentRef) {
        currentRef.style.height = "auto";
        currentRef.style.height = `${currentRef.scrollHeight}px`;
      }
    };
    const currentRef = sceneAreaRef.current;
    resizeTextAreas();
    if (currentRef) {
      const observer = new ResizeObserver(resizeTextAreas);
      observer.observe(currentRef);
      return () => {
        observer.disconnect();
      };
    }
  }, [sceneText, sceneTextContent, sceneTextUpdate, sceneAreaRef]);

  useEffect(() => {
    const resizeTextAreas = () => {
      const currentRef = scriptAreaRef.current;
      if (currentRef) {
        currentRef.style.height = "auto";
        currentRef.style.height = `${currentRef.scrollHeight}px`;
      }
    };
    const currentRef = scriptAreaRef.current;
    resizeTextAreas();
    if (currentRef) {
      const observer = new ResizeObserver(resizeTextAreas);
      observer.observe(currentRef);
      return () => {
        observer.disconnect();
      };
    }
  }, [scriptText, scriptTextContent, scriptTextUpdate, scriptAreaRef]);

  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSceneVersionChange = (selectedOption: any) => {
    if (!selectedOption) {
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `${sceneKey}_selectedSceneVersion`,
        selectedOption.value
      );
    }
    updateSelectedSceneVersion(selectedOption.value);
    const scriptVersionOption = scriptVersions
      ?.slice(1)
      ?.filter((version: any) => version.sceneTextId === selectedSceneVersion)
      ?.slice(-1)[0];
    if (scriptVersionOption) {
      console.log(scriptVersionOption);
      const selectedOptionValue = scriptVersionOption.id;
      typeof window !== "undefined" &&
        localStorage.setItem(
          `${sceneKey}_selectedScriptVersion`,
          selectedOptionValue
        );
      setDefaultScriptVersion({
        value: scriptVersionOption.id,
        label: `Version ${scriptVersionOption.versionNumber - 1} (${
          scriptVersionOption.versionType === "magic-note"
            ? "AI Notes"
            : scriptVersionOption.versionType === "note"
            ? "Rewritten"
            : scriptVersionOption.versionType === "new"
            ? "Generated"
            : scriptVersionOption.versionType === "edit"
            ? "Manual Edit"
            : scriptVersionOption.versionType
        })`,
      });
      updateSelectedScriptVersion(selectedOptionValue);
    }
  };

  const handleScriptVersionChange = (selectedOption: any) => {
    if (!selectedOption) {
      return;
    }
    typeof window !== "undefined" &&
      localStorage.setItem(
        `${sceneKey}_selectedScriptVersion`,
        selectedOption.value
      );
    updateSelectedScriptVersion(selectedOption.value);
  };

  const handleGenerateSceneUpdate = async (withScript: boolean) => {
    setSceneTextContent(sceneTextUpdate);
    setEditSceneState(false);
    await createSceneFromUpdate({
      variables: {
        projectId: movieId,
        textId: sceneText?.id,
        sceneKey: sceneKey,
        textContent: sceneTextUpdate,
      },
      onCompleted: (data) => {
        const newVersion = data?.updateSceneText?.sceneText?.id;
        updateNewSceneVersion(newVersion);
        setRecentlySavedScene(true);
        if (withScript) {
          handleGenerateScript();
          setRecentlySavedScene(false);
        }
      },
    });
  };

  const handleGenerateScriptUpdate = async () => {
    setEditScriptState(false);
    await createScriptFromUpdate({
      variables: {
        projectId: movieId,
        sceneTextId: selectedSceneVersion,
        textId: scriptText?.id,
        sceneKey: sceneKey,
        textContent: scriptTextUpdate,
      },
      onCompleted: (data) => {
        const newVersion = data?.updateScriptText?.scriptText?.id;
        updateNewScriptVersion(newVersion);
        setScriptTextContent(scriptTextUpdate);
        setRefresh(!refresh);
      },
    });
  };

  const handleGenerateScript = async () => {
    startPollingScript();
    setRecentlySavedScene(false);
    const scriptTextArea = document.getElementById("scriptTextArea");
    scriptTextArea?.scrollIntoView({ behavior: "smooth", block: "start" });
    generateScriptAndBeatSheet({
      variables: {
        projectId: movieId,
        sceneKey: sceneKey,
        sceneTextId: sceneText?.id,
        // includeBeatSheet: true,
        // textId: scriptText?.id,
      },
    });
  };

  const handleTextSelection = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    selectionType: string
  ) => {
    if (selectionType === "sceneText") {
      removeScriptSpans;
    }
    if (selectionType === "scriptText") {
      removeSceneSpans;
    }
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectionTextElement = document.getElementById(selectionType);
      if (
        selectionTextElement &&
        selectionTextElement.contains(range.commonAncestorContainer)
      ) {
        const start = getSelectionStart(selectionTextElement, range);
        const end = getSelectionEnd(selectionTextElement, range);
        if (start !== end) {
          setSelection(start, end, selectionType);
          removeHighlight(selectionType);
          setTimeout(() => {
            highlightSelection(start ?? 0, end ?? 0, selectionType);
          }, 10);
        } else {
          selection.removeAllRanges();
          removeHighlight(selectionType);
          setSelection(null, null, selectionType);
        }
      }
    }
  };

  const highlightSelection = (
    start: number,
    end: number,
    selectionType: string
  ) => {
    const selection = window.getSelection();
    if (selection) {
      const selectionTextElement = document.getElementById(selectionType);
      if (!selectionTextElement) {
        return;
      }
      const range = document.createRange();
      const nodes = selectionTextElement.childNodes;
      let currentOffset = 0;
      let startNode: Node | null = null;
      let endNode: Node | null = null;
      let startOffset = 0;
      let endOffset = 0;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const nodeLength = node.textContent?.length || 0;
        if (start >= currentOffset && start <= currentOffset + nodeLength) {
          startNode = node;
          startOffset = start - currentOffset;
        }
        if (end >= currentOffset && end <= currentOffset + nodeLength) {
          endNode = node;
          endOffset = end - currentOffset;
        }
        currentOffset += nodeLength;
      }
      if (!startNode || !endNode) {
        return;
      }
      if (startNode.nodeType === Node.TEXT_NODE) {
        range.setStart(startNode, startOffset);
      } else {
        range.setStart(startNode.firstChild!, startOffset);
      }
      if (endNode.nodeType === Node.TEXT_NODE) {
        range.setEnd(endNode, endOffset);
      } else {
        range.setEnd(endNode.firstChild!, endOffset);
      }
      const span = document.createElement("span");
      span.classList.add(
        "bg-light",
        "text-secondary",
        "before:mb-2",
        "before:block",
        "before:text-[10px]",
        "after:block",
        "after:w-fit",
        "after:text-[10px]",
        "after:bg-secondary-hover",
        "after:text-white",
        "after:px-[10px]",
        "after:mt-4",
        "after:mb-2",
        "after:rounded-full",
        "after:cursor-pointer",
        "after:mt-2",
        "px-4",
        "py-2",
        "rounded-lg",
        "float-left"
      );
      range.surroundContents(span);
      selection.removeAllRanges();
      selection.addRange(range);
      window.getSelection()!.removeAllRanges();
    }
  };

  const removeHighlight = (selectionType: string) => {
    const highlights = document.querySelectorAll(`#${selectionType} span`);
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      if (parent) {
        parent.replaceChild(
          document.createTextNode(highlight.textContent || ""),
          highlight
        );
      }
    });
  };

  const getSelectionStart = (
    selectionTextElement: HTMLElement,
    range: Range
  ): number => {
    const clonedRange = range.cloneRange();
    clonedRange.selectNodeContents(selectionTextElement);
    clonedRange.setEnd(range.startContainer, range.startOffset);
    return clonedRange.toString().length;
  };

  const getSelectionEnd = (
    selectionTextElement: HTMLElement,
    range: Range
  ): number => {
    const clonedRange = range.cloneRange();
    clonedRange.selectNodeContents(selectionTextElement);
    clonedRange.setEnd(range.endContainer, range.endOffset);
    return clonedRange.toString().length;
  };

  const handleEditScene = () => {
    setEditSceneState(true);
    resetSelection("sceneText");
    removeSceneSpans();
    removeHighlight("sceneText");
    setSelectedSceneMode(false);
    setNotesForSelectedSceneText(false);
    setNotesForSelectedScriptText(false);
  };

  const handleCancelEditScene = () => {
    setEditSceneState(false);
    setSceneTextContent(sceneTextContent);
    setSceneTextUpdate(sceneTextContent);
  };

  const handleEditScript = () => {
    setEditScriptState(true);
    resetSelection("scriptText");
    removeScriptSpans();
    removeHighlight("scriptText");
    setSelectedScriptMode(false);
    setNotesForSelectedSceneText(false);
    setNotesForSelectedScriptText(false);
  };

  const handleCancelEditScript = () => {
    setEditScriptState(false);
    setScriptTextContent(scriptTextContent);
    setScriptTextUpdate(scriptTextContent);
  };

  const versionMenuStyles = {
    container: (provided: any, state: any) => ({
      ...provided,
      position: "sticky",
      top: "67px",
      zIndex: 20,
      width: "auto!important",
    }),
    control: (provided: any, state: any) => ({
      ...provided,
      position: "absolute",
      top: "-52px",
      cursor: "pointer",
      borderRadius: "100px",
      boxShadow: state.isFocused ? "0 0 0 1px #E0ECEE" : "none",
      width: "auto!important",
      textAlign: "center",
      display: "inline-flex",
      paddingLeft: "20px",
      paddingTop: "0",
      paddingBottom: "0",
      border: "1px solid #E0ECEE",
      left: "calc(50% - 65px)",
      height: "38px",
      transform: "translateX(-50%)",
      "&:hover": {
        borderColor: "#E0ECEE",
      },
      "&:focus": {
        outline: "none",
      },
    }),
    input: (provided: any, state: any) => ({
      ...provided,
      opacity: 0,
      pointerEvents: "none",
      "& input": {
        pointerEvents: "none",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      whiteSpace: "nowrap",
      paddingRight: "40px",
      paddingLeft: "20px",
      cursor: "pointer",
      backgroundColor: state.isSelected ? "#06303e" : "#fff",
      width: "100%",
      textAlign: "center",
      color: state.isSelected ? "#fff" : "#06303e",
      "&:hover": {
        backgroundColor: state.isSelected ? "#06303e" : "#E0ECEE",
        color: state.isSelected ? "#fff" : "#06303e",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      marginTop: "-10px",
      border: "2px solid #E0ECEE",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      width: "auto",
      borderRadius: "1rem",
      padding: "0",
      left: "calc(50% - 65px)",
      transform: "translateX(-50%)",
      position: "absolute",
      scrollbarWidth: "thin",
      overflow: "hidden",
      scrollbarColor: "#06303e transparent",
      "&::-webkit-scrollbar": {
        width: "4px",
      },
    }),
    menuList: (provided: any) => ({
      ...provided,
      padding: "0",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: 0,
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      display: "none",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      fill: "#06303e",
    }),
  };

  useEffect(() => {
    // Combine sceneCharacters and scriptCharacters into one array
    const combinedCharacters = [...sceneCharacters, ...scriptCharacters];

    // Check if projectCharacters data is available
    if (projectCharacters && projectCharacters.listProjectCharacters) {
      // Extract existing character names
      const existingCharacterNames =
        projectCharacters.listProjectCharacters.map(
          (character) => character?.name
        );

      // Filter out new characters
      const newCharacters = combinedCharacters.filter(
        (name) => !existingCharacterNames.includes(name)
      );

      // Create new characters if there are any
      newCharacters.forEach(async (name) => {
        try {
          // Check if the character already exists in the projectCharacters data
          const characterExists = existingCharacterNames.includes(name);

          // If the character does not exist, create its profile
          if (!characterExists) {
            await createCharacter({
              variables: {
                projectId: movieId,
                name: name,
                textSeed: "", // Assuming textSeed should be empty
              },
            });
            // Refetch project characters to update the list
            refetchProjectCharacters();
          }
        } catch (error) {
          console.error("Error creating character profile:", error);
        }
      });
    }
  }, [
    sceneCharacters,
    scriptCharacters,
    projectCharacters,
    createCharacter,
    movieId,
    refetchProjectCharacters,
  ]);

  return (
    <>
      <div
        className={`grid grid-cols-[130px,1fr] transition pb-12 ${
          selectedSceneMode
            ? "border-dashed border-[1px] border-primary"
            : "border-dashed border-[1px] border-transparent"
        }`}
      >
        <div className="text-[12px] w-full justify-start pl-6 pt-[84px] relative">
          <div
            id="readingData"
            className="flex flex-col gap-2 sticky top-4 opacity-100 transition-opacity duration-500"
          >
            <>
              <div className="flex flex-col">
                <div>{sceneReadingData ? sceneReadingData.words : `—`}</div>
                <div className="opacity-50">words</div>
              </div>
              <div className="flex flex-col">
                <div>{sceneReadingData ? sceneReadingData.minutes : `—`}</div>
                <div className="opacity-50">minutes</div>
              </div>
              <div className="flex flex-col">
                <div>
                  {sceneCharacters?.length < 1 ? `—` : sceneCharacters?.length}
                </div>
                <div className="opacity-50">characters</div>
              </div>
            </>
          </div>
        </div>
        <div id="sceneTextArea" className={`pt-8 relative`}>
          {defaultSceneVersion && sceneVersions?.length > 1 && (
            <Select
              name="sceneVersionValue"
              className="!font-mono !text-[11px]"
              options={sceneVersionOptions}
              styles={versionMenuStyles}
              key={defaultSceneVersion.value}
              maxMenuHeight={200}
              defaultValue={defaultSceneVersion}
              onChange={handleSceneVersionChange}
            />
          )}
          <div className="font-displayBold pb-3 text-[12px] absolute left-0 top-8 z-10">
            Scene Text
          </div>
          <div className="sticky pb-4 pr-6 top-4 right-0 float-right z-30">
            <div className="flex gap-2">
              {sceneTextContent && !scriptTextContent && !editSceneState && (
                <Button
                  className={`outline-none rounded-full w-max flex gap-1 items-center text-[12px] bg-secondary text-offwhite hover:bg-secondary-hover transition py-[5px] px-4 ${
                    pollingScriptActive ? "cursor-default" : "cursor-pointer"
                  }`}
                  onPress={handleGenerateScript}
                  isDisabled={pollingScriptActive}
                  id="generateScriptText"
                >
                  <MdOutlineAutoAwesome />{" "}
                  {` ${
                    pollingScriptActive ? "Writing Script..." : "Write Script"
                  }`}
                </Button>
              )}
              {sceneText?.versionNumber > 2 &&
                scriptTextContent &&
                recentlySavedScene && (
                  <Button
                    className="outline-none rounded-full w-max flex gap-1 items-center bg-secondary text-offwhite hover:bg-secondary-hover transition py-[5px] px-4 text-[12px] cursor-pointer"
                    onPress={() => handleGenerateSceneUpdate(true)}
                    isDisabled={pollingSceneActive}
                  >
                    <MdAutoAwesome /> Rewrite Script
                  </Button>
                )}
              {editSceneState && (
                <>
                  <Button
                    className="outline-none rounded-full w-max flex gap-1 items-center bg-secondary text-offwhite hover:bg-secondary-hover transition py-[5px] px-4 text-[12px] cursor-pointer"
                    onPress={() => handleGenerateSceneUpdate(false)}
                  >
                    Save
                  </Button>
                  <Button
                    className="outline-none rounded-full w-max flex gap-1 items-center bg-red-500 text-offwhite hover:bg-red-400 transition py-[5px] px-4 text-[12px] cursor-pointer"
                    onPress={handleCancelEditScene}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {!editSceneState && sceneTextContent && (
                <Button
                  className="bg-light text-secondary transition  hover:bg-light-hover outline-none rounded-full py-[5px] px-4 text-[12px] w-max flex gap-1 items-center cursor-pointer"
                  onPress={handleEditScene}
                >
                  Edit Scene
                </Button>
              )}
            </div>
          </div>
          <div className="relative overflow-hidden min-h-[300px] w-full">
            {pollingSceneActive && (
              <div className="absolute bg-white z-10 left-0 right-0 top-[14px] bottom-0 pr-6 pb-12 overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 right-0 w-full bg-gradient-to-t from-white to-transparent z-20"></div>
                <SceneTextScaffold />
              </div>
            )}
            {selectedSceneMode && !selectionType && (
              <div className="w-auto flex">
                <div className="flex items-center px-3 py-1 bg-uiLight rounded-full whitespace-nowrap text-[12px]">
                  Highlight Scene Text with your cursor{" "}
                  <TbCursorText
                    className="text-secondary animate-pulse opacity-20"
                    size={13}
                  />
                </div>
              </div>
            )}
            {sceneTextContent ? (
              <div className={`bg-white w-full pt-4`}>
                <TextField name="textScene" aria-label="Scene Text">
                  <div
                    id="sceneText"
                    className={`whitespace-pre-line flex flex-col overflow-hidden w-full leading-[24px] font-mono text-[12px] text-secondary/50 pr-6 pl-0 h-fit ${
                      editSceneState
                        ? " !h-0 top-0 opacity-0 pointer-events-none z-0 "
                        : " opacity-100 pointer-events-auto z-1 "
                    }
                    ${
                      selectionType === "Script" ? " pointer-events-none" : ""
                    }`}
                    onMouseUp={(event) =>
                      handleTextSelection(event, "sceneText")
                    }
                  >
                    {sceneTextContent}
                  </div>
                  <TextArea
                    id="sceneTextEditor"
                    className={`editable-scene whitespace-pre-line flex flex-col overflow-hidden leading-[24px] font-mono text-[12px] w-full resize-none pr-6 pl-0 border-0 bg-transparent outline outline-0 focus:border-0 focus:outline-0 ${
                      editSceneState
                        ? " opacity-100 pointer-events-auto z-1 "
                        : " !h-0 top-0 opacity-0 pointer-events-none z-0 "
                    }`}
                    ref={sceneAreaRef}
                    value={sceneTextUpdate}
                    onChange={(e) => setSceneTextUpdate(e.target.value)}
                    placeholder="Compose your scene here"
                  />
                </TextField>
              </div>
            ) : (
              <div
                className={`pt-12 pr-6 pb-12 ${
                  pollingSceneActive ? "hidden" : "visible"
                }`}
              >
                <DialogTrigger>
                  <Button className="text-left">
                    <div
                      className={`whitespace-pre-line flex flex-col overflow-hidden w-full leading-7 font-mono`}
                    >
                      <div className="opacity-10">
                        <div className="text-secondary ">
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
                        </div>
                      </div>
                    </div>
                  </Button>
                  <Popover>
                    <OverlayArrow>
                      <svg width={12} height={12} viewBox="0 0 12 12">
                        <path d="M0 0 L6 6 L12 0" />
                      </svg>
                    </OverlayArrow>
                    <Dialog>
                      <div className="bg-secondary text-white py-3 pb-4 pl-3 pr-2 rounded-lg text-[12px]">
                        <div className="font-displayBold">Scene Text</div>
                        <div className="my-2 pr-2">
                          This is where the text for your new scene will appear.
                        </div>
                        <div className="flex items-center">
                          Start by clicking
                          <Button
                            className="mx-2 inline pl-2 pr-3 py-1 bg-primary/40 rounded-full text-[11px]"
                            onPress={() =>
                              document
                                .getElementById("generateSceneText")
                                ?.click()
                            }
                          >
                            <MdAutoAwesome className="inline" /> Write Scene
                          </Button>
                        </div>
                      </div>
                    </Dialog>
                  </Popover>
                </DialogTrigger>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full border-b-[1px]"></div>
      <div
        className={`grid grid-cols-[130px,1fr] pb-32 transition ${
          selectedScriptMode
            ? "border-dashed border-[1px] border-primary"
            : "border-dashed border-[1px] border-transparent"
        }`}
      >
        <div className="text-[12px] w-full justify-start pl-6 pt-[84px] relative">
          <div
            id="readingData"
            className="flex flex-col gap-2 sticky top-4 opacity-100 transition-opacity duration-500"
          >
            <>
              <div className="flex flex-col">
                <div>{scriptReadingData ? scriptReadingData.words : `—`}</div>
                <div className="opacity-50">words</div>
              </div>
              <div className="flex flex-col">
                <div>{scriptReadingData ? scriptReadingData.minutes : `—`}</div>
                <div className="opacity-50">minutes</div>
              </div>
              <div className="flex flex-col">
                <div>
                  {scriptCharacters?.length < 1
                    ? `—`
                    : scriptCharacters?.length}
                </div>
                <div className="opacity-50">characters</div>
              </div>
            </>
          </div>
        </div>
        <div id="scriptTextArea" className={`pt-8 relative`}>
          {defaultScriptVersion && scriptVersions?.length > 1 && (
            <Select
              name="scriptVersionValue"
              className="!font-mono !text-[11px]"
              options={scriptVersionOptions}
              styles={versionMenuStyles}
              maxMenuHeight={200}
              key={defaultScriptVersion.value}
              defaultValue={defaultScriptVersion}
              onChange={handleScriptVersionChange}
            />
          )}

          <div className="font-displayBold pb-3 text-[12px] absolute left-0 top-8 z-10">
            Script Text
          </div>
          <div className="sticky pb-4 pr-6 top-4 right-0 float-right z-30">
            <div className="flex gap-2">
              {editScriptState && (
                <>
                  <Button
                    className="outline-none rounded-full w-max flex gap-1 items-center bg-secondary text-offwhite hover:bg-secondary-hover transition py-[5px] px-4 text-[12px]"
                    onPress={handleGenerateScriptUpdate}
                  >
                    Save
                  </Button>
                  <Button
                    className="outline-none rounded-full w-max flex gap-1 items-center bg-red-500 text-offwhite hover:bg-red-400 transition py-[5px] px-4 text-[12px] cursor-pointer"
                    onPress={handleCancelEditScript}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {!editScriptState && scriptTextContent && (
                <Button
                  className="bg-light text-secondary transition  hover:bg-light-hover outline-none rounded-full py-[5px] px-4 text-[12px] w-max flex gap-1 items-center cursor-pointer"
                  onPress={handleEditScript}
                >
                  Edit Script
                </Button>
              )}
            </div>
          </div>
          <div className="relative overflow-hidden min-h-[500px] w-full">
            {pollingScriptActive && (
              <div className="absolute bg-white z-10 left-0 right-0 top-[14px] bottom-0 pr-6 pb-12 overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 right-0 w-full bg-gradient-to-t from-white to-transparent z-20"></div>
                <ScriptTextScaffold />
              </div>
            )}
            {selectedScriptMode && !selectionType && (
              <div className="w-auto flex">
                <div className="flex items-center px-3 py-1 bg-uiLight rounded-full whitespace-nowrap text-[12px]">
                  Highlight Script Text with your cursor{" "}
                  <TbCursorText
                    className="text-secondary animate-pulse opacity-20"
                    size={13}
                  />
                </div>
              </div>
            )}
            {scriptTextContent ? (
              <div className={`bg-white w-full pt-4`}>
                <TextField name="textScript" aria-label="Script Text">
                  <div
                    id="scriptText"
                    className={`whitespace-pre-line relative flex flex-col overflow-hidden w-full leading-[24px] font-mono text-[12px] text-secondary/50 pr-6 pl-0 h-fit ${
                      editScriptState
                        ? " !h-0 opacity-0 pointer-events-none z-0 "
                        : " opacity-100 pointer-events-auto z-1 "
                    }
                  ${selectionType === "Script" ? " pointer-events-none " : ""}`}
                    onMouseUp={(event) =>
                      handleTextSelection(event, "scriptText")
                    }
                  >
                    {scriptTextContent}
                  </div>
                  <TextArea
                    id="scriptTextEditor"
                    className={`editable-script relative whitespace-pre-line flex flex-col overflow-hidden leading-[24px] font-mono text-[12px] w-full resize-none pr-6 pl-0 border-0 bg-transparent outline outline-0 focus:border-0 focus:outline-0 ${
                      editScriptState
                        ? " opacity-100 pointer-events-auto z-1 "
                        : " !h-0 opacity-0 pointer-events-none z-0 "
                    }`}
                    ref={scriptAreaRef}
                    value={scriptTextUpdate}
                    onChange={(e) => setScriptTextUpdate(e.target.value)}
                    placeholder="Compose your script here"
                  />
                </TextField>
              </div>
            ) : (
              <div
                className={`pt-12 pr-6 pb-12 ${
                  pollingScriptActive ? "hidden" : "visible"
                }`}
              >
                <DialogTrigger>
                  <Button className="text-left">
                    <div
                      className={`whitespace-pre-line flex flex-col overflow-hidden w-full leading-7 font-mono`}
                    >
                      <div className="opacity-10">
                        <div className="text-secondary ">
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
                        </div>
                      </div>
                    </div>
                  </Button>
                  <Popover>
                    <OverlayArrow>
                      <svg width={12} height={12} viewBox="0 0 12 12">
                        <path d="M0 0 L6 6 L12 0" />
                      </svg>
                    </OverlayArrow>
                    <Dialog>
                      <div className="bg-secondary text-white py-3 pb-4 pl-3 pr-2 rounded-lg text-[12px]">
                        <div className="font-displayBold">Script Text</div>
                        <div className="my-2 pr-2">
                          This is where the script for your new scene will
                          appear. After composing your scene you can generate a
                          script.
                        </div>
                        {sceneTextContent && (
                          <div className="flex items-center">
                            Start by clicking
                            <Button
                              className="mx-2 inline pl-2 pr-3 py-1 bg-primary/40 rounded-full text-[11px]"
                              onPress={() =>
                                document
                                  .getElementById("generateScriptText")
                                  ?.click()
                              }
                            >
                              <MdAutoAwesome className="inline" /> Write Script
                            </Button>
                          </div>
                        )}
                      </div>
                    </Dialog>
                  </Popover>
                </DialogTrigger>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SceneText;

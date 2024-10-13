"use client";
import { use, useEffect, useRef, useState } from "react";
import Select from "react-select";
import { useGenerateStoryFromUpdateMutation } from "@/graphql/__generated__/updateStory.generated";
import { useSelection } from "@/context/SelectionContext";
import { readingTime } from "reading-time-estimator";
import {
  Button,
  Form,
  DialogTrigger,
  Dialog,
  OverlayArrow,
  Popover,
  TextArea,
  TextField,
} from "react-aria-components";
import { extractCharacters } from "@/utils/utils";
import { useMovieData } from "@/context/MovieContext";
import { MdAutoAwesome } from "react-icons/md";
import { useSceneData } from "@/context/SceneContext";
import { useListProjectCharactersQuery } from "@/graphql/__generated__/listProjectCharacters.generated";
import { useCreateCharacterProfileMutation } from "@/graphql/__generated__/createCharacter.generated";
interface MovieTextProps {
  pushCharacters: (value: string[]) => void;
}

const MovieText: React.FC<MovieTextProps> = ({ pushCharacters }) => {
  const {
    movieData,
    storyText,
    storyVersions,
    selectedStoryVersion,
    updateNewStoryVersion,
    updateSelectedStoryVersion,
    setMovieRefresh,
  } = useMovieData();

  const { sceneCount } = useSceneData();

  const [createCharacter] = useCreateCharacterProfileMutation();
  const { data: projectCharacters, refetch: refetchProjectCharacters } =
    useListProjectCharactersQuery({
      variables: { projectId: movieData?.id },
      skip: !movieData,
    });

  const { setSelection, resetSelection, selectedTextMode } = useSelection();

  const storyAreaRef = useRef<HTMLTextAreaElement>(null);

  const [createStoryFromUpdate, {}] = useGenerateStoryFromUpdateMutation();

  const [versionOptions, setVersionOptions] = useState<any[]>([]);
  const [defaultVersion, setDefaultVersion] = useState({ value: 0, label: "" });
  const [movieText, setMovieText] = useState<string>();
  const [movieTextUpdate, setMovieTextUpdate] = useState<string>();
  const [editStoryState, setEditStoryState] = useState<boolean>(false);
  const [readingData, setReadingData] = useState<any>();
  const [characters, setCharacters] = useState<string[]>([]);

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    setMovieRefresh(!refresh);
  }, [refresh]);

  useEffect(() => {
    if (storyText?.textContent) {
      setMovieText(storyText?.textContent);
      setMovieTextUpdate(storyText?.textContent);
      setReadingData(readingTime(storyText?.textContent));
      const extractedCharacters = extractCharacters(storyText?.textContent);
      extractedCharacters && pushCharacters(extractedCharacters);
      extractedCharacters && setCharacters(extractedCharacters);
    }
  }, [storyText]);

  useEffect(() => {
    scrollToElement("movieTextArea");
  }, [movieText]);

  useEffect(() => {
    const versionOptions =
      storyVersions
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
    setVersionOptions(versionOptions);
    const selectedVersion =
      storyVersions &&
      storyVersions.find((version: any) => version.id === selectedStoryVersion);
    if (selectedVersion) {
      setDefaultVersion({
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
  }, [storyVersions, selectedStoryVersion]);

  useEffect(() => {
    const resizeTextAreas = () => {
      const currentRef = storyAreaRef.current;
      if (currentRef) {
        currentRef.style.height = "auto";
        currentRef.style.height = `${currentRef.scrollHeight}px`;
      }
    };
    const currentRef = storyAreaRef.current;
    resizeTextAreas();
    if (currentRef) {
      const observer = new ResizeObserver(resizeTextAreas);
      observer.observe(currentRef);

      return () => {
        observer.disconnect();
      };
    }
  }, [movieText, movieTextUpdate, storyText, storyAreaRef]);

  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleStoryVersionChange = (selectedOption: any) => {
    if (!selectedOption) {
      return;
    }
    typeof window !== "undefined" &&
      localStorage.setItem(
        `${movieData?.id}_selectedStoryVersion`,
        selectedOption.value
      );
    updateSelectedStoryVersion(selectedOption.value);
  };

  const handleGenerateStoryUpdate = async () => {
    setEditStoryState(false);
    await createStoryFromUpdate({
      variables: {
        projectId: movieData?.id,
        textId: storyText?.id,
        textContent: movieTextUpdate,
      },
      onCompleted: (data) => {
        const newVersion = data?.updateStoryText?.storyText?.id;
        updateNewStoryVersion(newVersion);
        setMovieText(movieTextUpdate);
        setRefresh(!refresh);
      },
    });
  };

  const handleTextSelection = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const movieTextElement = document.getElementById("movieText");
      if (
        movieTextElement &&
        movieTextElement.contains(range.commonAncestorContainer)
      ) {
        const start = getSelectionStart(movieTextElement, range);
        const end = getSelectionEnd(movieTextElement, range);
        if (start !== end) {
          setSelection(start, end, "movieText");
          removeHighlight();
          setTimeout(() => {
            highlightSelection(start ?? 0, end ?? 0);
          }, 10);
        } else {
          selection.removeAllRanges();
          removeHighlight();
          setSelection(null, null, "movieText");
        }
      }
    }
  };

  const highlightSelection = (start: number, end: number) => {
    const selection = window.getSelection();

    if (selection) {
      const movieTextElement = document.getElementById("movieText");
      if (!movieTextElement) return;

      const range = document.createRange();
      const nodes = movieTextElement.childNodes;
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

      if (!startNode || !endNode) return;

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

  const removeHighlight = () => {
    const highlights = document.querySelectorAll("#movieText span");
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
    movieTextElement: HTMLElement,
    range: Range
  ): number => {
    const clonedRange = range.cloneRange();
    clonedRange.selectNodeContents(movieTextElement);
    clonedRange.setEnd(range.startContainer, range.startOffset);
    return clonedRange.toString().length;
  };

  const getSelectionEnd = (
    movieTextElement: HTMLElement,
    range: Range
  ): number => {
    const clonedRange = range.cloneRange();
    clonedRange.selectNodeContents(movieTextElement);
    clonedRange.setEnd(range.endContainer, range.endOffset);
    return clonedRange.toString().length;
  };

  const handleEditStory = () => {
    setEditStoryState(true);
    resetSelection("movieText");
    removeHighlight();
  };

  const handleCancelEditStory = () => {
    setEditStoryState(false);
    setMovieText(movieText);
    setMovieTextUpdate(movieText);
  };

  const customStyles = {
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
    // Check if projectCharacters data is available
    if (projectCharacters && projectCharacters.listProjectCharacters) {
      // Extract existing character names
      const existingCharacterNames =
        projectCharacters.listProjectCharacters.map(
          (character) => character?.name
        );

      // Filter out new characters
      const newCharacters = characters.filter(
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
                projectId: movieData.id,
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
    characters,
    projectCharacters,
    createCharacter,
    movieData,
    refetchProjectCharacters,
  ]);

  return (
    <div
      className={`grid grid-cols-[130px,1fr] transition ${
        selectedTextMode
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
              <div>{readingData ? readingData.words : `—`}</div>
              <div className="opacity-50">words</div>
            </div>
            <div className="flex flex-col">
              <div>{readingData ? readingData.minutes : `—`}</div>
              <div className="opacity-50">minutes</div>
            </div>
            {sceneCount > 0 && (
              <div className="flex flex-col">
                <div>{sceneCount}</div>
                <div className="opacity-50">scenes</div>
              </div>
            )}
            <div className="flex flex-col">
              <div>{characters.length < 1 ? `—` : characters.length}</div>
              <div className="opacity-50">characters</div>
            </div>
          </>
        </div>
      </div>
      <div id="movieTextArea" className={`pt-8 relative`}>
        {defaultVersion && versionOptions.length > 0 && (
          <Select
            name="versionValue"
            className={`!font-mono !text-[11px]`}
            options={versionOptions}
            styles={customStyles}
            maxMenuHeight={200}
            key={defaultVersion.value}
            defaultValue={defaultVersion}
            onChange={handleStoryVersionChange}
          />
        )}
        <div className="font-displayBold pb-3 text-[12px] absolute left-0 top-8 z-10">
          Movie Text
        </div>
        <div className="sticky pb-4 pr-6 top-4 right-0 float-right z-30">
          <div className="flex gap-2">
            {editStoryState && (
              <>
                <Button
                  className="outline-none rounded-full w-max flex gap-1 items-center py-[5px] px-4 text-[12px] bg-secondary text-offwhite hover:bg-secondary-hover transition cursor-pointer"
                  onPress={handleGenerateStoryUpdate}
                >
                  Save
                </Button>
                <Button
                  className="outline-none rounded-full w-max flex gap-1 items-center py-[5px] px-4 text-[12px] bg-red-500 text-offwhite hover:bg-red-400 transition cursor-pointer"
                  onPress={handleCancelEditStory}
                >
                  Cancel
                </Button>
              </>
            )}
            {!editStoryState && movieText && (
              <Button
                className="outline-none rounded-full w-max flex gap-1 items-center py-[5px] px-4 text-[12px] bg-light text-secondary hover:bg-light-hover transition cursor-pointer"
                onPress={handleEditStory}
              >
                Edit Story
              </Button>
            )}
          </div>
        </div>
        {movieText ? (
          <div className={`bg-white relative pb-8`}>
            <TextField name="textStory" aria-label="Story Text">
              <div
                id="movieText"
                className={`whitespace-pre-line flex flex-col overflow-hidden w-full leading-[24px] font-mono text-[12px] text-secondary/50 p-6 pt-4 pb-12 pl-0 h-fit ${
                  editStoryState
                    ? " absolute top-0 opacity-0 pointer-events-none z-0 "
                    : " opacity-100 pointer-events-auto z-1 "
                }`}
                onMouseUp={handleTextSelection}
              >
                {movieText}
              </div>
              <TextArea
                id="movieTextEditor"
                className={`editable-story whitespace-pre-line flex flex-col overflow-hidden leading-[24px] font-mono text-[12px] pb-12 w-full resize-none p-6 pt-4 pl-0 border-0 bg-transparent outline outline-0 focus:border-0 focus:outline-0 ${
                  editStoryState
                    ? " opacity-100 pointer-events-auto z-1 "
                    : " absolute top-0 opacity-0 pointer-events-none z-0 "
                }`}
                ref={storyAreaRef}
                value={movieTextUpdate}
                onChange={(e) => setMovieTextUpdate(e.target.value)}
                placeholder="Compose your movie here"
              />
            </TextField>
          </div>
        ) : (
          <DialogTrigger>
            <Button className="text-left pt-6">
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
                    This is where the text for your new movie will appear.
                  </div>
                  <div className="flex items-center">
                    Start by clicking
                    <Button
                      className="mx-2 inline px-2 py-1 bg-primary/40 rounded-full text-[11px]"
                      onPress={() =>
                        document.getElementById("generateMovieText")?.click()
                      }
                    >
                      <MdAutoAwesome className="inline" /> Write Movie Text
                    </Button>
                  </div>
                </div>
              </Dialog>
            </Popover>
          </DialogTrigger>
        )}
      </div>
    </div>
  );
};

export default MovieText;

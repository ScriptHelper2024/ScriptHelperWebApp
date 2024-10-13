"use client";
import React, {
  useState,
  FormEvent,
  useEffect,
  useRef,
  useContext,
} from "react";
import Image from "next/image";
import Link from "next/link";
import Select from "react-select";
import SceneText from "@/app/movie/scenes/scene/components/SceneText";
import CreateSceneSeedForm from "@/app/movie/scenes/scene/components/CreateSceneSeedForm";
import CreateSceneNoteForm from "@/app/movie/scenes/scene/components/CreateSceneNoteForm";
import { useGetBeatSheetQuery } from "@/graphql/__generated__/getBeatSheet.generated";
import { useListBeatSheetVersionsQuery } from "@/graphql/__generated__/listBeatSheetVersions.generated";
import {
  MdClose,
  MdEdit,
  MdOutlineEditNote,
  MdOutlineSaveAlt,
  MdOutlineStickyNote2,
} from "react-icons/md";
import {
  Button,
  Dialog,
  DialogTrigger,
  FieldError,
  Form,
  OverlayArrow,
  Popover,
  TextArea,
  TextField,
} from "react-aria-components";
import { SelectionProvider, useSelection } from "@/context/SelectionContext";
import { useUpdateSceneTextMutation } from "@/graphql/__generated__/updateScene.generated";
import { useAllScriptDialogFlavorsQuery } from "@/graphql/__generated__/listFlavors.generated";
import { useAllStylesQuery } from "@/graphql/__generated__/listStyles.generated";
import { useGenerateScriptTextFromSceneMutation } from "@/graphql/__generated__/createScriptFromScene.generated";
import { PiArrowLineLeftBold, PiArrowLineRightBold } from "react-icons/pi";
import { useSceneData } from "@/context/SceneContext";

import { formatDateAndTime } from "@/utils/utils";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import SceneContainer from "./components/SceneContainer";
import { useLazyQuery } from "@apollo/client";
import { useMovieData } from "@/context/MovieContext";
import { BeatSheet } from "@/types";
import { GET_BEAT_SHEET } from "@/graphql/getBeatSheet";
import { markdownToRTF } from "@/utils/markdownToRTF";
import { createFDX } from "@/utils/createFDX";
import JSZip from "jszip";

const BACKEND_URI = process.env.BACKEND_URI;

export default function Scene() {
  const router = useRouter();
  const { isUserAuthenticated } = useContext(AuthContext);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    if (!isUserAuthenticated()) {
      redirect("/");
    } else {
      setAuthChecked(true);
    }
  }, [isUserAuthenticated]);
  const {
    movieId,
    sceneKey,
    sceneText,
    scriptText,
    startPollingScript,
    setPollingSceneNotesActive,
    setPollingSceneActive,
    setPollingScriptNotesActive,
    setPollingScriptActive,
  } = useSceneData();

  const { movieData } = useMovieData();

  useEffect(() => {
    if (!sceneKey) {
      redirect(`/movie/scenes?id=${movieId}`);
    }
  }, [sceneKey, router]);

  const {
    selectSceneStart,
    selectSceneEnd,
    selectScriptStart,
    selectScriptEnd,
  } = useSelection();

  const [sceneTextContent, setSceneTextContent] = useState<string>();
  const [scriptTextContent, setScriptTextContent] = useState<string>();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [updateSceneTitle] = useUpdateSceneTextMutation();
  const [generateScriptFromScene] = useGenerateScriptTextFromSceneMutation();

  const titleAreaRef = useRef<HTMLTextAreaElement>(null);
  const sceneHeader = useRef<HTMLDivElement>(null);

  const { data: flavorData } = useAllScriptDialogFlavorsQuery({
    variables: {},
  });
  const flavors = flavorData?.allScriptDialogFlavors?.scriptDialogFlavors ?? [];
  const flavorOptions = flavors.map((flavor: any) => ({
    value: flavor.id,
    label: flavor.name,
  }));

  const { data: styleData } = useAllStylesQuery({
    variables: {},
  });
  const styles = styleData?.allStyleGuidelines?.styleGuidelines ?? [];
  const styleOptions = styles.map((style: any) => ({
    value: style.id,
    label: style.name,
  }));

  const { data: beatSheetVersionsData } = useListBeatSheetVersionsQuery({
    variables: {
      projectId: movieId,
      sceneKey: sceneKey,
    },
    skip: !sceneText?.id,
  });

  // const { data: beatSheetData } = useGetBeatSheetQuery({
  //   variables: {
  //     projectId: movieId,
  //     sceneKey: sceneKey,
  //   },
  //   skip: !sceneText?.id,
  // });

  const [getBeatSheet, { data: beatSheetData, loading: beatSheetLoading }] =
    useLazyQuery<{ getBeatSheet: BeatSheet }>(GET_BEAT_SHEET);

  const [isSwitchChecked, setIsSwitchChecked] = useState(false);
  const [title, setTitle] = useState<string>();
  const [editTitle, setEditTitle] = useState(false);
  const [sceneCharacters, setSceneCharacters] = useState<string[]>([]);
  const [scriptCharacters, setScriptCharacters] = useState<string[]>([]);
  const [toggleSidebar, setToggleSidebar] = useState(true);
  const [value, setValue] = useState<string>();
  const [selectionIs, setSelectionIs] = useState("");
  const [scenesTrayOpen, setScenesTrayOpen] = useState(false);
  const [beatSheetContent, setBeatSheetContent] = useState<string>();

  useEffect(() => {
    if (sceneText?.textContent) {
      setSceneTextContent(sceneText?.textContent);
    }
  }, [sceneText]);

  useEffect(() => {
    if (scriptText?.textContent) {
      setScriptTextContent(scriptText?.textContent);
    }
  }, [scriptText]);

  // useEffect(() => {
  //   if (beatSheetData?.getBeatSheet?.textContent) {
  //     setBeatSheetContent(beatSheetData?.getBeatSheet?.textContent);
  //   }
  // }, [beatSheetData?.getBeatSheet?.textContent]);

  useEffect(() => {
    if (beatSheetVersionsData) {
      beatSheetVersionsData?.listBeatSheetVersions?.forEach((version) => {
        if (version) {
          getBeatSheet({
            variables: {
              textId: version?.id,
              projectId: movieId,
              sceneKey: sceneKey,
            },
          });
        }
      });
    }
  }, [beatSheetVersionsData, getBeatSheet, movieId, sceneKey]);

  useEffect(() => {
    setTitle(sceneText?.title);
    setValue(sceneText?.title);
    console.log(sceneText);
  }, [sceneText?.title]);

  useEffect(() => {
    const resizeTextAreas = () => {
      const currentRef = titleAreaRef.current;
      if (currentRef) {
        currentRef.style.height = "auto";
        currentRef.style.height = `${currentRef.scrollHeight}px`;
      }
    };
    resizeTextAreas();
  }, [title, value]);

  const handleGenerateScriptWithOptions = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setScenesTrayOpen(false);
    scrollToElement("scriptTextEditor");
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const flavorValue = formData.get("flavorsValue") as string;
    const styleValue = formData.get("stylesValue") as string;
    const variables = {
      projectId: movieId,
      sceneKey: sceneKey,
      sceneTextId: sceneText?.id,
      scriptDialogFlavorId: flavorValue,
      styleGuidelineId: styleValue,
      textId: scriptText?.id,
      includeBeatSheet: true,
    };

    generateScriptFromScene({
      variables,
      onCompleted: (data) => {
        startPollingScript();
      },
    });
  };

  const handleEditTitle = () => {
    setEditTitle(true);
    setTimeout(() => {
      const input = titleAreaRef.current;
      if (input) {
        input.focus();
        input.style.height = "auto";
        input.style.height = `${input.scrollHeight}px`;
      }
    }, 0);
  };

  const handleCancelEditTitle = () => {
    setEditTitle(false);
    setTitle(title);
    setValue(title);
  };

  const handleUpdateSceneTitle = async () => {
    setEditTitle(false);
    await updateSceneTitle({
      variables: {
        textId: sceneText?.id,
        projectId: movieId,
        title: value,
      },
      onCompleted: (data) => {
        const newTitle = data?.updateSceneText?.sceneText?.title;
        setTitle(newTitle);
        setValue(newTitle);
      },
    });
  };

  const handleSelectionIs = (newSelectionIs: string) => {
    setSelectionIs(newSelectionIs);
  };

  const handleToggleSidebar = () => {
    setToggleSidebar(!toggleSidebar);
  };

  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      border: "1px solid #ccc",
      borderRadius: "4px",
      boxShadow: state.isFocused ? "0 0 0 1px #ccc" : "none",
      "&:hover": {
        borderColor: "#ccc",
      },
      "&:focus": {
        border: 0,
        outline: "none",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#333" : "white",
      color: state.isSelected ? "white" : "#333",
      "&:hover": {
        backgroundColor: state.isSelected ? "#333" : "#f0f0f0",
        color: state.isSelected ? "white" : "#333",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      border: "1px solid #ccc",
      borderRadius: "4px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      position: "relative",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "4px",
    }),
  };

  useEffect(() => {
    setPollingSceneNotesActive(false);
    setPollingSceneActive(false);
    setPollingScriptNotesActive(false);
    setPollingScriptActive(false);
  }, [pathname, searchParams]);
  if (!authChecked) {
    return <div></div>;
  }

  const handleDownload = async () => {
    try {
      const url = `${BACKEND_URI}/api/v1/export_script`;
      const token = localStorage.getItem("AUTH_TOKEN");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: movieId,
          formatted: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Network response error: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.text();
      console.log("Download successful", result);

      // Strip out the "```fountain" prefix and "```" suffix
      const strippedResult = result
        .replace(/^```fountain\s+/, "")
        .replace(/\s+```$/, "");

      // Convert markdown to RTF
      const rtfContent = markdownToRTF(strippedResult);

      // Create FDX content
      const fdxContent = createFDX(strippedResult);

      // Create a zip file
      const zip = new JSZip();
      zip.file(
        `${movieData?.title}-Export-${new Date().toISOString().slice(0, 10)}.rtf`,
        rtfContent,
      );
      zip.file(
        `${movieData?.title}-Export-${new Date().toISOString().slice(0, 10)}.fdx`,
        fdxContent,
      );
      zip.file(
        `${movieData?.title}-Export-${new Date().toISOString().slice(0, 10)}.txt`,
        result,
      );

      // Generate the zip file and trigger download
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = `${movieData?.title}-Export-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Error downloading the script:", error);
    }
  };

  return (
    <SceneContainer>
      <span
        className="absolute z-40 col-span-3 col-start-1 row-span-full row-start-3 h-full w-full rounded-br-2xl bg-secondary/40 backdrop-blur-[2px]"
        style={{
          transition: "opacity 0.3s",
          opacity: scenesTrayOpen ? 1 : 0,
          pointerEvents: scenesTrayOpen ? "auto" : "none",
        }}
      ></span>
      <SelectionProvider>
        <div className="relative col-span-2 col-start-1 row-span-1 row-start-3 h-full max-h-[calc(100vh-138px)] bg-uiLight pl-[64px]">
          <div className="flex max-h-full flex-col p-4">
            <div className="relative mb-5 w-full min-w-[300px] max-w-[600px] rounded-lg border-[1px] border-light bg-white p-4 pt-3 text-[14px] leading-[24px] transition">
              <div className="font-displayBold text-[12px] text-secondary">
                Scene {sceneText?.sceneOrder}
              </div>
              {editTitle ? (
                <>
                  <TextField aria-label="Title field" isRequired>
                    <div className="relative text-[16px]">
                      <TextArea
                        id="titleInput"
                        ref={titleAreaRef}
                        className="group relative mb-3 block w-full rounded-md border-[1px] bg-offwhite px-2 py-2 pr-8 font-displayBold text-[16px] outline-none"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                      />
                      <MdEdit className="absolute right-[17px] top-[13px] cursor-pointer text-secondary/30 opacity-100 hover:text-secondary" />
                    </div>
                    <FieldError className="mb-1 ml-4 rounded-md bg-pink-50 p-2 text-center text-sm text-red-500">
                      Title can not be blank.
                    </FieldError>
                  </TextField>
                  <div className="mb-2 flex items-center justify-start gap-2 pb-3 pt-0">
                    <div
                      className="flex w-max cursor-pointer items-center gap-1 rounded-full bg-secondary px-3 py-0 text-[12px] text-offwhite outline-none transition hover:bg-secondary-hover"
                      onClick={handleUpdateSceneTitle}
                    >
                      Save
                    </div>
                    <div
                      className="flex w-max cursor-pointer items-center gap-1 rounded-full bg-red-500 px-3 py-0 text-[12px] text-offwhite outline-none transition hover:bg-red-400"
                      onClick={handleCancelEditTitle}
                    >
                      Cancel
                    </div>
                  </div>
                </>
              ) : (
                <div
                  className="group relative mb-4 w-full border-light py-2 pr-6 font-displayBold text-[16px] hover:cursor-text hover:rounded-md hover:border-[1px] hover:bg-offwhite hover:pl-2"
                  onClick={handleEditTitle}
                >
                  {value}
                  <MdEdit className="absolute right-3 top-3 cursor-pointer text-secondary/30 opacity-0 transition-all hover:text-secondary group-hover:opacity-100" />
                </div>
              )}

              <Link
                href={`/movie/scenes?id=${movieId}`}
                className="absolute bottom-1 right-1 mt-4 px-3 py-1 text-[12px] text-secondary underline hover:no-underline"
              >
                Back to Scenes Panel
              </Link>
            </div>
            {!sceneTextContent ? (
              <DialogTrigger>
                <div className="pb-3 font-displayBold text-[12px]">
                  Notes Generator
                </div>
                <Button className="align-center flex w-full justify-center gap-2 rounded-lg border-[1px] border-dashed border-secondary py-3 font-displayBold text-[14px] text-secondary transition hover:border-secondary-hover hover:text-secondary-hover">
                  <MdOutlineEditNote size={22} />
                  Improve Text
                </Button>
                <Popover>
                  <OverlayArrow>
                    <svg width={12} height={12} viewBox="0 0 12 12">
                      <path d="M0 0 L6 6 L12 0" />
                    </svg>
                  </OverlayArrow>
                  <Dialog>
                    <div className="rounded-lg bg-secondary px-3 py-2 text-[12px] text-white">
                      <div className="font-displayBold">Notes</div>
                      {`To start adding notes to your scene and script you'll need to compose a seed and generate the scene and script text.`}
                    </div>
                  </Dialog>
                </Popover>
              </DialogTrigger>
            ) : (
              <>
                {!sceneTextContent && !scriptTextContent ? (
                  <DialogTrigger>
                    <div className="pb-3 font-displayBold text-[12px]">
                      Notes Generator
                    </div>
                    <Button className="align-center flex w-full justify-center gap-2 rounded-lg border-[1px] border-dashed border-secondary py-3 font-displayBold text-[14px] text-secondary transition hover:border-secondary-hover hover:text-secondary-hover">
                      <MdOutlineEditNote size={22} />
                      Improve Text
                    </Button>
                    <Popover>
                      <OverlayArrow>
                        <svg width={12} height={12} viewBox="0 0 12 12">
                          <path d="M0 0 L6 6 L12 0" />
                        </svg>
                      </OverlayArrow>
                      <Dialog>
                        <div className="rounded-lg bg-secondary px-3 py-2 text-[12px] text-white">
                          <span className="font-displayBold">
                            Scene Text is Generating...
                          </span>
                          {`Improve text with Notes once the text is finished generating.`}
                        </div>
                      </Dialog>
                    </Popover>
                  </DialogTrigger>
                ) : (
                  <CreateSceneNoteForm
                    sceneHeader={sceneHeader}
                    selectSceneStart={selectSceneStart ?? undefined}
                    selectSceneEnd={selectSceneEnd ?? undefined}
                    selectScriptStart={selectScriptStart ?? undefined}
                    selectScriptEnd={selectScriptEnd ?? undefined}
                    setSelectionIs={handleSelectionIs}
                    isSwitchChecked={isSwitchChecked}
                    setIsSwitchChecked={setIsSwitchChecked}
                  />
                )}
              </>
            )}
          </div>
        </div>
        <div
          className={`${
            toggleSidebar ? "col-start-3" : "col-span-2 col-start-2"
          } relative row-span-1 row-start-3 flex h-full max-h-[calc(100vh-138px)] flex-col overflow-hidden bg-white`}
        >
          <div
            className="absolute bottom-0 top-[50%] z-50 flex h-full w-[330px] translate-y-[-50%] flex-col justify-center p-4"
            style={{
              transition: "all 0.3s",
              opacity: scenesTrayOpen ? 1 : 0,
              right: scenesTrayOpen ? "0" : "-330px",
              pointerEvents: scenesTrayOpen ? "auto" : "none",
            }}
          >
            <div className="h-auto overflow-hidden rounded-2xl border-b-[1px] border-l-[1px] border-t-[1px] bg-offwhite text-[14px] shadow-lg">
              <div className="relative z-10 flex w-full items-center justify-between bg-white p-4 px-5 text-[16px] shadow-md shadow-black/5">
                <div className="font-displayBold text-secondary">
                  Scene Overview
                </div>
                <Button
                  onPress={() => setScenesTrayOpen(false)}
                  className="text-[18px]"
                >
                  <MdClose />
                </Button>
              </div>
              <div className="scrollWrapper h-full w-full overflow-x-hidden">
                <div className="flex h-auto flex-col justify-between gap-2 p-2">
                  <div className="relative w-full rounded-lg border-[1px] border-light bg-white p-4 pt-3 text-[14px] transition">
                    <div className="font-displayBold text-[16px] text-secondary">
                      Scene {sceneText?.sceneOrder}
                    </div>
                    <div className="font-displayBold text-[16px] text-secondary">
                      {sceneText?.title}
                    </div>
                    <div className="mb-2 flex flex-col text-[12px]">
                      <div className="line-clamp-3">{sceneText?.textSeed}</div>
                    </div>
                    <div className="mt-2 flex flex-col text-[12px]">
                      <div className="font-displayBold">
                        Created{" "}
                        {formatDateAndTime(new Date(sceneText?.createdAt))}
                      </div>
                    </div>
                  </div>
                  {sceneText?.versionNumber > 1 && (
                    <>
                      {sceneCharacters?.length > 0 && (
                        <div className="relative w-full rounded-lg border-[1px] border-light bg-white p-4 pb-2 pt-3 text-[14px] transition">
                          <div className="font-displayBold text-[14px] text-secondary">
                            Characters in the scene
                          </div>
                          <div className="my-2 flex flex-wrap gap-2">
                            {sceneCharacters.map((character, index) => (
                              <div
                                key={index}
                                className="rounded-full bg-light px-4 py-1 font-displayBold text-[12px] text-secondary"
                              >
                                {character}
                              </div>
                            ))}
                          </div>
                          <Link
                            href={`/movie/wiki/characters?id=${movieId}`}
                            className="text-[12px] text-secondary/50 underline transition hover:text-secondary hover:no-underline"
                          >
                            Go to all characters
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                  {scriptText?.versionNumber > 1 && (
                    <>
                      {scriptCharacters?.length > 0 && (
                        <div className="relative w-full rounded-lg border-[1px] border-light bg-white p-4 pb-2 pt-3 text-[14px] transition">
                          <div className="font-displayBold text-[14px] text-secondary">
                            Characters in the script
                          </div>
                          <div className="my-2 flex flex-wrap gap-2">
                            {scriptCharacters.map((character, index) => (
                              <div
                                key={index}
                                className="rounded-full bg-light px-4 py-1 font-displayBold text-[12px] text-secondary"
                              >
                                {character}
                              </div>
                            ))}
                          </div>
                          <Link
                            href={`/movie/wiki/characters?id=${movieId}`}
                            className="text-[12px] text-secondary/50 underline transition hover:text-secondary hover:no-underline"
                          >
                            Go to all characters
                          </Link>
                        </div>
                      )}
                      {beatSheetVersionsData &&
                        beatSheetVersionsData.listBeatSheetVersions && (
                          <div className="relative w-full rounded-lg border-[1px] border-light bg-white p-4 pb-2 pt-3 text-[14px] transition">
                            <div className="font-displayBold text-[14px] text-secondary">
                              Beat Sheet
                            </div>
                            {beatSheetVersionsData.listBeatSheetVersions.map(
                              (version) => (
                                <details
                                  className="my-2 text-xs"
                                  key={version?.versionNumber}
                                >
                                  <summary className="cursor-pointer font-bold">
                                    Version {version?.versionNumber}
                                  </summary>
                                  <div className="whitespace-pre-line">
                                    {beatSheetData?.getBeatSheet?.textContent}
                                  </div>
                                </details>
                              ),
                            )}
                            {/* <div className="mb-2 text-[12px] flex flex-col">
                          <div className="line-clamp-3">{beatSheetContent}</div>
                        </div> */}
                          </div>
                        )}
                      <Form
                        onSubmit={handleGenerateScriptWithOptions}
                        className="flex flex-col gap-2"
                      >
                        <div className="relative h-auto w-full rounded-lg border-[1px] border-light bg-white p-4 pt-3 text-[14px] transition">
                          <div className="font-displayBold text-[14px] text-secondary">
                            Script Dialog Flavor
                          </div>
                          <Select
                            name="flavorsValue"
                            options={flavorOptions}
                            className={`mt-2 w-full`}
                            styles={customStyles}
                            maxMenuHeight={150}
                          />
                        </div>
                        <div className="relative h-auto w-full rounded-lg border-[1px] border-light bg-white p-4 pt-3 text-[14px] transition">
                          <div className="font-displayBold text-[14px] text-secondary">
                            Script Styleguide
                          </div>
                          <Select
                            name="stylesValue"
                            options={styleOptions}
                            className={`mt-2 w-full`}
                            styles={customStyles}
                            maxMenuHeight={150}
                          />
                        </div>
                        <div className="mt-auto">
                          <div className="flex justify-end gap-2">
                            <Button
                              onPress={() => setScenesTrayOpen(false)}
                              className="rounded-full bg-primary px-4 py-2 text-sm text-white transition hover:bg-primary-hover"
                            >
                              Close
                            </Button>
                            <Button
                              className="rounded-full bg-secondary px-4 py-2 text-sm text-white transition hover:bg-secondary-hover"
                              type="submit"
                            >
                              Update Script
                            </Button>
                          </div>
                        </div>
                      </Form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className={`scrollWrapper h-full w-full overflow-x-hidden`}>
            {toggleSidebar ? (
              <div className="relative left-6 top-5 w-[18px] cursor-pointer opacity-10 transition hover:opacity-100">
                <PiArrowLineLeftBold
                  size={18}
                  className="text-secondary transition hover:text-secondary-hover"
                  onClick={handleToggleSidebar}
                />
              </div>
            ) : (
              <div className="relative left-6 top-5 w-[18px] cursor-pointer opacity-60 transition hover:opacity-100">
                <PiArrowLineRightBold
                  size={18}
                  className="text-secondary transition hover:text-secondary-hover"
                  onClick={handleToggleSidebar}
                />
              </div>
            )}
            <CreateSceneSeedForm />
            <div className="relative w-full border-b-[1px] pt-4"></div>
            <div className="relative">
              <SceneText
                selectionType={selectionIs}
                pushSceneCharacters={setSceneCharacters}
                pushScriptCharacters={setScriptCharacters}
              />
            </div>
          </div>
          <div className="absolute bottom-6 left-[50%] z-30 flex w-max translate-x-[-50%] items-center gap-1 rounded-full bg-secondary-hover px-4 py-1.5 text-[12px] text-offwhite">
            <button
              id="scrollToSceneSeed"
              onClick={() => scrollToElement("sceneSeed")}
            >
              Scene Seed
            </button>
            &nbsp; | &nbsp;
            <button
              id="scrollToSceneText"
              onClick={() => scrollToElement("sceneTextArea")}
            >
              Scene Text
            </button>
            &nbsp; | &nbsp;
            <button
              id="scrollToScriptText"
              onClick={() => scrollToElement("scriptTextEditor")}
            >
              Script Text
            </button>
          </div>
        </div>
        <div className="relative col-start-4 row-span-full row-start-3 h-full">
          <div
            className={`group absolute top-[50%] z-40 flex w-fit translate-y-[-50%] flex-col items-center justify-center gap-5 rounded-full border-[1px] border-light bg-white px-2 py-3`}
            style={{
              transition: "all 0.275s",
              right: scenesTrayOpen ? "412px" : "16px",
            }}
          >
            <Button
              onPress={() => setScenesTrayOpen(true)}
              className={`flex h-[28px] w-[28px] items-center justify-center rounded-full transition ${
                scenesTrayOpen
                  ? "bg-primary hover:bg-primary-hover"
                  : "bg-secondary hover:bg-secondary-hover"
              }`}
            >
              <Image
                src="/scenes-white.svg"
                width={14}
                height={14}
                alt="Script Helper icon"
              />
            </Button>
            <DialogTrigger>
              <Button>
                <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-secondary hover:bg-secondary-hover">
                  <MdOutlineStickyNote2 className="text-white" size={14} />
                </div>
              </Button>
              <Popover>
                <OverlayArrow>
                  <svg width={12} height={12} viewBox="0 0 12 12">
                    <path d="M0 0 L6 6 L12 0" />
                  </svg>
                </OverlayArrow>
                <Dialog>
                  <div className="rounded-lg bg-secondary px-3 py-2 text-[12px] text-white">
                    <div className="font-displayBold">Notepad</div>
                    <span className="opacity-50">Coming soon</span>
                  </div>
                </Dialog>
              </Popover>
            </DialogTrigger>
            <Button onPress={handleDownload}>
              <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-secondary hover:bg-secondary-hover">
                <MdOutlineSaveAlt className="text-white" />
              </div>
            </Button>
            {/* <DialogTrigger>
              <Button>
                <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-secondary hover:bg-secondary-hover">
                  <MdOutlineSaveAlt className="text-white" />
                </div>
              </Button>
              <Popover>
                <OverlayArrow>
                  <svg width={12} height={12} viewBox="0 0 12 12">
                    <path d="M0 0 L6 6 L12 0" />
                  </svg>
                </OverlayArrow>
                <Dialog>
                  <div className="rounded-lg bg-secondary px-3 py-2 text-[12px] text-white">
                    <div className="font-displayBold">Download</div>
                    <span className="opacity-50">Coming soon</span>
                  </div>
                </Dialog>
              </Popover>
            </DialogTrigger> */}
            <Button
              onPress={() => setScenesTrayOpen(false)}
              className={`absolute -bottom-16 p-8 pt-4 transition-opacity ${
                scenesTrayOpen
                  ? "opacity-0 group-hover:opacity-100"
                  : "opacity-0"
              }`}
            >
              <div className="rounded-full bg-secondary p-1 text-white hover:bg-secondary-hover">
                <MdClose size={14} />
              </div>
            </Button>
          </div>
        </div>
      </SelectionProvider>
    </SceneContainer>
  );
}

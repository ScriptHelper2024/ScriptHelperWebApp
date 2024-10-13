"use client";
import React, { useState, useEffect, useContext } from "react";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import CreateSeedForm from "@/app/movie/movie/components/CreateSeedForm";
import CreateNoteForm from "@/app/movie/movie/components/CreateNoteForm";
import MovieText from "@/app/movie/movie/components/MovieText";
import MovieTextScaffold from "@/app/movie/movie/components/MovieText-Scaffold";
import AINotesScaffold from "@/app/movie/movie/components/AI-Notes-Scaffold";
import {
  Button,
  Dialog,
  DialogTrigger,
  Group,
  Input,
  Label,
  Link,
  NumberField,
  OverlayArrow,
  Popover,
} from "react-aria-components";
import {
  MdClose,
  MdOutlineEditNote,
  MdOutlineMovieCreation,
  MdOutlineSaveAlt,
  MdOutlineStickyNote2,
} from "react-icons/md";
import { formatDistanceToNowShort, formatDateAndTime } from "@/utils/utils";
import { PiArrowLineLeftBold, PiArrowLineRightBold } from "react-icons/pi";
import { SelectionProvider } from "@/context/SelectionContext";
import { useSceneData } from "@/context/SceneContext";
import { useGenerateMakeScenesMutation } from "@/graphql/__generated__/makeScenes.generated";
import { useMovieData } from "@/context/MovieContext";
import Image from "next/image";
import { AuthContext } from "@/context/AuthContext";
import MovieContainer from "@/context/MovieContainer";
import JSZip from "jszip";
import { markdownToRTF } from "@/utils/markdownToRTF";
import { createFDX } from "@/utils/createFDX";

const BACKEND_URI = process.env.BACKEND_URI;

export default function Movie() {
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

  const pathname = usePathname();
  const searchparams = useSearchParams();
  const {
    movieData,
    storyText,
    pollingActive,
    pollingNotesActive,
    setPollingActive,
    setPollingNotesActive,
  } = useMovieData();

  const [generateMakeScenesMutation, {}] = useGenerateMakeScenesMutation();
  const { setScenesGenerating, sceneCount, setSceneCount, hasScenes } =
    useSceneData();

  const [isSwitchChecked, setIsSwitchChecked] = useState(false);

  const [characters, setCharacters] = useState<string[]>([]);

  const [scenesTrayOpen, setScenesTrayOpen] = useState(false);
  const [trayOverview, setTrayOverview] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(true);
  const [scenesDialogOpen, setScenesDialogOpen] = useState(false);
  const [scenesHint, setScenesHint] = useState(false);
  useEffect(() => {
    if (storyText) {
      if (typeof window !== "undefined") {
        if (
          storyText?.textContent &&
          !hasScenes &&
          localStorage.getItem(`${movieData?.id}_dialogShown`) === null
        ) {
          setScenesDialogOpen(true);
          localStorage.setItem(`${movieData?.id}_dialogShown`, "true");
        }
        if (
          storyText?.textContent &&
          !hasScenes &&
          localStorage.getItem(`${movieData?.id}_dialogShown`) === "true"
        ) {
          setScenesHint(true);
        }
      }
    }
  }, [storyText]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem(`${movieData?.id}_dialogShown`) === null) {
      }
    }
  }, []);

  const handleGenerateScenes = () => {
    setScenesDialogOpen(false);
    generateMakeScenesMutation({
      variables: {
        storyTextId: storyText?.id,
        projectId: movieData?.id,
        sceneCount: sceneCount,
      },
    });
    setScenesGenerating(true);
    router.push(`/movie/scenes?id=${movieData?.id}`);
  };

  const updateSceneCount = (count: number) => {
    setSceneCount(count);
  };

  const handleShowOverview = () => {
    setTrayOverview(true);
    setScenesTrayOpen(true);
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

  useEffect(() => {
    setPollingActive(false);
    setPollingNotesActive(false);
  }, [pathname, searchparams]);
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
          project_id: movieData?.id,
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
    <MovieContainer>
      {!hasScenes && scenesDialogOpen && (
        <div className="fixed inset-0 z-50 flex h-screen items-center justify-center bg-black bg-opacity-50">
          <div className="relative m-3 w-full min-w-[300px] max-w-[460px] rounded-2xl border-[1px] border-light bg-white text-[14px] leading-[24px] transition">
            <div className="relative">
              <div className="px-4 pb-0 pt-4">
                <div className="font-displayBold text-[18px]">
                  Great progress on your script!
                </div>
              </div>
              <div className="border-b-[1px] p-4 text-[14px] leading-[24px]">
                <div onClick={(e) => e.stopPropagation()}>
                  <p>{`Ready to add depth to your story? Let's create dynamic
                    scenes! Start with generating scenes to enhance your
                    narrative. You can always refine your movie text or create
                    more scenes from the scenes panel.`}</p>
                  <p className="mt-4">
                    {`Select a number of scenes below and click "Generate Scenes" to create your scenes.`}
                  </p>
                  <div className="mt-4">
                    <NumberField
                      value={sceneCount}
                      onChange={(value) => updateSceneCount(value)}
                      minValue={1}
                      maxValue={40}
                      isWheelDisabled
                      className="flex w-full items-center justify-between outline-none focus:border-none focus:outline-none"
                    >
                      <Label className="font-displayBold">
                        Number of scenes:
                      </Label>
                      <Group className="flex w-fit justify-between rounded-lg border-[1px] border-light text-[16px]">
                        <Button
                          slot="decrement"
                          className="h-[40px] w-[40px] rounded-bl-lg rounded-tl-lg bg-light/50 p-0 font-displayBold text-secondary hover:bg-light/100"
                        >
                          -
                        </Button>
                        <Input className="w-fit text-center outline-none focus:border-none focus:outline-none" />
                        <Button
                          slot="increment"
                          className="h-[40px] w-[40px] rounded-br-lg rounded-tr-lg bg-light/50 p-0 font-displayBold text-secondary hover:bg-light/100"
                        >
                          +
                        </Button>
                      </Group>
                    </NumberField>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-end">
                  <div className="flex gap-2">
                    <Button
                      className="rounded-full bg-primary px-4 py-2 text-sm text-white transition hover:bg-primary-hover"
                      onPress={() => setScenesDialogOpen(false)}
                    >
                      Not Yet
                    </Button>
                    <Button
                      className="rounded-full bg-secondary px-4 py-2 text-sm text-white transition hover:bg-secondary-hover"
                      onPress={handleGenerateScenes}
                    >
                      Generate Scenes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <span
        className="absolute z-40 col-span-3 col-start-1 row-span-full row-start-3 h-full w-full rounded-br-2xl bg-secondary/40 backdrop-blur-[2px]"
        style={{
          transition: "opacity 0.3s",
          opacity: scenesTrayOpen ? 1 : 0,
          pointerEvents: scenesTrayOpen ? "auto" : "none",
        }}
      ></span>
      <SelectionProvider>
        <div className="relative col-span-2 col-start-1 row-span-1 row-start-3 max-h-full bg-uiLight pl-[64px]">
          <div className="flex max-h-full flex-col p-4">
            {!storyText?.textContent ? (
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
                      {`To start adding notes to your project you'll need to generate movie text using a seed.`}
                    </div>
                  </Dialog>
                </Popover>
              </DialogTrigger>
            ) : (
              <>
                {pollingNotesActive && (
                  <div className="absolute bottom-0 left-[70px] right-0 top-[130px] z-10 -mt-[20px] bg-uiLight">
                    <div className="absolute bottom-0 left-0 right-0 z-20 h-[500px] w-full bg-gradient-to-t from-[#F3FAFA] to-transparent"></div>
                    <AINotesScaffold />
                  </div>
                )}
                <CreateNoteForm
                  isSwitchChecked={isSwitchChecked}
                  setIsSwitchChecked={setIsSwitchChecked}
                />
              </>
            )}
          </div>
        </div>
        <div
          className={`${
            toggleSidebar ? "col-start-3" : "col-span-2 col-start-2"
          } relative row-span-1 row-start-3 flex max-h-full flex-col overflow-hidden bg-white`}
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
            {trayOverview && (
              <div className="h-auto overflow-hidden rounded-2xl border-b-[1px] border-l-[1px] border-t-[1px] bg-offwhite text-[14px] shadow-lg">
                <div className="relative z-10 flex w-full items-center justify-between bg-white p-4 px-5 text-[16px] shadow-md shadow-black/5">
                  <div className="font-displayBold text-secondary">
                    Movie Overview
                  </div>
                  <Button
                    onPress={() => setScenesTrayOpen(false)}
                    className="text-[18px]"
                  >
                    <MdClose />
                  </Button>
                </div>
                <div className="flex h-auto flex-col justify-between gap-2 p-2">
                  <div className="relative w-full rounded-lg border-[1px] border-light bg-white p-4 pt-3 text-[14px] transition">
                    <div className="font-displayBold text-[16px] text-secondary">
                      {movieData?.title}
                    </div>
                    <div className="mb-2 flex flex-col text-[12px]">
                      <div className="line-clamp-3">{storyText?.textSeed}</div>
                    </div>
                    <div className="mt-2 flex flex-col text-[12px]">
                      <div className="font-displayBold">
                        Created{" "}
                        {formatDateAndTime(new Date(movieData?.createdAt))}
                      </div>
                      {storyText?.createdAt && (
                        <i className="opacity-50">
                          Saved{" "}
                          {formatDistanceToNowShort(
                            new Date(storyText?.createdAt),
                          )}
                        </i>
                      )}
                    </div>
                  </div>
                  {characters && characters.length > 0 && (
                    <div className="relative w-full rounded-lg border-[1px] border-light bg-white p-4 pb-3 pt-3 text-[14px] transition">
                      <div className="font-displayBold text-[14px] text-secondary">
                        Characters in this story
                      </div>
                      <div className="my-2 flex flex-wrap gap-2">
                        {characters.map((character, index) => (
                          <div
                            key={index}
                            className="rounded-full bg-light px-4 py-1 font-displayBold text-[12px] text-secondary"
                          >
                            {character}
                          </div>
                        ))}
                      </div>
                      <Link
                        href={`/movie/wiki/characters?id=${movieData?.id}`}
                        className="text-[12px] text-secondary/50 underline transition hover:text-secondary hover:no-underline"
                      >
                        Go to all characters
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div
            className={`scrollWrapper ${
              pollingActive ? "overflow-y-hidden" : "overflow-y-auto"
            } h-full w-full overflow-x-hidden`}
          >
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
            <CreateSeedForm />
            <div className="relative w-full border-b-[1px] pt-4"></div>
            <div
              className={`relative ${!hasScenes && scenesHint ? "pb-24" : ""}`}
            >
              {pollingActive ? (
                <div className="absolute bottom-0 left-[130px] right-0 top-[70px] z-20 h-screen overflow-hidden bg-white p-4 pl-0 pt-0">
                  <div className="absolute bottom-0 left-0 right-0 top-0 z-20 w-full bg-gradient-to-t from-white to-transparent"></div>
                  <MovieTextScaffold />
                </div>
              ) : (
                <MovieText pushCharacters={setCharacters} />
              )}
            </div>
            {!hasScenes && scenesHint && (
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 bg-secondary p-4 text-[14px] text-white">
                <Image
                  src="/scenes-white.svg"
                  width={18}
                  height={18}
                  alt="Script Helper icon"
                />{" "}
                <div>
                  Next steps: Tell the story. Dive into details on the{" "}
                  <Link
                    href={`/movie/scenes?id=${movieData?.id}`}
                    className="font-displayBold underline transition hover:text-primary-hover hover:no-underline"
                  >
                    Scenes page
                  </Link>{" "}
                  or start with{" "}
                  <Button
                    onPress={() => setScenesDialogOpen(true)}
                    className="font-displayBold underline transition hover:text-primary-hover hover:no-underline"
                  >
                    Automatic Scenes
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div
            className={`absolute bottom-6 left-[50%] z-30 flex w-max translate-x-[-50%] items-center gap-1 rounded-full bg-secondary-hover px-4 py-1.5 text-[12px] text-offwhite ${
              !hasScenes && scenesHint && "mb-16"
            }`}
          >
            <button
              id="scrollToMovieSeed"
              onClick={() => scrollToElement("movieSeed")}
            >
              Movie Seed
            </button>
            &nbsp; | &nbsp;
            <button
              id="scrollToMovieText"
              onClick={() => scrollToElement("movieTextArea")}
            >
              Movie Text
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
              onPress={handleShowOverview}
              className={`flex h-[28px] w-[28px] items-center justify-center rounded-full transition ${
                trayOverview && scenesTrayOpen
                  ? "bg-primary hover:bg-primary-hover"
                  : "bg-secondary hover:bg-secondary-hover"
              }`}
            >
              <MdOutlineMovieCreation className="text-white" size={14} />
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
              <Popover>
                <OverlayArrow>
                  <svg width={12} height={12} viewBox="0 0 12 12">
                    <path d="M0 0 L6 6 L12 0" />
                  </svg>
                </OverlayArrow>
                <Dialog>
                  <div className="bg-secondary text-white py-2 px-3 rounded-lg text-[12px]">
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
    </MovieContainer>
  );
}

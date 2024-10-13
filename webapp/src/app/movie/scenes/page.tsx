"use client";
import React, { useState, useEffect, FormEvent, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { useListProjectScenesQuery } from "@/graphql/__generated__/listProjectScenes.generated";
import { useDeleteSceneByKeyMutation } from "@/graphql/__generated__/deleteScene.generated";
import { useGenerateMakeScenesMutation } from "@/graphql/__generated__/makeScenes.generated";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useReorderSceneMutation } from "@/graphql/__generated__/reorderScene.generated";
import { useSceneData } from "@/context/SceneContext";
import {
  Button,
  Form,
  Group,
  Input,
  Label,
  NumberField,
} from "react-aria-components";
import ScenesScaffold from "@/app/movie/scenes/components/Scenes-Scaffold";
import { RxDragHandleDots2 } from "react-icons/rx";
import { redirect, useSearchParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { useMovieData } from "@/context/MovieContext";

interface Scene {
  sceneKey: string;
  sceneOrder: number;
  title: string;
  versionNumber: number;
  textSeed: string;
  textContent: string;
  characterCount: number;
  id: string;
}

interface SceneItemProps {
  scene: Scene;
  index: number;
  moveScene: (dragIndex: number, hoverIndex: number) => void;
}

export default function Scenes() {
  const { selectedStoryVersion } = useMovieData();
  const { isUserAuthenticated } = useContext(AuthContext);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    if (!isUserAuthenticated()) {
      redirect("/");
    } else {
      setAuthChecked(true);
    }
  }, [isUserAuthenticated]);
  const query = useSearchParams();
  const movieId = query.get("id");

  const [scenesData, setScenesData] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sceneToDelete, setSceneToDelete] = useState<Scene | null>(null);

  const {
    scenesGenerating,
    setScenesGenerating,
    sceneCount,
    setSceneCount,
    hasScenes,
    setHasScenes,
    updateSceneText,
    updateScriptText,
  } = useSceneData();

  const {
    data: scenesQueryData,
    loading: scenesLoading,
    refetch: refetchScenes,
    startPolling,
    stopPolling,
  } = useListProjectScenesQuery({
    variables: { projectId: movieId },
    skip: !movieId,
    pollInterval: 0, // Poll every 5 seconds
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    updateSceneText(undefined);
    updateScriptText(undefined);
  }, []);

  const [sceneProgress, setSceneProgress] = useState(
    scenesQueryData?.listProjectScenes?.length || 0
  );

  const [generateMakeScenesMutation, {}] = useGenerateMakeScenesMutation({
    variables: {
      storyTextId: selectedStoryVersion,
      projectId: movieId,
      sceneCount: sceneCount,
    },
  });

  const [deleteSceneByKeyMutation] = useDeleteSceneByKeyMutation();

  const [reorderSceneMutation] = useReorderSceneMutation();

  const [dataLoaded, setDataLoaded] = useState(false);

  const items = scenesQueryData?.listProjectScenes?.length || 0;

  const handleGenerateScenes = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    generateMakeScenesMutation();
    setScenesGenerating(true);
  };

  const updateSceneCount = (count: number) => {
    setSceneCount(count);
  };

  const moveScene = (dragIndex: number, hoverIndex: number) => {
    const items = Array.from(scenesData?.listProjectScenes);
    const [draggedItem] = items.splice(dragIndex, 1);
    items.splice(hoverIndex, 0, draggedItem);
    setScenesData({ listProjectScenes: items });
  };

  const handleDrop = (scene: any, index: number) => {
    reorderScene(scene?.id, index + 1);
  };

  const reorderScene = async (scene: any, newSceneOrder: number) => {
    await reorderSceneMutation({
      variables: {
        textId: scene,
        projectId: movieId,
        newSceneOrder: newSceneOrder,
      },
    });
    await refetchScenes(); // Refetch scenes data
  };

  const handleDeleteScene = (scene: any) => {
    setSceneToDelete(scene);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    await deleteSceneByKeyMutation({
      variables: {
        sceneKey: sceneToDelete?.sceneKey,
        projectId: movieId,
      },
      onCompleted: async () => {
        await refetchScenes();
        const updatedScenes = scenesData?.listProjectScenes?.filter(
          (scene: any) => scene?.sceneKey !== sceneToDelete?.sceneKey
        );
        setScenesData({ listProjectScenes: updatedScenes });
        setIsDeleteDialogOpen(false);
        updatedScenes?.length === 0 &&
          (setHasScenes(false), setScenesGenerating(false));
        setSceneProgress(updatedScenes.length);
      },
    });
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  useEffect(() => {
    if (scenesQueryData) {
      setSceneProgress(scenesQueryData?.listProjectScenes?.length || 0);
    }
    if (scenesQueryData && !dataLoaded) {
      setHasScenes(
        !!scenesQueryData.listProjectScenes &&
          scenesQueryData.listProjectScenes.length > 0
      );
      setDataLoaded(true);
    }
  }, [scenesQueryData, dataLoaded]);

  useEffect(() => {
    let isPolling = false;

    if (scenesGenerating) {
      startPolling(1000);
      isPolling = true;
    } else {
      if (
        scenesQueryData?.listProjectScenes &&
        scenesQueryData?.listProjectScenes?.length > 0
      ) {
        setScenesData(scenesQueryData);
        setScenesGenerating(false);
        setHasScenes(true);
      }
    }

    const intervalId = setInterval(() => {
      if (scenesQueryData?.listProjectScenes?.length === sceneCount) {
        stopPolling();
        isPolling = false;
        setScenesData(scenesQueryData);
        if (scenesQueryData?.listProjectScenes?.length > 0) {
          setScenesGenerating(false);
          setHasScenes(true);
        }
      }
    }, 1000);

    if (!scenesGenerating) {
      clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
      if (isPolling) {
        stopPolling();
        setScenesData(scenesQueryData);
        if (
          scenesQueryData?.listProjectScenes &&
          scenesQueryData?.listProjectScenes?.length > 0
        ) {
          setScenesGenerating(false);
          setHasScenes(true);
        }
      }
    };
  }, [
    scenesGenerating,
    startPolling,
    stopPolling,
    scenesQueryData,
    setScenesData,
    setScenesGenerating,
    setHasScenes,
  ]);

  const SceneItem: React.FC<SceneItemProps> = ({ scene, index, moveScene }) => {
    const [, drop] = useDrop({
      accept: "scene",
      hover(item: { index: number }, monitor) {
        if (!drop) {
          return;
        }

        const dragIndex = item.index;
        const hoverIndex = index;

        if (dragIndex === hoverIndex) {
          return;
        }

        moveScene(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
      drop: () => handleDrop(scene, index), // Call handleDrop on drop
    });

    const [{ isDragging }, drag] = useDrag({
      type: "scene",
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const opacity = isDragging ? 0.5 : 1;
    const cursor = isDragging ? "grabbing" : "grab";

    return (
      <div
        ref={(node) => drag(drop(node))}
        key={index}
        className="bg-white  rounded-lg p-4 relative border-[1px] border-light flex flex-col justify-between mb-4"
        style={{ opacity }}
      >
        <RxDragHandleDots2
          style={{ cursor }}
          className="absolute right-3 top-3 opacity-30 hover:opacity-100 transition"
        />
        <div className="text-[12px] font-displayBold text-secondary">
          Scene {scene?.sceneOrder}
        </div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <div className="font-displayBold text-[15px]">{scene?.title}</div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[12px] text-secondary line-clamp-3 pr-6">
            {scene?.textSeed}
          </div>
        </div>
        <div className="flex justify-between text-[10px] mt-auto pt-2 items-center">
          <div>Version {scene?.versionNumber}</div>{" "}
          <button
            onClick={() => handleDeleteScene(scene)}
            className="ml-auto mr-3 hover:opacity-60 transition"
          >
            <Image
              src="/delete.svg"
              alt="Delete scene"
              height="18"
              width="18"
            />
          </button>
          <Link
            href={`/movie/scenes/scene?id=${movieId}&sceneKey=${scene?.sceneKey}`}
            className="rounded-full bg-secondary hover:bg-secondary-hover transition text-white px-3 py-1 text-[12px]"
          >
            Edit Scene
          </Link>
        </div>
      </div>
    );
  };
  if (!authChecked) {
    return <div></div>;
  }
  return (
    <>
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-screen">
          <div className="rounded-2xl bg-white border-[1px] w-full max-w-[460px] min-w-[300px] m-3 border-light  transition relative text-[14px] leading-[24px]">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <div className="px-4 pt-4 pb-0">
                <div className="text-left font-displayBold text-[18px]">
                  Delete &quot;{sceneToDelete?.title}&quot; Scene
                </div>
              </div>
              <div className="border-b-[1px] p-4 text-[14px] leading-[24px]">
                Are you sure you want to delete this scene?
              </div>
              <div className="p-4">
                <div className="flex justify-end items-center">
                  <div className="flex gap-2">
                    <button
                      className="bg-red-500 hover:bg-red-400 transition text-white py-2 px-4 text-sm rounded-full"
                      onClick={handleDeleteConfirm}
                    >
                      Delete this scene
                    </button>
                    <div
                      className="bg-secondary hover:bg-secondary-hover transition text-white py-2 px-4 text-sm rounded-full cursor-pointer"
                      onClick={handleDeleteCancel}
                    >
                      Cancel
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="col-start-1 col-span-3 pl-[64px] row-end-3 row-start-3 relative h-full bg-uiLight overflow-hidden">
        <div className="w-full max-w-[1300px] h-full pb-[61px] relative overflow-hidden">
          <div className="flex justify-between items-center bg-white px-6 py-3 border-b-[1px]">
            <h1 className="font-displayBold text-[24px]">Scenes Panel</h1>
            <div className="text-[16px] flex items-center gap-2">
              {scenesData?.listProjectScenes?.length} Scenes
              <Link href={`/movie/scenes/scene/new?id=${movieId}`}>
                <Image
                  src="/add_circle.svg"
                  width={24}
                  height={24}
                  alt="Add scenes"
                />
              </Link>
            </div>
          </div>
          <div className="scrollWrapper h-full overflow-y-auto overflow-x-hidden">
            <div className="bg-uiLight p-6 pr-4">
              {!hasScenes && scenesGenerating && (
                <div className="absolute bg-white left-0 right-0 top-[61px] bottom-0 z-10">
                  <div className="absolute bottom-0 left-0 right-0 w-full h-[500px] bg-gradient-to-t from-white to-transparent z-20"></div>
                  <ScenesScaffold />
                </div>
              )}
              {dataLoaded && !hasScenes && !scenesGenerating && (
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-white border-[1px] w-full m-3 border-light  transition relative text-[14px] leading-[24px]">
                    <div className="relative">
                      <Form onSubmit={handleGenerateScenes}>
                        <div className="px-4 pt-4 pb-0">
                          <div className="font-displayBold text-[18px]">
                            Generate Scenes Automagically
                          </div>
                        </div>
                        <div className="border-b-[1px] p-4 text-[14px] leading-[24px]">
                          <div>
                            <p>{`Ready to add depth to your story? Let's create dynamic
                    scenes! Start with generating scenes to enhance your
                    narrative. You can always refine your movie text or create
                    more scenes from the scenes panel.`}</p>
                            <p className="mt-4">
                              {`Select a number of scenes below and click
                              "Generate Scenes" to create your scenes.`}
                            </p>
                            <div className="mt-4">
                              <NumberField
                                value={sceneCount}
                                onChange={(value) => updateSceneCount(value)}
                                minValue={1}
                                maxValue={40}
                                isWheelDisabled
                                className="flex items-center justify-between w-full outline-none focus:outline-none focus:border-none"
                              >
                                <Label className="font-displayBold">
                                  Number of scenes:
                                </Label>
                                <Group className="flex justify-between border-[1px] border-light rounded-lg w-fit text-[16px]">
                                  <Button
                                    slot="decrement"
                                    className="text-secondary font-displayBold p-0 w-[40px] h-[40px] bg-light/50 hover:bg-light/100 rounded-tl-lg rounded-bl-lg"
                                  >
                                    -
                                  </Button>
                                  <Input className="w-fit text-center outline-none focus:outline-none focus:border-none" />
                                  <Button
                                    slot="increment"
                                    className="text-secondary font-displayBold p-0 w-[40px] h-[40px] bg-light/50 hover:bg-light/100 rounded-tr-lg rounded-br-lg"
                                  >
                                    +
                                  </Button>
                                </Group>
                              </NumberField>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-end items-center">
                            <div className="flex gap-2">
                              <Button
                                className="bg-secondary hover:bg-secondary-hover transition text-white py-2 px-4 text-sm rounded-full"
                                type="submit"
                              >
                                Generate Scenes
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Form>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-transparent border-[1px] w-full m-3 border-dashed border-secondary  transition relative text-[14px] leading-[24px]">
                    <div className="relative">
                      <div className="px-4 pt-4 pb-0">
                        <div className="font-displayBold text-[18px]">
                          Compose your own scene
                        </div>
                      </div>
                      <div className="p-4 pb-0 text-[14px] leading-[24px]">
                        <div>
                          <p>{`Ready to add depth to your story? Let's create dynamic
                    scenes! Start with generating scenes to enhance your
                    narrative. You can always refine your movie text or create
                    more scenes from the scenes panel.`}</p>
                        </div>
                      </div>
                      <div className="p-4 pt-0">
                        <div className="flex justify-end items-center">
                          <div className="flex gap-2">
                            <Link
                              href={`/movie/scenes/scene/new?id=${movieId}`}
                              className="bg-secondary hover:bg-secondary-hover transition text-white py-2 px-4 text-sm rounded-full"
                            >
                              Write a Scene
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {hasScenes && !scenesGenerating && (
                <>
                  <DndProvider backend={HTML5Backend}>
                    <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                      {Array.from({ length: 3 }).map((_, divIndex) => {
                        const itemsInDiv = Math.max(Math.ceil(items / 3), 1);
                        const startIndex = divIndex * itemsInDiv;
                        const endIndex = Math.min(
                          startIndex + itemsInDiv,
                          items
                        );
                        return (
                          <div key={divIndex}>
                            {Array.from({
                              length: endIndex - startIndex,
                            }).map((_, index) => (
                              <SceneItem
                                key={startIndex + index}
                                scene={
                                  scenesData?.listProjectScenes[
                                    startIndex + index
                                  ]
                                }
                                index={startIndex + index}
                                moveScene={moveScene}
                              />
                            ))}
                            <Link
                              href={`/movie/scenes/scene/new?id=${movieId}`}
                              className="bg-transparent rounded-lg py-3 px-2 relative border-dashed text-secondary/50 border-secondary/50 border-[1px] flex gap-2 justify-center mb-4 hover:border-secondary hover:text-secondary transition group"
                            >
                              <Image
                                src="/add_circle-outline.svg"
                                alt="Add a scene"
                                height="24"
                                width="24"
                                className="opacity-50 group-hover:opacity-100 transition"
                              />
                              <div className="font-displayBold text-[15px]">
                                Create a new scene
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </DndProvider>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// SceneContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useCheckForScenesQuery } from "@/graphql/__generated__/checkForScenes.generated";
import { useSearchParams } from "next/navigation";

interface SceneContextType {
  sceneKey: any | null;
  movieId: any | null;
  sceneText: any | null;
  sceneVersions: any | null;
  selectedSceneVersion: any | null;
  newSceneVersion: any | null;
  updateSceneText: (data: any) => void;
  updateSceneVersions: (data: any) => void;
  updateNewSceneVersion: (data: any) => void;
  updateSelectedSceneVersion: (data: any) => void;
  pollingSceneActive: boolean;
  pollingSceneNotesActive: boolean;
  setPollingSceneNotesActive: (active: boolean) => void;
  setPollingSceneActive: (active: boolean) => void;
  startPollingScene: () => void;
  startPollingSceneNotes: () => void;
  stopPollingScene: () => void;
  setSceneRefresh: (refresh: boolean) => void;
  refreshSceneText: () => void;
  sceneRefresh: boolean;
  scriptText: any | null;
  scriptVersions: any | null;
  selectedScriptVersion: any | null;
  newScriptVersion: any | null;
  updateScriptText: (data: any) => void;
  updateScriptVersions: (data: any) => void;
  updateNewScriptVersion: (data: any) => void;
  updateSelectedScriptVersion: (data: any) => void;
  pollingScriptActive: boolean;
  pollingScriptNotesActive: boolean;
  setPollingScriptNotesActive: (active: boolean) => void;
  setPollingScriptActive: (active: boolean) => void;
  startPollingScript: () => void;
  startPollingScriptNotes: () => void;
  stopPollingScript: () => void;
  setScriptRefresh: (refresh: boolean) => void;
  refreshScriptText: () => void;
  scriptRefresh: boolean;
  scenesGenerating: boolean;
  setScenesGenerating: (value: boolean) => void;
  sceneCount: number;
  setSceneCount: (value: number) => void;
  hasScenes: boolean;
  setHasScenes: (value: boolean) => void;
  recentlySavedScene: boolean;
  setRecentlySavedScene: (value: boolean) => void;
  recentlySavedSeed: boolean;
  setRecentlySavedSeed: (value: boolean) => void;
}

const SceneContext = createContext<SceneContextType | undefined>(undefined);

export const SceneProvider: React.FC<{
  projectId: string | null;
  children: React.ReactNode;
}> = ({ projectId: movieId, children }) => {
  const query = useSearchParams();
  const sceneKey = query.get("sceneKey");
  const [hasScenes, setHasScenes] = useState<boolean>(false);
  const [scenesGenerating, setScenesGenerating] = useState<boolean>(false);
  const [sceneCount, setSceneCount] = useState<number>(10);
  const [sceneRefresh, setSceneRefresh] = useState(false);
  const [sceneText, setSceneText] = useState<any | null>(null);
  const [sceneVersions, setSceneVersions] = useState<any | null>(null);
  const [newSceneVersion, setNewSceneVersion] = useState<any | null>(null);
  const [selectedSceneVersion, setSelectedSceneVersion] = useState<any | null>(
    null
  );
  const [pollingSceneActive, setPollingSceneActive] = useState<boolean>(false);
  const [pollingSceneNotesActive, setPollingSceneNotesActive] =
    useState<boolean>(false);

  const [recentlySavedScene, setRecentlySavedScene] = useState<boolean>(false);
  const [recentlySavedSeed, setRecentlySavedSeed] = useState<boolean>(false);

  const [scriptRefresh, setScriptRefresh] = useState(false);
  const [scriptText, setScriptText] = useState<any | null>(null);
  const [scriptVersions, setScriptVersions] = useState<any | null>(null);
  const [newScriptVersion, setNewScriptVersion] = useState<any | null>(null);
  const [selectedScriptVersion, setSelectedScriptVersion] = useState<
    any | null
  >(null);
  const [pollingScriptActive, setPollingScriptActive] =
    useState<boolean>(false);
  const [pollingScriptNotesActive, setPollingScriptNotesActive] =
    useState<boolean>(false);

  const { data: scenes } = useCheckForScenesQuery({
    variables: {
      projectId: movieId,
    },
    skip: !movieId,
  });

  useEffect(() => {
    if (scenes?.listProjectScenes) {
      setHasScenes(scenes?.listProjectScenes?.length > 0);
    }
    const scenesLength = scenes?.listProjectScenes?.length;
    if (scenesLength) {
      setSceneCount(scenesLength);
    }
  }, [scenes]);

  const refreshSceneText = () => {
    setSceneRefresh(!sceneRefresh);
  };

  const updateSceneVersions = (data: any) => {
    setSceneVersions(data);
  };

  const updateSelectedSceneVersion = (data: number) => {
    setSelectedSceneVersion(data);
  };

  const updateNewSceneVersion = (data: number) => {
    setNewSceneVersion(data);
  };

  const updateSceneText = (data: any) => {
    setSceneText(data);
  };

  const startPollingScene = () => {
    setPollingSceneActive(true);
  };

  const startPollingSceneNotes = () => {
    setPollingSceneNotesActive(true);
  };

  const stopPollingScene = () => {
    setPollingSceneActive(false);
  };

  const stopPollingSceneNotes = () => {
    setPollingSceneNotesActive(false);
  };

  const refreshScriptText = () => {
    setScriptRefresh(!scriptRefresh);
  };

  const updateScriptVersions = (data: any) => {
    setScriptVersions(data);
  };

  const updateSelectedScriptVersion = (data: number) => {
    setSelectedScriptVersion(data);
  };

  const updateNewScriptVersion = (data: number) => {
    setNewScriptVersion(data);
  };

  const updateScriptText = (data: any) => {
    setScriptText(data);
  };

  const startPollingScript = () => {
    setPollingScriptActive(true);
  };

  const startPollingScriptNotes = () => {
    setPollingScriptNotesActive(true);
  };

  const stopPollingScript = () => {
    setPollingScriptActive(false);
  };

  const stopPollingScriptNotes = () => {
    setPollingScriptNotesActive(false);
  };

  const value = {
    sceneKey,
    movieId,
    sceneText,
    sceneVersions,
    newSceneVersion,
    selectedSceneVersion,
    updateSceneText,
    updateSceneVersions,
    updateSelectedSceneVersion,
    updateNewSceneVersion,
    pollingSceneActive,
    setPollingSceneActive,
    pollingSceneNotesActive,
    setPollingSceneNotesActive,
    startPollingScene,
    stopPollingScene,
    startPollingSceneNotes,
    stopPollingSceneNotes,
    setSceneRefresh,
    sceneRefresh,
    refreshSceneText,
    scriptText,
    scriptVersions,
    newScriptVersion,
    selectedScriptVersion,
    updateScriptText,
    updateScriptVersions,
    updateSelectedScriptVersion,
    updateNewScriptVersion,
    pollingScriptActive,
    setPollingScriptActive,
    pollingScriptNotesActive,
    setPollingScriptNotesActive,
    startPollingScript,
    stopPollingScript,
    startPollingScriptNotes,
    stopPollingScriptNotes,
    setScriptRefresh,
    scriptRefresh,
    refreshScriptText,
    scenesGenerating,
    setScenesGenerating,
    sceneCount,
    setSceneCount,
    setHasScenes,
    hasScenes,
    recentlySavedScene,
    setRecentlySavedScene,
    recentlySavedSeed,
    setRecentlySavedSeed,
  };

  return (
    <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
  );
};

// Custom hook to access the scene data
export const useSceneData = () => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error("useSceneData must be used within a SceneProvider");
  }
  return context;
};

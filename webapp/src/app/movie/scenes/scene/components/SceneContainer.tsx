// Scene Container
import React, { useEffect, useRef } from "react";
import { redirect, useRouter } from "next/navigation";
import { useSceneData } from "@/context/SceneContext";
import { useGetSceneTextQuery } from "@/graphql/__generated__/getSceneText.generated";
import { useListSceneVersionsQuery } from "@/graphql/__generated__/listSceneVersions.generated";
import { useGetScriptTextQuery } from "@/graphql/__generated__/getScriptText.generated";
import { useListScriptTextVersionsQuery } from "@/graphql/__generated__/listScriptVersions.generated";
interface SceneContainerProps {
  children: React.ReactNode;
}
const SceneContainer: React.FC<SceneContainerProps> = ({ children }) => {
  const {
    sceneKey,
    movieId,
    updateSceneText,
    updateSceneVersions,
    updateSelectedSceneVersion,
    refreshSceneText,
    selectedSceneVersion,
    pollingSceneActive,
    setPollingSceneActive,
    pollingSceneNotesActive,
    setPollingSceneNotesActive,
    updateScriptText,
    updateScriptVersions,
    updateSelectedScriptVersion,
    refreshScriptText,
    selectedScriptVersion,
    pollingScriptActive,
    setPollingScriptActive,
    pollingScriptNotesActive,
    setPollingScriptNotesActive,
    newSceneVersion,
    updateNewSceneVersion,
    newScriptVersion,
    updateNewScriptVersion,
  } = useSceneData();

  const router = useRouter();
  const latestSceneTextIdRef = useRef<string | undefined>();
  const latestScriptTextIdRef = useRef<string | null>();

  useEffect(() => {
    if (!movieId) {
      redirect("/home");
    }
  }, [movieId, router]);

  const { data: sceneText, refetch: refetchScene } = useGetSceneTextQuery({
    variables: {
      textId: selectedSceneVersion,
      projectId: movieId,
      sceneKey: sceneKey,
    },
    skip: !selectedSceneVersion || !movieId || !sceneKey,
    fetchPolicy: "network-only",
  });

  const { data: scriptText, refetch: refetchScript } = useGetScriptTextQuery({
    variables: {
      textId: selectedScriptVersion,
      sceneKey: sceneKey,
      projectId: movieId,
    },
    skip: !selectedScriptVersion || !sceneKey || !movieId,
    fetchPolicy: "network-only",
  });

  const {
    data: sceneVersions,
    startPolling: startPollingScene,
    stopPolling: stopPollingScene,
    refetch: refetchSceneVersions,
  } = useListSceneVersionsQuery({
    variables: { projectId: movieId, sceneKey: sceneKey },
    skip: !movieId || !sceneKey,
    fetchPolicy: "network-only",
  });

  const {
    data: scriptVersions,
    startPolling: startPollingScript,
    stopPolling: stopPollingScript,
    refetch: refetchScriptVersions,
  } = useListScriptTextVersionsQuery({
    variables: {
      projectId: movieId,
      sceneKey: sceneKey,
      sceneTextId: selectedSceneVersion,
    },
    skip: !movieId || !sceneKey,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (sceneVersions) {
      updateSceneText(sceneText?.getSceneText);
      const latestSceneTextId =
        sceneVersions?.listSceneVersions?.slice(-1)?.[0]?.id;
      if (latestSceneTextIdRef.current) {
        if (latestSceneTextId !== latestSceneTextIdRef.current) {
          updateSelectedSceneVersion(latestSceneTextId);
          if (typeof window !== "undefined" && latestSceneTextId) {
            const localStorageKey = `${sceneKey}_selectedSceneVersion`;
            localStorage.setItem(localStorageKey, latestSceneTextId);
          }
          stopPollingScene();
          setPollingSceneActive(false);
          setPollingSceneNotesActive(false);
        }
      }
      if (latestSceneTextId) {
        latestSceneTextIdRef.current = latestSceneTextId;
      }
    }
  }, [sceneVersions]);

  useEffect(() => {
    if (scriptVersions) {
      updateScriptText(scriptText?.getScriptText);
      const latestScriptTextId =
        scriptVersions?.listScriptTextVersions?.slice(-1)?.[0]?.id;
      if (latestScriptTextIdRef.current) {
        if (latestScriptTextId !== latestScriptTextIdRef.current) {
          updateSelectedScriptVersion(latestScriptTextId);
          if (typeof window !== "undefined" && latestScriptTextId) {
            const localStorageKey = `${sceneKey}_selectedScriptVersion`;
            localStorage.setItem(localStorageKey, latestScriptTextId);
          }
          stopPollingScript();
          setPollingScriptActive(false);
          setPollingScriptNotesActive(false);
        }
      }
      if (latestScriptTextId) {
        latestScriptTextIdRef.current = latestScriptTextId;
      }
    }
  }, [scriptVersions]);

  useEffect(() => {
    if (sceneText?.getSceneText) {
      updateSceneText(sceneText?.getSceneText);
    }
  }, [sceneText]);

  useEffect(() => {
    if (scriptText?.getScriptText) {
      updateScriptText(scriptText?.getScriptText);
    }
  }, [scriptText]);

  useEffect(() => {
    if (pollingSceneActive) {
      startPollingScene(2000);
    } else {
      stopPollingScene();
    }
    return () => {
      stopPollingScene();
    };
  }, [pollingSceneActive]);

  useEffect(() => {
    if (pollingSceneNotesActive) {
      startPollingScene(2000);
    } else {
      stopPollingScene();
    }
    return () => {
      stopPollingScene();
    };
  }, [pollingSceneNotesActive]);

  useEffect(() => {
    if (pollingScriptActive) {
      startPollingScript(2000);
    } else {
      stopPollingScript();
    }
    return () => {
      stopPollingScript();
    };
  }, [pollingScriptActive]);

  useEffect(() => {
    if (pollingScriptNotesActive) {
      startPollingScript(2000);
    } else {
      stopPollingScript();
    }
    return () => {
      stopPollingScript();
    };
  }, [pollingScriptNotesActive]);

  useEffect(() => {
    if (!pollingSceneActive) {
      refetchSceneVersions({ projectId: movieId, sceneKey: sceneKey });
      if (selectedSceneVersion) {
        refetchScene({
          textId: selectedSceneVersion,
          projectId: movieId,
          sceneKey: sceneKey,
        });
      }
      refreshSceneText();
    }
  }, [pollingSceneActive]);

  useEffect(() => {
    if (!pollingSceneNotesActive && selectedSceneVersion) {
      refetchSceneVersions({ projectId: movieId, sceneKey: sceneKey });
      refetchScene({
        textId: selectedSceneVersion,
        projectId: movieId,
        sceneKey: sceneKey,
      });
      refreshSceneText();
    }
  }, [pollingSceneNotesActive]);

  useEffect(() => {
    if (!pollingScriptActive) {
      refetchScriptVersions({
        projectId: movieId,
        sceneKey: sceneKey,
        sceneTextId: selectedSceneVersion,
      });
      if (selectedScriptVersion) {
        refetchScript({
          textId: selectedScriptVersion,
          sceneKey: sceneKey,
          projectId: movieId,
        });
      }
      refreshScriptText();
    }
  }, [pollingScriptActive]);

  useEffect(() => {
    if (!pollingScriptNotesActive && selectedScriptVersion) {
      refetchScriptVersions({
        pprojectId: movieId,
        sceneKey: sceneKey,
        sceneTextId: selectedSceneVersion,
      });
      if (selectedScriptVersion) {
        refetchScript({
          textId: selectedScriptVersion,
          sceneKey: sceneKey,
          projectId: movieId,
        });
      }
      refreshScriptText();
    }
  }, [pollingScriptNotesActive]);

  useEffect(() => {
    if (sceneVersions?.listSceneVersions?.length) {
      const latestVersions = sceneVersions?.listSceneVersions;
      updateSceneVersions(latestVersions);
    }

    const localStorageKey = `${sceneKey}_selectedSceneVersion`;
    if (typeof window !== "undefined") {
      const localStorageValue = localStorage.getItem(localStorageKey);
      if (localStorageValue !== null) {
        updateSelectedSceneVersion(localStorageValue);
      } else {
        const localStorageKey = `${sceneKey}_selectedSceneVersion`;
        const latestVersions = sceneVersions?.listSceneVersions;
        const latestVersion = latestVersions?.[latestVersions.length - 1]?.id;
        if (latestVersion) {
          localStorage.setItem(localStorageKey, latestVersion);
        }
        updateSelectedSceneVersion(latestVersion);
      }
    }

    let isFetching = false;
    const fetchData = async () => {
      if (!isFetching) {
        isFetching = true;
        try {
          await refetchSceneVersions({
            projectId: movieId,
            sceneKey: sceneKey,
          });
        } catch (error) {
          console.error("Error refetching scene versions:", error);
        } finally {
          isFetching = false;
        }
      }
    };
    if (!pollingSceneActive) {
      if (newSceneVersion) {
        updateSelectedSceneVersion(newSceneVersion);
        if (typeof window !== "undefined") {
          const localStorageKey = `${sceneKey}_selectedSceneVersion`;
          localStorage.setItem(localStorageKey, newSceneVersion);
        }
        if (sceneText) {
          updateSceneText(sceneText.getSceneText);
          updateNewSceneVersion(null);
          latestSceneTextIdRef.current = undefined;
        }
      }
    }

    fetchData();
  }, [sceneText, sceneVersions, pollingSceneActive, newSceneVersion]);

  useEffect(() => {
    if (scriptVersions?.listScriptTextVersions?.length) {
      const latestVersions = scriptVersions?.listScriptTextVersions;
      updateScriptVersions(latestVersions);
    }

    const localStorageKey = `${sceneKey}_selectedScriptVersion`;
    if (typeof window !== "undefined") {
      const localStorageValue = localStorage.getItem(localStorageKey);
      if (localStorageValue !== null) {
        updateSelectedScriptVersion(localStorageValue);
      } else {
        const localStorageKey = `${sceneKey}_selectedScriptVersion`;
        const latestVersions = scriptVersions?.listScriptTextVersions;
        const latestVersion = latestVersions?.[latestVersions.length - 1]?.id;
        if (latestVersion) {
          localStorage.setItem(localStorageKey, latestVersion);
        }
        updateSelectedScriptVersion(latestVersion);
      }
    }

    let isFetching = false;
    const fetchData = async () => {
      if (!isFetching) {
        isFetching = true;
        try {
          await refetchScriptVersions({
            projectId: movieId,
            sceneKey: sceneKey,
            sceneTextId: selectedSceneVersion,
          });
        } catch (error) {
          console.error("Error refetching script versions:", error);
        } finally {
          isFetching = false;
        }
      }
    };

    if (!pollingScriptActive) {
      if (newScriptVersion) {
        updateSelectedScriptVersion(newScriptVersion);
        if (typeof window !== "undefined") {
          const localStorageKey = `${sceneKey}_selectedScriptVersion`;
          localStorage.setItem(localStorageKey, newScriptVersion);
        }
        if (scriptText) {
          updateScriptText(scriptText.getScriptText);
          updateNewScriptVersion(null);
          latestScriptTextIdRef.current = null;
        }
      }
    }

    fetchData();
  }, [
    sceneKey,
    movieId,
    scriptVersions,
    pollingScriptActive,
    newScriptVersion,
  ]);

  return <>{children}</>;
};

export default SceneContainer;

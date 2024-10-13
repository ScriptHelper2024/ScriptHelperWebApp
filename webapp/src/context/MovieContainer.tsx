import React, { useEffect, useRef } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useProjectByIdQuery } from "@/graphql/__generated__/getProjectById.generated";
import { useMovieData } from "@/context/MovieContext";
import { useGetStoryTextQuery } from "@/graphql/__generated__/getStoryText.generated";
import { useListStoryVersionsQuery } from "@/graphql/__generated__/listStoryVersions.generated";

interface MovieContainerProps {
  children: React.ReactNode;
}

const MovieContainer: React.FC<MovieContainerProps> = ({ children }) => {
  const {
    updateMovieData,
    updateStoryText,
    updateStoryVersions,
    updateSelectedStoryVersion,
    refreshMovieData,
    newStoryVersion,
    selectedStoryVersion,
    pollingActive,
    setPollingActive,
    pollingNotesActive,
    setPollingNotesActive,
    updateNewStoryVersion,
  } = useMovieData();

  const router = useRouter();
  const latestStoryTextIdRef = useRef<string | null>(null);
  const query = useSearchParams();
  const movieId = query.get("id");

  useEffect(() => {
    if (!movieId) {
      redirect("/home");
    }
  }, [movieId, router]);

  const { data, startPolling, stopPolling } = useProjectByIdQuery({
    variables: { id: movieId },
    pollInterval: 0,
    skip: !movieId,
  });

  useEffect(() => {
    if (!selectedStoryVersion) {
      updateSelectedStoryVersion(data?.projectById?.latestStoryTextId);
    }
  }, [data]);

  const { data: storyText, refetch: refetchStory } = useGetStoryTextQuery({
    variables: {
      projectId: movieId,
      textId: selectedStoryVersion,
    },
    skip: !movieId || !selectedStoryVersion,
  });

  const { data: storyVersions, refetch: refetchVersions } =
    useListStoryVersionsQuery({
      variables: { projectId: movieId },
      skip: !movieId || pollingActive, // Skip fetching during polling
    });

  useEffect(() => {
    if (storyText?.getStoryText) {
      updateStoryText(storyText.getStoryText);
    }
  }, [storyText]);

  useEffect(() => {
    if (data) {
      updateMovieData(data.projectById);
      const latestStoryTextId = data?.projectById?.latestStoryTextId;
      if (latestStoryTextIdRef.current) {
        if (latestStoryTextId !== latestStoryTextIdRef.current) {
          const latestStoryTextId = data?.projectById?.latestStoryTextId;
          updateSelectedStoryVersion(latestStoryTextId);
          if (typeof window !== "undefined" && latestStoryTextId) {
            const localStorageKey = `${movieId}_selectedStoryVersion`;
            localStorage.setItem(localStorageKey, latestStoryTextId);
          }
          stopPolling();
          setPollingActive(false);
          setPollingNotesActive(false);
        }
      }
      if (latestStoryTextId) {
        latestStoryTextIdRef.current = latestStoryTextId;
      }
    }
  }, [data]);

  useEffect(() => {
    if (pollingActive) {
      startPolling(2000);
    } else {
      stopPolling();
    }
    return () => {
      stopPolling();
    };
  }, [pollingActive]);

  useEffect(() => {
    if (pollingNotesActive) {
      startPolling(2000);
    } else {
      stopPolling();
    }
    return () => {
      stopPolling();
    };
  }, [pollingNotesActive]);

  useEffect(() => {
    if (!pollingActive) {
      refetchVersions({ projectId: movieId });
      refetchStory({ projectId: movieId, textId: selectedStoryVersion });
      refreshMovieData();
    }
  }, [pollingActive]);

  useEffect(() => {
    if (!pollingNotesActive) {
      refetchVersions({ projectId: movieId });
      refetchStory({ projectId: movieId, textId: selectedStoryVersion });
      refreshMovieData();
    }
  }, [pollingNotesActive]);

  useEffect(() => {
    if (storyVersions?.listStoryVersions?.length) {
      const latestVersions = storyVersions?.listStoryVersions;
      updateStoryVersions(latestVersions);
    }

    const localStorageKey = `${movieId}_selectedStoryVersion`;
    if (typeof window !== "undefined") {
      const localStorageValue = localStorage.getItem(localStorageKey);
      if (localStorageValue !== null) {
        updateSelectedStoryVersion(localStorageValue);
      } else {
        const localStorageKey = `${movieId}_selectedStoryVersion`;
        const latestVersion = data?.projectById?.latestStoryTextId;
        if (latestVersion) {
          localStorage.setItem(localStorageKey, latestVersion);
        }
        updateSelectedStoryVersion(latestVersion);
      }
    }

    let isFetching = false;
    const fetchData = async () => {
      if (!isFetching) {
        isFetching = true;
        try {
          await refetchVersions({ projectId: movieId });
        } catch (error) {
          console.error("Error refetching story versions:", error);
        } finally {
          isFetching = false;
        }
      }
    };

    if (!pollingActive) {
      if (newStoryVersion) {
        updateSelectedStoryVersion(newStoryVersion);
        if (typeof window !== "undefined") {
          const localStorageKey = `${movieId}_selectedStoryVersion`;
          localStorage.setItem(localStorageKey, newStoryVersion);
        }
        if (storyText) {
          updateStoryText(storyText.getStoryText);
          updateNewStoryVersion(null);
          latestStoryTextIdRef.current = null;
        }
      }
    }

    fetchData();
  }, [movieId, storyVersions, pollingActive, newStoryVersion]);

  return <>{children}</>;
};

export default MovieContainer;

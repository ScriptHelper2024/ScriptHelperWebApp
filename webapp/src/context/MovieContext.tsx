// MovieContext.tsx
import React, { createContext, useContext, useState } from "react";

interface MovieContextType {
  movieData: any | null;
  storyText: any | null;
  storyVersions: any | null;
  selectedStoryVersion: any | null;
  newStoryVersion: any | null;
  updateMovieData: (data: any) => void;
  updateStoryText: (data: any) => void;
  updateStoryVersions: (data: any) => void;
  updateNewStoryVersion: (data: any) => void;
  updateSelectedStoryVersion: (data: any) => void;
  pollingActive: boolean;
  pollingNotesActive: boolean;
  setPollingNotesActive: (active: boolean) => void;
  setPollingActive: (active: boolean) => void;
  startPolling: () => void;
  startPollingNotes: () => void;
  stopPolling: () => void;
  setMovieRefresh: (refresh: boolean) => void;
  refreshMovieData: () => void;
  movieRefresh: boolean;
  recentlySavedSeed: boolean;
  setRecentlySavedSeed: (value: boolean) => void;
  characters: any;
  setCharacters: (value: any) => void;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export const MovieProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [movieRefresh, setMovieRefresh] = useState(false);
  const [movieData, setMovieData] = useState<any | null>(null);
  const [storyText, setStoryText] = useState<any | null>(null);
  const [storyVersions, setStoryVersions] = useState<any | null>(null);
  const [newStoryVersion, setNewStoryVersion] = useState<any | null>(null);
  const [selectedStoryVersion, setSelectedStoryVersion] = useState<any | null>(
    null
  );
  const [characters, setCharacters] = useState<any | null>(null);
  const [pollingActive, setPollingActive] = useState<boolean>(false);
  const [pollingNotesActive, setPollingNotesActive] = useState<boolean>(false);

  const [recentlySavedSeed, setRecentlySavedSeed] = useState<boolean>(false);

  const updateMovieData = (data: any) => {
    setMovieData(data);
  };

  const refreshMovieData = () => {
    setMovieRefresh(!movieRefresh);
  };

  const updateStoryVersions = (data: any) => {
    setStoryVersions(data);
  };

  const updateSelectedStoryVersion = (data: number) => {
    setSelectedStoryVersion(data);
  };

  const updateNewStoryVersion = (data: number) => {
    setNewStoryVersion(data);
  };

  const updateStoryText = (data: any) => {
    setStoryText(data);
  };

  const startPolling = () => {
    setPollingActive(true);
  };

  const startPollingNotes = () => {
    setPollingNotesActive(true);
  };

  const stopPolling = () => {
    setPollingActive(false);
  };

  const stopPollingNotes = () => {
    setPollingNotesActive(false);
  };

  const value = {
    movieData,
    storyText,
    storyVersions,
    newStoryVersion,
    selectedStoryVersion,
    updateMovieData,
    updateStoryText,
    updateStoryVersions,
    updateSelectedStoryVersion,
    updateNewStoryVersion,
    pollingActive,
    setPollingActive,
    pollingNotesActive,
    setPollingNotesActive,
    startPolling,
    stopPolling,
    startPollingNotes,
    stopPollingNotes,
    setMovieRefresh,
    movieRefresh,
    refreshMovieData,
    recentlySavedSeed,
    setRecentlySavedSeed,
    characters,
    setCharacters,
  };

  return (
    <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
  );
};

// Custom hook to access the movie data
export const useMovieData = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error("useMovieData must be used within a MovieProvider");
  }
  return context;
};

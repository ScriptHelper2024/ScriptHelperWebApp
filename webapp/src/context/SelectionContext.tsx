import { set } from "date-fns";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface SelectionContextProps {
  selectTextEnd: number | null;
  selectTextStart: number | null;
  selectSceneStart: number | null;
  selectSceneEnd: number | null;
  selectScriptStart: number | null;
  selectScriptEnd: number | null;
  setSelection: (
    start: number | null,
    end: number | null,
    selectionType: string | null
  ) => void;
  resetSelection: (selectionType: string | null) => void;
  selectedTextMode?: boolean;
  selectedSceneMode?: boolean;
  selectedScriptMode?: boolean;
  setSelectedTextMode: (selectedTextMode: boolean) => void;
  setSelectedScriptMode: (selectedScriptMode: boolean) => void;
  setSelectedSceneMode: (selectedSceneMode: boolean) => void;
  removeAllSpans: () => void;
  removeSceneSpans: () => void;
  removeScriptSpans: () => void;
  notesForSelectedSceneText: boolean;
  setNotesForSelectedSceneText: (value: boolean) => void;
  notesForSelectedScriptText: boolean;
  setNotesForSelectedScriptText: (value: boolean) => void;
}

const SelectionContext = createContext<SelectionContextProps>({
  selectTextEnd: null,
  selectTextStart: null,
  selectSceneStart: null,
  selectSceneEnd: null,
  selectScriptStart: null,
  selectScriptEnd: null,
  setSelection: () => {},
  resetSelection: () => {},
  selectedTextMode: false,
  selectedSceneMode: false,
  selectedScriptMode: false,
  setSelectedTextMode: () => {},
  setSelectedSceneMode: () => {},
  setSelectedScriptMode: () => {},
  removeAllSpans: () => {},
  removeSceneSpans: () => {},
  removeScriptSpans: () => {},
  notesForSelectedSceneText: false,
  setNotesForSelectedSceneText: () => {},
  notesForSelectedScriptText: false,
  setNotesForSelectedScriptText: () => {},
});

export const useSelection = () => useContext(SelectionContext);

interface SelectionProviderProps {
  children: ReactNode;
}

export const SelectionProvider: React.FC<SelectionProviderProps> = ({
  children,
}) => {
  const [selectTextStart, setSelectTextStart] = useState<number | null>(null);
  const [selectSceneStart, setSelectSceneStart] = useState<number | null>(null);
  const [selectScriptStart, setSelectScriptStart] = useState<number | null>(
    null
  );
  const [selectSceneEnd, setSelectSceneEnd] = useState<number | null>(null);
  const [selectScriptEnd, setSelectScriptEnd] = useState<number | null>(null);
  const [selectTextEnd, setSelectTextEnd] = useState<number | null>(null);
  const [selectedTextMode, setSelectedTextMode] = useState<boolean>(false);
  const [selectedSceneMode, setSelectedSceneMode] = useState<boolean>(false);
  const [selectedScriptMode, setSelectedScriptMode] = useState<boolean>(false);

  const [notesForSelectedSceneText, setNotesForSelectedSceneText] =
    useState<boolean>(false);
  const [notesForSelectedScriptText, setNotesForSelectedScriptText] =
    useState<boolean>(false);

  const setSelection = (
    start: number | null,
    end: number | null,
    selectionType: string | null
  ) => {
    if (start === undefined || end === undefined) {
      throw new Error("start and end values must not be undefined.");
    }
    if (selectionType === "movieText") {
      setSelectTextStart(start);
      setSelectTextEnd(end);
    } else if (selectionType === "sceneText") {
      setSelectSceneStart(start);
      setSelectSceneEnd(end);
    } else if (selectionType === "scriptText") {
      setSelectScriptStart(start);
      setSelectScriptEnd(end);
    }
  };

  const removeAllSpans = () => {
    const movieTextElement = document.getElementById("movieText");

    if (movieTextElement) {
      const spans = movieTextElement.getElementsByTagName("span");
      for (let i = spans.length - 1; i >= 0; i--) {
        const span = spans[i];
        while (span.firstChild) {
          span.parentNode?.insertBefore(span.firstChild, span);
        }
        span.parentNode?.removeChild(span);
      }
    }
  };

  const removeSceneSpans = () => {
    const sceneTextElement = document.getElementById("sceneText");

    if (sceneTextElement) {
      const spans = sceneTextElement.getElementsByTagName("span");
      for (let i = spans.length - 1; i >= 0; i--) {
        const span = spans[i];
        while (span.firstChild) {
          span.parentNode?.insertBefore(span.firstChild, span);
        }
        span.parentNode?.removeChild(span);
      }
    }
  };

  const removeScriptSpans = () => {
    const scriptText = document.getElementById("scriptText");

    if (scriptText) {
      const spans = scriptText.getElementsByTagName("span");
      for (let i = spans.length - 1; i >= 0; i--) {
        const span = spans[i];
        while (span.firstChild) {
          span.parentNode?.insertBefore(span.firstChild, span);
        }
        span.parentNode?.removeChild(span);
      }
    }
  };

  const resetSelection = (selectionType: string | null) => {
    removeAllSpans();
    const selection = window.getSelection();
    selection?.removeAllRanges();
    setSelectTextStart(null); // Reset to null
    setSelectTextEnd(null); // Reset to null
    if (selectionType === "sceneText") {
      setSelectSceneStart(null); // Reset to null
      setSelectSceneEnd(null); // Reset to null
    }
    if (selectionType === "scriptText") {
      setSelectScriptStart(null); // Reset to null
      setSelectScriptEnd(null); // Reset to null
    }
    setSelection(null, null, selectionType);
  };

  return (
    <SelectionContext.Provider
      value={{
        selectTextEnd,
        selectTextStart,
        selectSceneStart,
        selectSceneEnd,
        selectScriptStart,
        selectScriptEnd,
        setSelection,
        resetSelection,
        selectedTextMode,
        selectedSceneMode,
        selectedScriptMode,
        setSelectedTextMode,
        setSelectedScriptMode,
        setSelectedSceneMode,
        removeAllSpans,
        removeSceneSpans,
        removeScriptSpans,
        notesForSelectedSceneText,
        setNotesForSelectedSceneText,
        notesForSelectedScriptText,
        setNotesForSelectedScriptText,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};

"use client";
import { FC, FormEvent, useRef, useEffect, useState, useCallback } from "react";
import {
  MdArrowBack,
  MdClose,
  MdNotes,
  MdOutlineEditNote,
  MdOutlineFormatShapes,
} from "react-icons/md";
import {
  TextField,
  Button,
  Form,
  TextArea,
  Switch,
  Dialog,
  DialogTrigger,
  OverlayArrow,
  Popover,
  FieldError,
} from "react-aria-components";
import Select from "react-select";
import { useGenerateSceneWithNotesMutation } from "@/graphql/__generated__/createSceneFromNotes.generated";
import { useGenerateScriptTextWithNotesMutation } from "@/graphql/__generated__/createScriptFromNotes.generated";
import { useGenerateMagicNotesMutation } from "@/graphql/__generated__/generateMagicNotes.generated";
import { useListMagicNoteCriticsByTypeQuery } from "@/graphql/__generated__/listMagicNoteCritics.generated";
import { useSelection } from "@/context/SelectionContext";
import { useSceneData } from "@/context/SceneContext";
import AINotesScaffold from "../../../movie/components/AI-Notes-Scaffold";

interface CreateSceneNoteFormProps {
  selectSceneStart?: number;
  selectSceneEnd?: number;
  selectScriptStart?: number;
  selectScriptEnd?: number;
  setSelectionIs: (selectionIs: string) => void;
  isSwitchChecked: boolean;
  setIsSwitchChecked: (isSwitchChecked: boolean) => void;
  sceneHeader: React.RefObject<HTMLDivElement>;
}

const CreateSceneNoteForm: FC<CreateSceneNoteFormProps> = ({
  setSelectionIs,
  isSwitchChecked,
  setIsSwitchChecked,
  sceneHeader,
}) => {
  const {
    movieId,
    sceneText,
    scriptText,
    sceneKey,
    startPollingScene,
    startPollingScript,
    startPollingSceneNotes,
    startPollingScriptNotes,
    updateNewSceneVersion,
    sceneVersions,
    scriptVersions,
    pollingSceneActive,
    pollingScriptActive,
    pollingSceneNotesActive,
    pollingScriptNotesActive,
    selectedSceneVersion,
    selectedScriptVersion,
  } = useSceneData();

  const {
    selectSceneEnd: contextSelectSceneEnd,
    selectSceneStart: contextSelectSceneStart,
    selectScriptEnd: contextSelectScriptEnd,
    selectScriptStart: contextSelectScriptStart,
    resetSelection,
    removeSceneSpans,
    removeScriptSpans,
    setSelectedScriptMode,
    setSelectedSceneMode,
    removeAllSpans,
    notesForSelectedSceneText,
    setNotesForSelectedSceneText,
    notesForSelectedScriptText,
    setNotesForSelectedScriptText,
  } = useSelection();

  const { data: magicNotesSceneCriticsData } =
    useListMagicNoteCriticsByTypeQuery({
      variables: { documentType: "SceneText" },
    });

  const { data: magicNotesScriptCriticsData } =
    useListMagicNoteCriticsByTypeQuery({
      variables: { documentType: "ScriptText" },
    });

  const [recentSceneMagicNotes, setRecentSceneMagicNotes] = useState(false);
  const [recentScriptMagicNotes, setRecentScriptMagicNotes] = useState(false);

  const [noteDialogSceneText, setNoteDialogSceneText] = useState<String>();
  const [noteDialogScriptText, setNoteDialogScriptText] = useState<String>();
  const [sceneTextIsHighlighted, setSceneTextIsHighlighted] = useState(false);
  const [scriptTextIsHighlighted, setScriptTextIsHighlighted] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesForSceneText, setNotesForSceneText] = useState<boolean>(false);
  const [notesForScriptText, setNotesForScriptText] = useState<boolean>(false);
  const [notesForWholeSceneText, setNotesForWholeSceneText] =
    useState<boolean>(false);

  const [notesForWholeScriptText, setNotesForWholeScriptText] =
    useState<boolean>(false);

  const [showNotesForm, setShowNotesForm] = useState<boolean>(false);

  const [selectedSceneValues, setSelectedSceneValues] = useState<string[]>([]);
  const [selectedScriptValues, setSelectedScriptValues] = useState<string[]>(
    []
  );

  const noteButtonAreaRef = useRef<HTMLDivElement>(null);

  const [sceneHeaderHeight, setSceneHeaderHeight] = useState(0);

  const sceneNoteAreaRef = useRef<HTMLTextAreaElement>(null);
  const scriptNoteAreaRef = useRef<HTMLTextAreaElement>(null);
  const sceneNoteWrapperRef = useRef<HTMLDivElement>(null);
  const scriptNoteWrapperRef = useRef<HTMLDivElement>(null);

  const sceneCritics =
    magicNotesSceneCriticsData?.listMagicNoteCriticsByType ?? [];
  const scriptCritics =
    magicNotesScriptCriticsData?.listMagicNoteCriticsByType ?? [];

  const resetNotes = () => {
    removeAllSpans();
    setShowNotesForm(false);
    setNotesForWholeSceneText(false);
    setNotesForSelectedSceneText(false);
    setSelectedSceneMode(false);
    setNotesForWholeScriptText(false);
    setNotesForSelectedScriptText(false);
    setSelectedScriptMode(false);
    setNotesForSceneText(false);
    setNotesForScriptText(false);
    resetSelection("sceneText");
    resetSelection("scriptText");
  };

  const [createSceneFromNote, {}] = useGenerateSceneWithNotesMutation();
  const [createScriptFromNotes, {}] = useGenerateScriptTextWithNotesMutation();
  const [generateSceneMagicNotes] = useGenerateMagicNotesMutation();
  const [generateScriptMagicNotes] = useGenerateMagicNotesMutation();

  const [sceneNoteText, setSceneNoteText] = useState<String>(
    sceneText?.textNotes ? sceneText?.textNotes : ""
  );

  const [scriptNoteText, setScriptNoteText] = useState<String>(
    scriptText?.textNotes ? scriptText?.textNotes : ""
  );

  const [sceneTextContent, setSceneTextContent] = useState<string>();
  const [scriptTextContent, setScriptTextContent] = useState<string>();
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

  const sceneCriticOptions = sceneCritics.map((critic: any) => ({
    value: critic.id,
    label: critic.name,
  }));

  const scriptCriticOptions = scriptCritics.map((critic: any) => ({
    value: critic.id,
    label: critic.name,
  }));

  useEffect(() => {
    window.getSelection()?.removeAllRanges();
    removeHighlightScene();
    removeHighlightScript();
    resetSelection("sceneText");
    resetSelection("scriptText");
  }, []);

  useEffect(() => {
    sceneText?.textNotes && setSceneNoteText(sceneText?.textNotes);
  }, [sceneText?.textNotes]);

  useEffect(() => {
    scriptText?.textNotes && setScriptNoteText(scriptText?.textNotes);
  }, [scriptText?.textNotes]);

  useEffect(() => {
    if (sceneTextIsHighlighted) {
      setSelectionIs("Scene");
    } else if (scriptTextIsHighlighted) {
      setSelectionIs("Script");
    } else {
      setSelectionIs("");
    }
  }, [sceneTextIsHighlighted, scriptTextIsHighlighted, setSelectionIs]);

  useEffect(() => {
    if (contextSelectSceneEnd !== null || contextSelectSceneStart !== null) {
      setSceneTextIsHighlighted(true);
      setNotesForSelectedSceneText(true);
      setSelectedSceneMode(true);
      setScriptTextIsHighlighted(false);
      setNotesForSelectedScriptText(false);
      setSelectedScriptMode(false);
      resetSelection("scriptText");
      removeHighlightScript();
    } else {
      // setNotesForSelectedSceneText(false);
      setSelectedSceneMode(false);
      setShowNotesForm(false);
      removeHighlightScene();
    }

    if (contextSelectScriptEnd !== null || contextSelectScriptStart !== null) {
      setScriptTextIsHighlighted(true);
      setNotesForSelectedScriptText(true);
      setSelectedScriptMode(true);
      setSceneTextIsHighlighted(false);
      setNotesForSelectedSceneText(false);
      setSelectedSceneMode(false);
      resetSelection("sceneText");
      removeHighlightScene();
    } else {
      // setNotesForSelectedScriptText(false);
      setSelectedScriptMode(false);
      setShowNotesForm(false);
      removeHighlightScript();
    }
  }, [
    contextSelectSceneEnd,
    contextSelectSceneStart,
    contextSelectScriptEnd,
    contextSelectScriptStart,
  ]);

  useEffect(() => {
    if (sceneText?.versionType === "magic-note") {
      setRecentSceneMagicNotes(true);
    } else {
      setRecentSceneMagicNotes(false);
    }
  }, [sceneVersions, sceneText]);

  useEffect(() => {
    if (scriptText?.versionType === "magic-note") {
      setRecentScriptMagicNotes(true);
    } else {
      setRecentScriptMagicNotes(false);
    }
  }, [scriptVersions, scriptText]);

  const handleSwitchChange = () => {
    setIsSwitchChecked(!isSwitchChecked);
  };

  const handleSelectedSceneCritics = (selected: any) => {
    setSelectedSceneValues(selected.map((item: any) => item.value));
  };

  const handleSelectedScriptCritics = (selected: any) => {
    setSelectedScriptValues(selected.map((item: any) => item.value));
  };

  const handleGenerateSceneMagicNotes = async () => {
    handleCloseNotesDialog();
    const variables = {
      projectId: movieId,
      criticIds: selectedSceneValues,
      documentId: selectedSceneVersion,
      documentType: "SceneText",
    };
    await generateSceneMagicNotes({
      variables,
      onCompleted: (data) => {
        startPollingSceneNotes();
        setRecentSceneMagicNotes(true);
        resetSelection("sceneText");
        setNotesForSelectedSceneText(false);
        setSelectedSceneMode(false);
      },
    });
  };

  const handleGenerateScriptMagicNotes = async () => {
    handleCloseNotesDialog();
    const variables = {
      projectId: movieId,
      criticIds: selectedScriptValues,
      documentId: selectedScriptVersion,
      documentType: "ScriptText",
    };
    await generateScriptMagicNotes({
      variables,
      onCompleted: (data) => {
        startPollingScriptNotes();
        setRecentScriptMagicNotes(true);
        resetSelection("scriptText");
        setNotesForSelectedScriptText(false);
        setSelectedScriptMode(false);
      },
    });
  };

  const handleGenerateSceneFromNotes = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    handleCloseNotesDialog();

    const formData = new FormData(e.currentTarget);
    const textNote = formData.get("textNote") as string;

    const variables = {
      projectId: movieId,
      textId: selectedSceneVersion,
      textNotes: textNote,
      selectTextEnd: contextSelectSceneEnd,
      selectTextStart: contextSelectSceneStart,
    };

    if (contextSelectSceneEnd !== undefined) {
      variables.selectTextEnd = contextSelectSceneEnd;
    }

    if (contextSelectSceneStart !== undefined) {
      variables.selectTextStart = contextSelectSceneStart;
    }

    const { data } = await createSceneFromNote({
      variables,
      onCompleted: (data) => {
        startPollingScene();
        resetSelection("movieText");
        setNotesForSelectedSceneText(false);
        setSelectedSceneMode(false);
      },
    });
  };

  const handleGenerateSceneFromNotesDialog = async () => {
    handleCloseNotesDialog();

    const variables = {
      projectId: movieId,
      textId: selectedSceneVersion,
      textNotes: noteDialogSceneText,
      selectTextEnd: contextSelectSceneEnd,
      selectTextStart: contextSelectSceneStart,
    };

    if (contextSelectSceneEnd !== undefined) {
      variables.selectTextEnd = contextSelectSceneEnd;
    }

    if (contextSelectSceneStart !== undefined) {
      variables.selectTextStart = contextSelectSceneStart;
    }

    const { data } = await createSceneFromNote({
      variables,
      onCompleted: (data) => {
        startPollingScene();
        resetSelection("movieText");
        setNotesForSelectedSceneText(false);
        setSelectedSceneMode(false);
      },
    });
  };

  const handleGenerateScriptFromNotes = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    handleCloseNotesDialog();
    const formData = new FormData(e.currentTarget);
    const textNote = formData.get("textNote") as string;

    const variables = {
      projectId: movieId,
      textId: selectedScriptVersion,
      textNotes: textNote,
      sceneKey: sceneKey,
      selectTextEnd: contextSelectScriptEnd,
      selectTextStart: contextSelectScriptStart,
    };

    if (contextSelectScriptEnd !== undefined) {
      variables.selectTextEnd = contextSelectScriptEnd;
    }

    if (contextSelectScriptStart !== undefined) {
      variables.selectTextStart = contextSelectScriptStart;
    }

    const { data } = await createScriptFromNotes({
      variables,
      onCompleted: (data) => {
        startPollingScript();
        resetSelection("movieText");
        setNotesForSelectedScriptText(false);
        setSelectedScriptMode(false);
      },
    });
  };

  const handleGenerateScriptFromNotesDialog = async () => {
    handleCloseNotesDialog();

    const variables = {
      projectId: movieId,
      textId: selectedScriptVersion,
      textNotes: noteDialogScriptText,
      sceneKey: sceneKey,
      selectTextEnd: contextSelectScriptEnd,
      selectTextStart: contextSelectScriptStart,
    };

    if (contextSelectScriptEnd !== undefined) {
      variables.selectTextEnd = contextSelectScriptEnd;
    }

    if (contextSelectScriptStart !== undefined) {
      variables.selectTextStart = contextSelectScriptStart;
    }

    const { data } = await createScriptFromNotes({
      variables,
      onCompleted: (data) => {
        startPollingScript();
        resetSelection("movieText");
        setNotesForSelectedScriptText(false);
        setSelectedScriptMode(false);
      },
    });
  };

  const removeHighlightScene = () => {
    if (removeSceneSpans) {
      removeSceneSpans();
    }
    setSceneTextIsHighlighted(false);
  };

  const removeHighlightScript = () => {
    if (removeScriptSpans) {
      removeScriptSpans();
    }
    setScriptTextIsHighlighted(false);
  };

  const handleNotesDialog = () => {
    setNotesDialogOpen(true);
  };

  const confirmSceneSelection = () => {
    setNotesDialogOpen(true);
    setShowNotesForm(true);
    setNotesForSelectedSceneText(true);
    setSelectedSceneMode(true);
    setNotesForSelectedScriptText(false);
    setSelectedScriptMode(false);
  };

  const confirmScriptSelection = () => {
    setNotesDialogOpen(true);
    setShowNotesForm(true);
    setNotesForSelectedScriptText(true);
    setSelectedScriptMode(true);
    setNotesForSelectedSceneText(false);
    setSelectedSceneMode(false);
  };

  const handleCloseNotesDialog = useCallback(() => {
    resetSelection("sceneText");
    resetSelection("scriptText");
    resetNotes();
    setNoteDialogSceneText("");
    setNoteDialogScriptText("");
    setIsSwitchChecked(false);
    if (removeSceneSpans) {
      removeSceneSpans();
    }
    if (removeScriptSpans) {
      removeScriptSpans();
    }
    setNotesDialogOpen(false);
  }, [resetSelection, removeSceneSpans, removeScriptSpans]);

  const handleCloseNotesDialogForSelection = useCallback(() => {
    resetSelection("sceneText");
    resetSelection("scriptText");
    setIsSwitchChecked(false);
    if (removeSceneSpans) {
      removeSceneSpans();
    }
    if (removeScriptSpans) {
      removeScriptSpans();
    }
    setNotesDialogOpen(false);
  }, [resetSelection, removeSceneSpans, removeScriptSpans]);

  const handleWholeSceneTextButton = () => {
    setNotesForWholeSceneText(true);
    setNotesForSelectedSceneText(false);
    setSelectedSceneMode(false);
    setShowNotesForm(true);
  };

  const handleWholeScriptTextButton = () => {
    setNotesForWholeScriptText(true);
    setNotesForSelectedScriptText(false);
    setSelectedScriptMode(false);
    setShowNotesForm(true);
  };

  const handleSelectedSceneTextButton = () => {
    setNotesForSelectedSceneText(true);
    setSelectedSceneMode(true);
    setShowNotesForm(true);
    setNotesForWholeSceneText(false);
    handleCloseNotesDialogForSelection();
  };

  const handleSelectedScriptTextButton = () => {
    setNotesForSelectedScriptText(true);
    setSelectedScriptMode(true);
    setNotesForWholeScriptText(false);
    setShowNotesForm(true);
    handleCloseNotesDialogForSelection();
  };

  useEffect(() => {
    const resizeTextarea = () => {
      const sceneTextRef = sceneNoteAreaRef.current;
      const scriptTextRef = scriptNoteAreaRef.current;
      const sceneTextWrapperRef = sceneNoteWrapperRef.current;
      const scriptTextWrapperRef = scriptNoteWrapperRef.current;
      if (sceneTextRef && sceneTextWrapperRef) {
        sceneTextRef.style.height = "auto";
        sceneTextWrapperRef.style.height = "auto";
        sceneTextRef.style.height = `${sceneTextRef.scrollHeight}px`;
        sceneTextWrapperRef.style.height = `${
          sceneTextWrapperRef.scrollHeight + 2
        }px`;
      }
      if (scriptTextRef && scriptTextWrapperRef) {
        scriptTextRef.style.height = "auto";
        scriptTextWrapperRef.style.height = "auto";
        scriptTextRef.style.height = `${scriptTextRef.scrollHeight}px`;
        scriptTextWrapperRef.style.height = `${
          scriptTextWrapperRef.scrollHeight + 2
        }px`;
      }
      const noteArea = document.getElementById("textNoteSidebar");
      if (noteArea) {
        noteArea.style.height = "auto";
        noteArea.style.height = `${noteArea.scrollHeight}px`;
      }
    };
    resizeTextarea();
    const sceneTextRef = sceneNoteAreaRef.current;
    const scriptTextRef = scriptNoteAreaRef.current;
    if (sceneTextRef) {
      sceneTextRef.addEventListener("input", resizeTextarea);
      return () => {
        sceneTextRef.removeEventListener("input", resizeTextarea);
      };
    }
    if (scriptTextRef) {
      scriptTextRef.addEventListener("input", resizeTextarea);
      return () => {
        scriptTextRef.removeEventListener("input", resizeTextarea);
      };
    }
  }, [
    handleWholeSceneTextButton,
    handleWholeScriptTextButton,
    handleSelectedSceneTextButton,
    handleSelectedScriptTextButton,
    confirmSceneSelection,
    confirmScriptSelection,
    scriptNoteText,
    sceneNoteText,
  ]);

  useEffect(() => {
    if (isSwitchChecked && notesDialogOpen) {
      const resizeTextarea = () => {
        const currentRef = sceneNoteAreaRef.current;
        const wrapperRef = sceneNoteWrapperRef.current;
        if (currentRef && wrapperRef) {
          currentRef.style.height = "auto";
          currentRef.style.height = `${currentRef.scrollHeight}px`;
          wrapperRef.style.height = "auto";
          wrapperRef.style.height = `${wrapperRef.scrollHeight + 10}px`;
        }
      };
      resizeTextarea();
      const currentRef = sceneNoteAreaRef.current;
      if (currentRef) {
        currentRef.addEventListener("input", resizeTextarea);
        return () => {
          currentRef.removeEventListener("input", resizeTextarea);
        };
      }
    }
  }, [
    sceneNoteText,
    noteDialogSceneText,
    recentSceneMagicNotes,
    recentScriptMagicNotes,
    confirmSceneSelection,
    confirmScriptSelection,
  ]);

  useEffect(() => {
    if (isSwitchChecked && notesDialogOpen) {
      const resizeTextarea = () => {
        const currentRef = scriptNoteAreaRef.current;
        const wrapperRef = scriptNoteWrapperRef.current;
        if (currentRef && wrapperRef) {
          currentRef.style.height = "auto";
          currentRef.style.height = `${currentRef.scrollHeight}px`;
          wrapperRef.style.height = "auto";
          wrapperRef.style.height = `${wrapperRef.scrollHeight + 10}px`;
        }
      };
      resizeTextarea();
      const currentRef = scriptNoteAreaRef.current;
      if (currentRef) {
        currentRef.addEventListener("input", resizeTextarea);
        return () => {
          currentRef.removeEventListener("input", resizeTextarea);
        };
      }
    }
  }, [
    scriptNoteText,
    noteDialogScriptText,
    isSwitchChecked,
    recentSceneMagicNotes,
    recentScriptMagicNotes,
    confirmSceneSelection,
    confirmScriptSelection,
  ]);

  const handleSceneTextButton = () => {
    setNotesForSceneText(true);
    setNotesForScriptText(false);
  };

  const handleScriptTextButton = () => {
    setNotesForScriptText(true);
    setNotesForSceneText(false);
  };

  useEffect(() => {
    // Function to update div height
    const updateDivHeight = () => {
      const headerHeight = sceneHeader.current
        ? (sceneHeader.current as HTMLElement).offsetHeight
        : 0;
      const buttonAreaHeight = noteButtonAreaRef.current
        ? (noteButtonAreaRef.current as HTMLElement).offsetHeight
        : 0;
      const summedHeight = headerHeight + buttonAreaHeight;
      setSceneHeaderHeight(summedHeight + 16);
    };

    // Initial height calculation
    updateDivHeight();

    // Watch for height changes in sceneHeaderRef
    const headerObserver = new ResizeObserver(updateDivHeight);
    if (sceneHeader.current) {
      headerObserver.observe(sceneHeader.current);
    }

    // Watch for height changes in noteButtonAreaRef
    const buttonAreaObserver = new ResizeObserver(updateDivHeight);
    if (noteButtonAreaRef.current) {
      buttonAreaObserver.observe(noteButtonAreaRef.current);
    }

    // Cleanup function
    return () => {
      headerObserver.disconnect();
      buttonAreaObserver.disconnect();
    };
  }, [
    sceneHeader,
    noteButtonAreaRef,
    setSelectedSceneMode,
    setSelectedScriptMode,
    handleSelectedSceneTextButton,
  ]);

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
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "#f0f0f0",
      borderRadius: "50px",
      padding: "0px 4px",
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
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "4px",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      backgroundColor: "transparent",
      borderRadius: "50px",
      padding: "0px 4px",
      "&:hover": {
        backgroundColor: "transparent",
      },
    }),
  };

  return (
    <>
      <div id="noteButtonArea" ref={noteButtonAreaRef}>
        {sceneTextIsHighlighted || scriptTextIsHighlighted ? (
          <div className="relative pb-8">
            <div className="font-displayBold pb-3 text-[12px]">
              Improve Selected Notes
            </div>
            <button
              className="w-full bg-secondary text-white hover:bg-secondary-hover transition rounded-lg flex align-center justify-center gap-2 py-3 text-[14px] font-displayBold"
              onClick={
                sceneTextIsHighlighted
                  ? confirmSceneSelection
                  : confirmScriptSelection
              }
            >
              <MdNotes size={18} />
              {`Confirm your ${
                sceneTextIsHighlighted ? "scene" : "script"
              } selection`}
            </button>
            <button
              className="w-full mt-[15px] text-secondary hover:text-secondary-hover text-[14px] font-displayBold"
              onClick={resetNotes}
            >
              Cancel selection
            </button>
          </div>
        ) : notesForSelectedSceneText || notesForSelectedScriptText ? (
          <div className="relative pb-8">
            <div className="font-displayBold pb-3 text-[12px]">
              Improve Selected Notes
            </div>
            <div className="w-full border-secondary border-dashed border-[1px] rounded-lg flex align-center justify-center gap-2 py-3 text-[14px] font-displayBold">
              <MdOutlineFormatShapes size={18} />
              {notesForSelectedSceneText
                ? `Select some Scene text`
                : `Select some Script text`}
            </div>
            <button
              className="w-full mt-[15px] text-secondary hover:text-secondary-hover text-[14px] font-displayBold"
              onClick={resetNotes}
            >
              Cancel selection
            </button>
          </div>
        ) : pollingSceneActive ||
          pollingScriptActive ||
          pollingSceneNotesActive ||
          pollingScriptNotesActive ? (
          <div className="relative pb-8">
            <DialogTrigger>
              <div className="font-displayBold pb-3 text-[12px]">
                Notes Generator
              </div>
              <Button className="w-full border-secondary hover:border-secondary-hover text-secondary hover:text-secondary-hover transition border-dashed border-[1px] rounded-lg flex align-center justify-center gap-2 py-3 text-[14px] font-displayBold">
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
                  <div className="bg-secondary text-white py-2 px-3 rounded-lg text-[12px]">
                    <div className="font-displayBold">Please wait...</div>
                    {`Improve text with notes once the text is finished generating.`}
                  </div>
                </Dialog>
              </Popover>
            </DialogTrigger>
          </div>
        ) : (
          <div className="relative pb-8">
            <div className="font-displayBold pb-3 text-[12px]">
              Notes Generator
            </div>
            <button
              className={`w-full border-secondary hover:border-secondary-hover text-secondary hover:text-secondary-hover transition border-dashed border-[1px] rounded-lg flex align-center justify-center gap-2 py-3 text-[14px] font-displayBold`}
              onClick={handleNotesDialog}
            >
              <MdOutlineEditNote size={22} />
              Improve Text
            </button>
          </div>
        )}
      </div>
      {(pollingSceneNotesActive || pollingScriptNotesActive) && (
        <div className="relative h-full">
          <div className="absolute bg-uiLight left-0 right-0 h-[500px] z-10">
            <div className="absolute top-0 left-0 right-0 w-full h-[500px] bg-gradient-to-t from-[#F3FAFA] to-transparent z-20"></div>
            <AINotesScaffold />
          </div>
        </div>
      )}
      {!pollingSceneNotesActive && !pollingScriptNotesActive && (
        <Form
          onSubmit={handleGenerateSceneFromNotes}
          style={{ maxHeight: `100%` }}
          className={`relative overflow-y-auto overflow-x-hidden rounded-lg bg-white border-[1px] text-[14px] leading-[24px] border-secondary border-dashed opacity-0 transition-all duration-500 pointer-events-none scrollWrapper 
        ${
          recentSceneMagicNotes && !pollingSceneNotesActive
            ? " opacity-100 pointer-events-auto h-full "
            : ""
        }
        `}
        >
          <div
            className={`sticky pl-4 pr-1 top-0 right-0 flex items-center justify-end`}
          >
            <div className="flex gap-3 pt-[14px]">
              <Button
                className={`bg-secondary transition text-offwhite hover:bg-secondary-hover outline-none rounded-full py-[2px] px-4 w-max flex gap-1 items-center text-[12px] mr-0 ${
                  pollingSceneActive ? " cursor-default" : ""
                }`}
                type="submit"
                isDisabled={pollingSceneActive}
              >
                {pollingSceneActive ? "Applying notes..." : "Apply to Scene"}
              </Button>
            </div>
          </div>
          <TextField name="textNote" aria-label="Text Note" isRequired>
            <div className="px-4 -mt-[25px]">
              <div className={`font-displayBold text-[12px]`}>
                Scene Notes Suggestions
              </div>
            </div>
            <TextArea
              id="textNoteSidebar"
              className="editable-note w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 p-4"
              placeholder="Add your notes for the scene here..."
              ref={sceneNoteAreaRef}
              value={sceneNoteText?.toString()}
              onChange={(e) => setSceneNoteText(e.target.value)}
            />
            {!sceneNoteText && (
              <FieldError className="p-2 my-4 rounded-md bg-yellow-50 text-sm text-yellow-700 text-center sticky left-4 bottom-4">
                Empty notes can not be applied.
              </FieldError>
            )}
          </TextField>
        </Form>
      )}
      <Form
        style={{ maxHeight: `100%` }}
        onSubmit={handleGenerateScriptFromNotes}
        className={`relative overflow-y-auto overflow-x-hidden rounded-lg bg-white border-[1px] text-[14px] leading-[24px] border-secondary border-dashed opacity-0 h-0 transition-all duration-500 pointer-events-none scrollWrapper 
        ${
          recentScriptMagicNotes && !pollingScriptNotesActive
            ? " opacity-100 pointer-events-auto h-full "
            : ""
        }
        `}
      >
        <div
          className={`sticky pl-4 pr-1 top-0 right-0 flex items-center justify-end`}
        >
          <div className="flex gap-3 pt-[14px]">
            <Button
              className={`bg-secondary transition text-offwhite hover:bg-secondary-hover outline-none rounded-full py-[2px] px-4 w-max flex gap-1 items-center text-[12px] mr-0 ${
                pollingScriptActive ? " cursor-default" : ""
              }`}
              type="submit"
              isDisabled={pollingScriptActive}
            >
              {pollingScriptActive ? "Applying notes..." : "Apply to Script"}
            </Button>
          </div>
        </div>
        <TextField name="textNote" aria-label="Text Note" isRequired>
          <div className="px-4 -mt-[25px]">
            <div className={`font-displayBold text-[12px]`}>
              Script Note Suggestions
            </div>
          </div>
          <TextArea
            id="textNoteSidebar"
            className="editable-note w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 p-4"
            placeholder="Add your notes for the script here..."
            ref={scriptNoteAreaRef}
            value={scriptNoteText?.toString()}
            onChange={(e) => setScriptNoteText(e.target.value)}
          />
          {!scriptNoteText && (
            <FieldError className="p-2 my-4 rounded-md bg-yellow-50 text-sm text-yellow-700 text-center sticky left-4 bottom-4">
              Empty notes can not be applied.
            </FieldError>
          )}
        </TextField>
      </Form>
      {notesDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-screen">
          {showNotesForm && (
            <>
              {notesForWholeSceneText || notesForSelectedSceneText ? (
                <div
                  ref={sceneNoteWrapperRef}
                  className={`rounded-2xl bg-white border-[1px] w-full max-w-[600px] min-w-[300px] m-3 border-light  transition relative text-[14px] leading-[24px] max-h-[calc(100vh/2)] flex flex-col h-full 
                  ${!isSwitchChecked && "!h-auto"}
                  `}
                >
                  <div
                    className="relative h-full flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="border-b-[1px] px-4 py-3">
                      <div className="text-center font-displayBold text-[18px]">
                        {notesForWholeSceneText
                          ? "Notes for Scene"
                          : "Notes for selected Scene text"}
                      </div>
                      <div
                        className="absolute top-4 right-4 cursor-pointer text-[18px]"
                        onClick={handleCloseNotesDialog}
                      >
                        <MdClose />
                      </div>
                    </div>
                    {notesForSelectedSceneText ? (
                      <div className="m-4 p-3 border-[1px] border-light rounded-lg relative h-full scrollWrapper">
                        <TextField
                          name="textNote"
                          aria-label="Text Note"
                          isRequired
                        >
                          <TextArea
                            id="textNoteManual"
                            className="editable-note h-fit w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 max-h-full"
                            placeholder="Add your notes for the Scene Text here..."
                            ref={sceneNoteAreaRef}
                            value={noteDialogSceneText?.toString()}
                            onChange={(e) =>
                              setNoteDialogSceneText(e.target.value)
                            }
                          />
                          {!noteDialogSceneText && (
                            <FieldError className="p-2 my-4 rounded-md bg-yellow-50 text-sm text-yellow-700 text-center sticky left-0 bottom-0">
                              Empty notes can not be applied.
                            </FieldError>
                          )}
                        </TextField>
                      </div>
                    ) : (
                      <>
                        {isSwitchChecked ? (
                          <div className="m-4 p-3 border-[1px] border-light rounded-lg relative h-full scrollWrapper">
                            <TextField
                              name="textNote"
                              aria-label="Text Note"
                              isRequired
                            >
                              <TextArea
                                id="textNoteManual"
                                className="editable-note h-fit w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 max-h-full"
                                placeholder="Add your notes for the Scene Text here..."
                                ref={sceneNoteAreaRef}
                                value={noteDialogSceneText?.toString()}
                                onChange={(e) =>
                                  setNoteDialogSceneText(e.target.value)
                                }
                              />
                              {!noteDialogSceneText && (
                                <FieldError className="p-2 my-4 rounded-md bg-yellow-50 text-sm text-yellow-700 text-center sticky left-0 bottom-0">
                                  Empty notes can not be applied.
                                </FieldError>
                              )}
                            </TextField>
                          </div>
                        ) : (
                          <div className="border-b-[1px] p-4 mb-3">
                            <div className="flex justify-between items-center">
                              <div className="font-displayBold text-[12px] w-[120px] whitespace-nowrap">
                                AI Note Presets
                              </div>
                              <Select
                                isMulti
                                name="critics"
                                options={sceneCriticOptions}
                                className={`w-full ml-2 `}
                                styles={customStyles}
                                onChange={handleSelectedSceneCritics}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div className="p-4 flex justify-between gap-3 pt-0">
                      {!notesForSelectedSceneText && (
                        <Switch
                          onChange={handleSwitchChange}
                          isSelected={isSwitchChecked}
                          aria-label="Switch between AI and Manual Note"
                        >
                          <span
                            className={`text-[12px] ${
                              !isSwitchChecked ? "opacity-100" : "opacity-50"
                            }`}
                          >
                            AI Notes
                          </span>
                          <div className="indicator" />
                          <span
                            className={`text-[12px] ${
                              isSwitchChecked ? "opacity-100" : "opacity-50"
                            }`}
                          >
                            Manual Note
                          </span>
                        </Switch>
                      )}
                      <div className="flex gap-3">
                        <Button
                          className="bg-primary transition text-offwhite hover:bg-primary-hover  outline-none rounded-full py-2 px-4 w-max items-center text-sm"
                          onPress={handleCloseNotesDialog}
                        >
                          Cancel
                        </Button>
                        {isSwitchChecked || notesForSelectedSceneText ? (
                          <Button
                            className="bg-secondary transition text-offwhite hover:bg-secondary-hover  outline-none rounded-full py-2 px-4 w-max items-center text-sm"
                            onPress={handleGenerateSceneFromNotesDialog}
                          >
                            Apply Notes
                          </Button>
                        ) : (
                          <Button
                            className="bg-secondary transition text-offwhite hover:bg-secondary-hover  outline-none rounded-full py-2 px-4 flex gap-1 items-center text-sm text-center whitespace-nowrap"
                            onPress={handleGenerateSceneMagicNotes}
                          >
                            Generate AI Notes
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              {notesForWholeScriptText || notesForSelectedScriptText ? (
                <div
                  ref={scriptNoteWrapperRef}
                  className={`rounded-2xl bg-white border-[1px] w-full max-w-[600px] min-w-[300px] m-3 border-light  transition relative text-[14px] leading-[24px] max-h-[calc(100vh/2)] flex flex-col h-full 
                  ${!isSwitchChecked && "!h-auto"}
                  `}
                >
                  <div
                    className="relative h-full flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="border-b-[1px] px-4 py-3">
                      <div className="text-center font-displayBold text-[18px]">
                        {notesForWholeScriptText
                          ? "Notes for Script"
                          : "Notes for selected Script text"}
                      </div>
                      <div
                        className="absolute top-4 right-4 cursor-pointer text-[18px]"
                        onClick={handleCloseNotesDialog}
                      >
                        <MdClose />
                      </div>
                    </div>
                    {notesForSelectedScriptText ? (
                      <div className="m-4 p-3 border-[1px] border-light rounded-lg relative h-full scrollWrapper">
                        <TextField
                          name="textNote"
                          aria-label="Text Note"
                          isRequired
                        >
                          <TextArea
                            id="textNoteManual"
                            className="editable-note h-fit w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 max-h-full"
                            placeholder="Add your notes for the Script Text here..."
                            ref={scriptNoteAreaRef}
                            value={noteDialogScriptText?.toString()}
                            onChange={(e) =>
                              setNoteDialogScriptText(e.target.value)
                            }
                          />
                          {!noteDialogScriptText && (
                            <FieldError className="p-2 my-4 rounded-md bg-yellow-50 text-sm text-yellow-700 text-center sticky left-0 bottom-0">
                              Empty notes can not be applied.
                            </FieldError>
                          )}
                        </TextField>
                      </div>
                    ) : (
                      <div className="border-b-[1px] p-4 mb-3">
                        <div className="flex justify-between items-center">
                          <div className="font-displayBold text-[12px] w-[120px] whitespace-nowrap">
                            AI Note Presets
                          </div>
                          <Select
                            isMulti
                            name="critics"
                            options={scriptCriticOptions}
                            className={`w-full ml-2 `}
                            styles={customStyles}
                            onChange={handleSelectedScriptCritics}
                          />
                        </div>
                      </div>
                    )}
                    <div className="p-4 flex justify-between gap-3 pt-0">
                      {!notesForSelectedScriptText && (
                        <Switch
                          onChange={handleSwitchChange}
                          isSelected={isSwitchChecked}
                          aria-label="Switch between AI and Manual Note"
                        >
                          <span
                            className={`text-[12px] ${
                              !isSwitchChecked ? "opacity-100" : "opacity-50"
                            }`}
                          >
                            AI Notes
                          </span>
                          <div className="indicator" />
                          <span
                            className={`text-[12px] ${
                              isSwitchChecked ? "opacity-100" : "opacity-50"
                            }`}
                          >
                            Manual Note
                          </span>
                        </Switch>
                      )}
                      <div className="flex gap-3">
                        <Button
                          className="bg-primary transition text-offwhite hover:bg-primary-hover  outline-none rounded-full py-2 px-4 w-max items-center text-sm"
                          onPress={handleCloseNotesDialog}
                        >
                          Cancel
                        </Button>
                        {isSwitchChecked || notesForSelectedScriptText ? (
                          <Button
                            className="bg-secondary transition text-offwhite hover:bg-secondary-hover  outline-none rounded-full py-2 px-4 w-max items-center text-sm"
                            onPress={handleGenerateScriptFromNotesDialog}
                          >
                            Apply Notes
                          </Button>
                        ) : (
                          <Button
                            className="bg-secondary transition text-offwhite hover:bg-secondary-hover  outline-none rounded-full py-2 px-4 flex gap-1 items-center text-sm text-center whitespace-nowrap"
                            onPress={handleGenerateScriptMagicNotes}
                          >
                            Generate AI Notes
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
          {!showNotesForm && (
            <>
              {notesForSceneText ? (
                <div className="rounded-2xl bg-white border-[1px] w-full max-w-[460px] min-w-[300px] m-3 border-light  transition relative text-[14px] leading-[24px]">
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="border-b-[1px] px-4 py-3 relative">
                      <Button
                        className="absolute top-3 left-3"
                        onPress={() => setNotesForSceneText(false)}
                      >
                        <MdArrowBack size={24} />
                      </Button>
                      <div className="text-center font-displayBold text-[18px]">
                        Add some notes to the Scene Text
                      </div>
                      <div
                        className="absolute top-4 right-4 cursor-pointer text-[18px]"
                        onClick={handleCloseNotesDialog}
                      >
                        <MdClose />
                      </div>
                    </div>
                    <div className="border-b-[1px] p-4 text-[14px] leading-[24px]">
                      Choose whether you would like to apply notes to the whole
                      scene or a selected portion.
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="font-displayBold text-[12px] w-[150px]">
                          I want the note to affect:
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="bg-secondary text-white hover:bg-secondary-hover transition py-2 px-3 text-sm rounded-full"
                            onClick={handleWholeSceneTextButton}
                          >
                            Whole Scene
                          </button>
                          <a
                            className="bg-primary text-white hover:bg-primary-hover transition py-2 px-3 text-sm rounded-full"
                            onClick={handleSelectedSceneTextButton}
                            href="#sceneTextArea"
                          >
                            Selected Scene Text
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : notesForScriptText ? (
                <div className="rounded-2xl bg-white border-[1px] w-full max-w-[460px] min-w-[300px] m-3 border-light  transition relative text-[14px] leading-[24px]">
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="border-b-[1px] px-4 py-3 relative">
                      <Button
                        className="absolute top-3 left-3"
                        onPress={() => setNotesForScriptText(false)}
                      >
                        <MdArrowBack size={24} />
                      </Button>
                      <div className="text-center font-displayBold text-[18px]">
                        Add some notes to the Script
                      </div>
                      <div
                        className="absolute top-4 right-4 cursor-pointer text-[18px]"
                        onClick={handleCloseNotesDialog}
                      >
                        <MdClose />
                      </div>
                    </div>
                    <div className="border-b-[1px] p-4 text-[14px] leading-[24px]">
                      Choose whether you would like to apply notes to the whole
                      script or a selected portion.
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="font-displayBold text-[12px] w-[150px]">
                          I want the note to affect:
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="bg-secondary text-white hover:bg-secondary-hover transition py-2 px-3 text-sm rounded-full"
                            onClick={handleWholeScriptTextButton}
                          >
                            Whole Script
                          </button>
                          <a
                            className="bg-primary text-white hover:bg-primary-hover transition py-2 px-3 text-sm rounded-full"
                            onClick={handleSelectedScriptTextButton}
                            href="#scriptTextArea"
                          >
                            Selected Script Text
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-white border-[1px] w-full max-w-[460px] min-w-[300px] m-3 border-light  transition relative text-[14px] leading-[24px]">
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="border-b-[1px] px-4 py-3">
                      <div className="text-center font-displayBold text-[18px]">
                        Add notes to the Scene{" "}
                        {scriptTextContent && "or Script"}
                      </div>
                      <div
                        className="absolute top-4 right-4 cursor-pointer text-[18px]"
                        onClick={handleCloseNotesDialog}
                      >
                        <MdClose />
                      </div>
                    </div>
                    <div className="border-b-[1px] p-4 text-[14px] leading-[24px]">
                      Use Notes to refine sections or log thoughts. This tool
                      ensures every idea is captured and every edit mirrors your
                      voice.
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="font-displayBold text-[12px] w-[150px]">
                          I want the note to affect
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="bg-secondary text-white hover:bg-secondary-hover transition py-2 px-4 text-sm rounded-full"
                            onClick={handleSceneTextButton}
                          >
                            Scene Text
                          </button>
                          {scriptTextContent && (
                            <button
                              className="bg-secondary text-white hover:bg-secondary-hover transition py-2 px-4 text-sm rounded-full"
                              onClick={handleScriptTextButton}
                            >
                              Script Text
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default CreateSceneNoteForm;

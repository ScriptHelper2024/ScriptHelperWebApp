"use client";
import { FC, FormEvent, useRef, useEffect, useState, useCallback } from "react";
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
import { useGenerateMagicNotesMutation } from "@/graphql/__generated__/generateMagicNotes.generated";
import { useGenerateStoryWithNotesMutation } from "@/graphql/__generated__/createStoryFromNotes.generated";
import { useListMagicNoteCriticsByTypeQuery } from "@/graphql/__generated__/listMagicNoteCritics.generated";
import { useSelection } from "@/context/SelectionContext";
import {
  MdClose,
  MdNotes,
  MdOutlineEditNote,
  MdOutlineFormatShapes,
} from "react-icons/md";
import { useMovieData } from "@/context/MovieContext";

interface CreateNoteFormProps {
  isSwitchChecked: boolean;
  setIsSwitchChecked: (isSwitchChecked: boolean) => void;
}

const CreateNoteForm: FC<CreateNoteFormProps> = ({
  isSwitchChecked,
  setIsSwitchChecked,
}) => {
  const {
    storyText,
    storyVersions,
    startPollingNotes,
    startPolling,
    pollingActive,
    pollingNotesActive,
    movieData,
    updateNewStoryVersion,
  } = useMovieData();
  const {
    selectTextEnd,
    selectTextStart,
    resetSelection,
    setSelectedTextMode,
    removeAllSpans,
  } = useSelection();

  const { data: magicNotesCriticsData } = useListMagicNoteCriticsByTypeQuery({
    variables: { documentType: "StoryText" },
  });

  const [recentMagicNotes, setRecentMagicNotes] = useState(false);
  const [noteDialogText, setNoteDialogText] = useState<String>();
  const [textIsHighlighted, setTextIsHighlighted] = useState(false); // State to track highlighting
  const [notesForWholeText, setNotesForWholeText] = useState<boolean>(false);
  const [notesForSelectedText, setNotesForSelectedText] =
    useState<boolean>(false);

  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const [notesApplied, setNotesApplied] = useState(false);

  const noteAreaRef = useRef<HTMLTextAreaElement>(null);
  const noteDialogAreaRef = useRef<HTMLTextAreaElement>(null);
  const noteDialogWrapperRef = useRef<HTMLFormElement>(null);

  const critics = magicNotesCriticsData?.listMagicNoteCriticsByType ?? [];

  const resetNotes = () => {
    setNotesForWholeText(false);
    setNotesForSelectedText(false);
    setSelectedTextMode(false);
    window.getSelection()?.removeAllRanges();
    removeHighlight();
    resetSelection("movieText");
  };

  const [createStoryFromNote] = useGenerateStoryWithNotesMutation();

  const [generateMagicNotes] = useGenerateMagicNotesMutation();

  const [noteText, setNoteText] = useState<String>(
    storyText?.textNotes ? storyText?.textNotes : ""
  );

  const storyVersionsData = storyVersions?.listStoryVersions ?? [];

  const criticOptions = critics.map((critic: any) => ({
    value: critic.id,
    label: critic.name,
  }));

  useEffect(() => {
    window.getSelection()?.removeAllRanges();
    removeHighlight();
    resetSelection("movieText");
  }, []);

  useEffect(() => {
    storyText?.textNotes && setNoteText(storyText?.textNotes);
  }, [storyText?.textNotes]);

  useEffect(() => {
    if (selectTextEnd !== null || selectTextStart !== null) {
      setTextIsHighlighted(true);
      setNotesForSelectedText(true);
      setSelectedTextMode(true);
    } else {
      setTextIsHighlighted(false);
      setNotesForSelectedText(false);
      setSelectedTextMode(false);
    }
  }, [selectTextStart, selectTextEnd]);

  useEffect(() => {
    if (storyText?.versionType === "magic-note") {
      setRecentMagicNotes(true);
    } else {
      setRecentMagicNotes(false);
    }
  }, [storyVersionsData, storyText]);

  useEffect(() => {
    if (isSwitchChecked && notesDialogOpen) {
      const resizeTextarea = () => {
        const currentRef = noteDialogAreaRef.current;
        const wrapperRef = noteDialogWrapperRef.current;
        if (currentRef && wrapperRef) {
          currentRef.style.height = "auto";
          currentRef.style.height = `${currentRef.scrollHeight}px`;
          wrapperRef.style.height = "auto";
          wrapperRef.style.height = `${wrapperRef.scrollHeight + 10}px`;
        }
      };
      resizeTextarea();
      const currentRef = noteDialogAreaRef.current;
      if (currentRef) {
        currentRef.addEventListener("input", resizeTextarea);
        return () => {
          currentRef.removeEventListener("input", resizeTextarea);
        };
      }
    }
  }, [noteDialogText, isSwitchChecked]);

  const handleSwitchChange = () => {
    setIsSwitchChecked(!isSwitchChecked);
  };

  const handleSelectedCritics = (selected: any) => {
    setSelectedValues(selected.map((item: any) => item.value));
  };

  const handleGenerateMagicNotes = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleCloseNotesDialog();
    const variables = {
      projectId: movieData?.id,
      criticIds: selectedValues,
      documentId: storyText?.id,
      documentType: "StoryText",
    };
    await generateMagicNotes({
      variables,
      onCompleted: (data) => {
        startPollingNotes();
        setRecentMagicNotes(true);
        resetSelection("movieText");
        setNotesForSelectedText(false);
        setSelectedTextMode(false);
      },
    });
  };

  const handleGenerateStoryFromNotes = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setNotesApplied(true);
    setRecentMagicNotes(false);
    handleCloseNotesDialog();

    const formData = new FormData(e.currentTarget);
    const textNote = formData.get("textNote") as string;

    const variables = {
      projectId: movieData?.id,
      textId: storyText?.id,
      textNotes: textNote,
      selectTextEnd: selectTextEnd,
      selectTextStart: selectTextStart,
    };

    if (selectTextEnd !== undefined) {
      variables.selectTextEnd = selectTextEnd;
    }

    if (selectTextStart !== undefined) {
      variables.selectTextStart = selectTextStart;
    }

    createStoryFromNote({
      variables,
      onCompleted: () => {
        startPolling();
        setNotesForSelectedText(false);
        setSelectedTextMode(false);
        setNotesForWholeText(false);
        resetSelection("movieText");
        handleCloseNotesDialog();
      },
    });
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

  const handleNotesDialog = useCallback(
    (type: string) => {
      setNotesDialogOpen(true);
      if (type === "selected") {
        setIsSwitchChecked(true);
      }
    },
    [setNotesDialogOpen, setIsSwitchChecked]
  );

  useEffect(() => {
    const resizeTextarea = () => {
      const currentRef = noteAreaRef.current;
      if (currentRef) {
        currentRef.style.height = "auto";
        currentRef.style.height = `${currentRef.scrollHeight}px`;
      }
    };
    resizeTextarea();
    const currentRef = noteAreaRef.current;
    if (currentRef) {
      currentRef.addEventListener("input", resizeTextarea);
      return () => {
        currentRef.removeEventListener("input", resizeTextarea);
      };
    }
  }, [handleNotesDialog, noteText]);

  const handleCloseNotesDialog = useCallback(() => {
    removeAllSpans();
    resetSelection("movieText");
    setIsSwitchChecked(false);
    setNotesDialogOpen(false);
    setNotesForWholeText(false);
    setNotesForSelectedText(false);
    setSelectedTextMode(false);
    setNoteDialogText("");
  }, [resetSelection, removeAllSpans, setIsSwitchChecked]);

  const handleWholeTextButton = () => {
    setNotesForWholeText(true);
    setNotesForSelectedText(false);
    setSelectedTextMode(false);
  };

  const handleSelectedTextButton = () => {
    handleCloseNotesDialog();
    setNotesForSelectedText(true);
    setSelectedTextMode(true);
    setNotesForWholeText(false);
    const element = document.getElementById("movieTextArea");
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
      {textIsHighlighted ? (
        <div className="relative">
          <div className="font-displayBold pb-3 text-[12px]">
            Improve Selected Notes
          </div>
          <button
            className="w-full bg-secondary text-white hover:bg-secondary-hover transition rounded-lg flex align-center justify-center gap-2 py-3 text-[14px] font-displayBold"
            onClick={() => handleNotesDialog("selected")}
          >
            <MdNotes size={18} />
            Confirm your selection
          </button>
          <button
            className="w-full mt-[15px] text-secondary hover:text-secondary-hover text-[14px] font-displayBold"
            onClick={resetNotes}
          >
            Cancel selection
          </button>
        </div>
      ) : !textIsHighlighted && notesForSelectedText ? (
        <div className="relative">
          <div className="font-displayBold pb-3 text-[12px]">
            Improve Selected Notes
          </div>
          <div className="w-full border-secondary border-dashed border-[1px] rounded-lg flex align-center justify-center gap-2 py-3 text-[14px] font-displayBold">
            <MdOutlineFormatShapes size={18} className="mt-[1px]" />
            Select some Movie Text
          </div>
          <button
            className="w-full mt-[15px] text-secondary hover:text-secondary-hover text-[14px] font-displayBold"
            onClick={resetNotes}
          >
            Cancel selection
          </button>
        </div>
      ) : pollingNotesActive ? (
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
                <div className="font-displayBold">
                  Movie Text is Generating...
                </div>
                {`Improve text with Notes once the text is finished generating.`}
              </div>
            </Dialog>
          </Popover>
        </DialogTrigger>
      ) : (
        <>
          <div className="font-displayBold pb-3 text-[12px]">
            Notes Generator
          </div>
          <button
            className={`w-full border-secondary hover:border-secondary-hover text-secondary hover:text-secondary-hover transition border-dashed border-[1px] rounded-lg flex align-center justify-center gap-2 py-3 text-[14px] font-displayBold`}
            onClick={() => handleNotesDialog("whole")}
          >
            <MdOutlineEditNote size={22} />
            Improve Text
          </button>
        </>
      )}
      <Form
        onSubmit={handleGenerateStoryFromNotes}
        className={`flex-grow mt-8 relative overflow-y-auto overflow-x-hidden rounded-lg bg-white border-[1px] min-h-[117px] text-[14px] leading-[24px] max-h-[calc(100vh-280px)] border-secondary border-dashed opacity-0 transition-all duration-500  pointer-events-none scrollWrapper 
        ${recentMagicNotes ? " opacity-100 pointer-events-auto h-full " : ""}
        `}
      >
        <div
          className={`sticky pl-4 ${
            noteText ? "pr-1" : "pr-4"
          } top-0 right-0 flex items-center justify-end`}
        >
          <div className="flex gap-3 pt-[14px]">
            <Button
              className={`bg-secondary transition text-offwhite hover:bg-secondary-hover outline-none rounded-full py-[2px] px-4 w-max flex gap-1 items-center text-[12px] mr-2 ${
                pollingActive ? " cursor-default " : ""
              }`}
              type="submit"
              isDisabled={pollingActive}
            >
              {pollingActive ? "Applying Notes..." : "Apply to Movie Text"}
            </Button>
          </div>
        </div>
        <TextField name="textNote" aria-label="Text Note" isRequired>
          <div className="px-4 -mt-[25px]">
            <div className={`font-displayBold text-[12px]`}>
              Note Suggestions
            </div>
          </div>
          <TextArea
            id="textNoteSidebar"
            className="editable-note w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 p-4"
            placeholder="Add your notes for the movie here..."
            ref={noteAreaRef}
            value={noteText?.toString()}
            onChange={(e) => setNoteText(e.target.value)}
          />
          {!noteText && (
            <FieldError className="p-2 my-4 rounded-md bg-yellow-50 text-sm text-yellow-700 text-center sticky left-4 bottom-4">
              Empty notes can not be applied.
            </FieldError>
          )}
        </TextField>
      </Form>
      {notesDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 h-screen">
          {notesForWholeText || notesForSelectedText ? (
            <Form
              ref={noteDialogWrapperRef}
              onSubmit={
                isSwitchChecked
                  ? handleGenerateStoryFromNotes
                  : handleGenerateMagicNotes
              }
              className={`rounded-2xl bg-white border-[1px] w-full max-w-[600px] min-w-[300px] m-3 border-light  transition relative text-[14px] leading-[24px] max-h-[calc(100vh/2)] flex flex-col
              ${!isSwitchChecked && "!h-auto"}
              `}
            >
              <div
                className="relative h-full flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="border-b-[1px] px-4 py-3">
                  <div className="text-center font-displayBold text-[18px]">
                    {notesForWholeText ? "Notes" : "Notes for selected text"}
                  </div>
                  <div
                    className="absolute top-4 right-4 cursor-pointer text-[18px]"
                    onClick={handleCloseNotesDialog}
                  >
                    <MdClose />
                  </div>
                </div>

                {isSwitchChecked ? (
                  <div className="m-4 p-3 border-[1px] border-light rounded-lg relative h-full scrollWrapper overflow-x-hidden overflow-y-auto">
                    <TextField
                      name="textNote"
                      aria-label="Text Note"
                      isRequired
                    >
                      <TextArea
                        id="textNoteManualWhole"
                        className="empty-note h-fit w-full resize-none border-0 bg-transparent outline outline-0 transition-all focus:border-0 focus:outline-0 disabled:resize-none disabled:border-0 max-h-full overflow-hidden"
                        placeholder="Add your notes for the Movie Text here..."
                        ref={noteDialogAreaRef}
                        value={noteDialogText?.toString()}
                        onChange={(e) => setNoteDialogText(e.target.value)}
                      />
                      {!noteDialogText && (
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
                        options={criticOptions}
                        className={`w-full ml-2 `}
                        styles={customStyles}
                        onChange={handleSelectedCritics}
                      />
                    </div>
                  </div>
                )}
                <div className="px-4 pb-3 w-full flex justify-between">
                  {!notesForSelectedText && (
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
                  <div className="flex justify-end gap-3 flex-1">
                    <Button
                      className="bg-primary transition text-offwhite hover:bg-primary-hover  outline-none rounded-full py-2 px-4 w-max items-center text-sm"
                      onPress={handleCloseNotesDialog}
                    >
                      Cancel
                    </Button>
                    {isSwitchChecked ? (
                      <Button
                        className="bg-secondary transition text-offwhite hover:bg-secondary-hover  outline-none rounded-full py-2 px-4 w-max items-center text-sm"
                        type="submit"
                      >
                        Apply Notes
                      </Button>
                    ) : (
                      <Button
                        className="bg-secondary transition text-offwhite hover:bg-secondary-hover  outline-none rounded-full py-2 px-4 flex gap-1 items-center text-sm text-center whitespace-nowrap"
                        type="submit"
                      >
                        Generate AI Notes
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Form>
          ) : (
            <div className="rounded-2xl bg-white border-[1px] border-light w-full max-w-[460px] min-w-[300px] m-3 transition relative text-[14px] leading-[24px]">
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <div className="border-b-[1px] px-4 py-3">
                  <div className="text-center font-displayBold text-[18px]">
                    Add some notes
                  </div>
                  <div
                    className="absolute top-4 right-4 cursor-pointer text-[18px]"
                    onClick={handleCloseNotesDialog}
                  >
                    <MdClose />
                  </div>
                </div>
                <div className="border-b-[1px] p-4 text-[14px] leading-[24px]">
                  Use Notes to refine sections or log thoughts. Opt for AI
                  rewrites for fresh suggestions or manual edits for precise
                  control. This tool ensures every idea is captured and every
                  edit mirrors your voice.
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="font-displayBold text-[12px] w-[150px]">
                      I want the note to affect:
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="bg-secondary text-white hover:bg-secondary-hover transition py-2 px-4 text-sm rounded-full"
                        onClick={handleWholeTextButton}
                      >
                        The Whole Text
                      </button>
                      <button
                        className="bg-primary text-white hover:bg-primary-hover transition py-2 px-4 text-sm rounded-full"
                        onClick={handleSelectedTextButton}
                      >
                        My Selected Text
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CreateNoteForm;

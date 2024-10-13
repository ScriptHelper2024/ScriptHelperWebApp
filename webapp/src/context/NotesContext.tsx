import React, { createContext, useContext, useState } from "react";

interface NotesContextProps {
  notesGenerating: boolean;
  setNotesGenerating: (value: boolean) => void;
}

const NotesContext = createContext<NotesContextProps | undefined>(undefined);

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error(
      "useNotesContext must be used within a NotesContextProvider"
    );
  }
  return context;
};

export const NotesContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notesGenerating, setNotesGenerating] = useState<boolean>(false);

  return (
    <NotesContext.Provider
      value={{
        notesGenerating,
        setNotesGenerating,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

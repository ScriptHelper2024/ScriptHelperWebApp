import React, { createContext, useState } from "react";

interface SceneVersionContextProps {
  sceneVersion: number;
  setSceneVersion: React.Dispatch<React.SetStateAction<number>>;
  scriptVersion: number;
  setScriptVersion: React.Dispatch<React.SetStateAction<number>>;
}

export const SceneVersionContext = createContext<SceneVersionContextProps>({
  sceneVersion: 0,
  setSceneVersion: () => {},
  scriptVersion: 0,
  setScriptVersion: () => {},
});

export const SceneVersionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sceneVersion, setSceneVersion] = useState(0);
  const [scriptVersion, setScriptVersion] = useState(0);

  return (
    <SceneVersionContext.Provider
      value={{ sceneVersion, setSceneVersion, scriptVersion, setScriptVersion }}
    >
      {children}
    </SceneVersionContext.Provider>
  );
};

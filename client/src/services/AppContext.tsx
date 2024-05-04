// src/services/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Track, Artist } from "../types"

interface IAppContextType {
  selectedTrack: Track | null
  setSelectedTrack: (track: Track | null) => void
  accessToken: string
  setAccessToken: (token: string) => void
}

// Initialize the context with default values
const AppContext = createContext<IAppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [accessToken, setAccessToken] = useState<string>("")

  // The value that will be passed to the context
  const value: IAppContextType = {
    selectedTrack,
    setSelectedTrack,
    accessToken,
    setAccessToken,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// Hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within a AppProvider")
  }
  return context
}

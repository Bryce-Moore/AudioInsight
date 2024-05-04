// src/components/TrackView.tsx
import React from "react";
import { useAppContext } from "../services/AppContext"
import FeatureMetrics from "./FeatureMetrics"

const TrackView = () => {
  const { selectedTrack, accessToken } = useAppContext()

  if (!selectedTrack) {
    return <div>No track selected</div>
  }

  return (
    <div>
      {/* Display track's title/artist/album */}
      <h2>{selectedTrack.name}</h2>
      <h3>
        Artist(s):{" "}
        {selectedTrack.artists.map((artist) => artist.name).join(", ")}
      </h3>
      {selectedTrack.album && (
        <div>
          <h4>Album: {selectedTrack.album.name}</h4>
          <img
            src={selectedTrack.album.images[0].url}
            alt={selectedTrack.album.name}
            style={{ width: 100, height: 100 }}
          />
        </div>
      )}
      {/* Display track metrics */}
      <FeatureMetrics track={selectedTrack} accessToken={accessToken} />
    </div>
  )
}

export default TrackView
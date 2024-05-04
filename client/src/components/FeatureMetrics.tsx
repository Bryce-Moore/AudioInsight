// src/components/FeatureMetrics.tsx
import React, { useEffect, useState } from "react"
import { useAppContext } from "../services/AppContext"
import { Track } from "../types"
import "../styles/FeatureMetrics.css"
import { CircularProgressbar } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { validateHeaderName } from "http"

type Props = {
  track: Track
  accessToken: string
}

type AudioFeatures = {
  danceability: number
  energy: number
  valence: number
}

const FeatureMetrics: React.FC<Props> = ({ track, accessToken }) => {
  const [features, setFeatures] = useState<AudioFeatures | null>(null)

  useEffect(() => {
    const fetchAudioFeatures = async () => {
      if (!track.id || !accessToken) return

      // Check if audio features already exist
      if (track.danceability && track.energy && track.valence) {
        // Set features from existing track data
        setFeatures({
          danceability: track.danceability,
          energy: track.energy,
          valence: track.valence,
        })
        return // Features already cached, no need to fetch
      }

      try {
        const response = await fetch(
          `https://api.spotify.com/v1/audio-features/${track.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
        )
        const data = await response.json()
        if (
          data.danceability !== undefined &&
          data.energy !== undefined &&
          data.valence !== undefined
        ) {
          setFeatures({
            danceability: data.danceability,
            energy: data.energy,
            valence: data.valence,
          })
        }
      } catch (error) {
        console.error("Failed to fetch audio features:", error)
      }
    }

    fetchAudioFeatures()
  }, [track, accessToken])

  if (
    !features ||
    features.danceability === undefined ||
    features.energy === undefined ||
    features.valence === undefined
  ) {
    return <div>Loading audio features...</div>
  }

  const customStyles = {
    valence: {
      // Red color for valence
      path: {
        stroke: `rgba(220, 20, 60, ${features.valence / 1})`,
      },
      trail: {
        stroke: "#d6d6d6",
      },
      text: {
        fill: "#DC143C",
        fontSize: "16px",
      },
    },
    energy: {
      // Green color for energy
      path: {
        stroke: `rgba(34, 139, 34, ${features.energy / 1})`,
      },
      trail: {
        stroke: "#d6d6d6",
      },
      text: {
        fill: "#228B22",
        fontSize: "16px",
      },
    },
    danceability: {
      // Blue color for danceability
      path: {
        stroke: `rgba(30, 144, 255, ${features.danceability / 1})`,
      },
      trail: {
        stroke: "#d6d6d6",
      },
      text: {
        fill: "#1E90FF",
        fontSize: "16px", 
      },
    },
  }

  return (
    <div>
      <h3 id="AudioFeatures">Audio Features</h3>
      <ul className="metricsList">
        <li>
          <h1 className="metricTitle">Mood</h1>
          <div className="circular-progress-bar">
            <CircularProgressbar
              value={features.valence * 100}
              text={`${(features.valence * 100).toFixed(0)}%`}
              styles={customStyles.valence}
            />
          </div>
        </li>
        <li>
          <h1 className="metricTitle">Energy</h1>
          <div className="circular-progress-bar">
            <CircularProgressbar
              value={features.energy * 100}
              text={`${(features.energy * 100).toFixed(0)}%`}
              styles={customStyles.energy}
            />
          </div>
        </li>
        <li>
          <h1 className="metricTitle">Danceability</h1>
          <div className="circular-progress-bar">
            <CircularProgressbar
              value={features.danceability * 100}
              text={`${(features.danceability * 100).toFixed(0)}%`}
              styles={customStyles.danceability}
            />
          </div>
        </li>
      </ul>
    </div>
  )
}

export default FeatureMetrics

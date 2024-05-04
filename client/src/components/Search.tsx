// src/components/Search.tsx
import React, { useState, useEffect } from "react"
import { useAppContext } from "../services/AppContext"
import { Track } from "../types"
import "../styles/Search.css"

type SpotifySearchResponse = {
  tracks: {
    items: Track[]
  }
}

function Search() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Track[]>([])
  const { accessToken, setSelectedTrack } = useAppContext()
  const [showResults, setShowResults] = useState(false)

  // Fetch to /search endpoint on keypress after small delay
  useEffect(() => {
    const fetchData = async () => {
      if (query.length > 1) {
        try {
          const response = await fetch(
            `https://api.spotify.com/v1/search?type=track&limit=5&q=${encodeURIComponent(query)}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          )
          const data: SpotifySearchResponse = await response.json()
          if (data.tracks) {
            setResults(data.tracks.items)
          }
        } catch (error) {
          console.error("Failed to fetch tracks:", error)
        }
      }
    }

    const timeoutId = setTimeout(fetchData, 500) // Delay of 500ms

    return () => clearTimeout(timeoutId)
  }, [query, accessToken])

  const handleBlur = () => {
    // Delay hiding the results to allow for click event to be processed
    setTimeout(() => {
      setShowResults(false)
    }, 200) // Delay can be adjusted
  }
  
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search for songs"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setShowResults(true)
        }}
        onBlur={handleBlur}
        className="search-input"
      />
      <div
        className="results-container"
        onMouseDown={(e) => e.preventDefault()} 
      >
        {showResults &&
          results.map((track) => (
            <div
              key={track.id}
              onClick={() => {
                setSelectedTrack(track)
                setShowResults(false)
              }}
              className="track-item"
            >
              <img
                src={track.album?.images[0]?.url || "default-image-url.jpg"}
                alt={track.name}
                className="track-image"
              />
              {track.name} by{" "}
              {track.artists.map((artist) => artist.name).join(", ")}
            </div>
          ))}
      </div>
    </div>
  )
}

export default Search

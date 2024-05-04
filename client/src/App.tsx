// App.tsx
import React, { useEffect, useRef } from "react";
import "./App.css";
import { handleAuth } from "./services/Auth"
import { useAppContext } from "./services/AppContext"
import Search from "./components/Search"
import TrackView from "./components/TrackView"

// Initial state; no track selected
const Loading = () => {
  return <h3>Select a track to view its metrics.</h3>
}

function App() {
  const { accessToken, setAccessToken, selectedTrack } = useAppContext()
  const isAuthenticating = useRef(false)

  useEffect(() => {
    async function fetchAndSetAccessToken() {
      if (isAuthenticating.current) {
        console.log("Authentication is already in progress")
        return
      }

      console.log("No access token available, starting authentication process")
      isAuthenticating.current = true

      // Fetch access token
      handleAuth()
        .then((token) => {
          if (token) {
            setAccessToken(token)
            const newUrl = `${window.location.origin}${window.location.pathname}`
            window.history.pushState({}, "", newUrl)
          }
          isAuthenticating.current = false
        })
        .catch((error) => {
          console.error("Authentication failed:", error)
          isAuthenticating.current = false
        })
    }

    if (!accessToken) {
      fetchAndSetAccessToken()
    }
  }, [accessToken])

  if (!accessToken) {
    return <div id="loading">Fetching Spotify authorization data...</div>;
  } else {
    return (
      <div className="App">
        <nav className="navBar">
          <p id="title">AudioInsight</p>
          <Search />
        </nav>
        <div className="mainContainer">
          {selectedTrack && <TrackView />}
          {!selectedTrack && <Loading />}
        </div>
      </div>
    )
  }
}

export default App;
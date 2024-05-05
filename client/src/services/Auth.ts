// services/Auth.ts

const clientId = "YOUR_SPOTIFY_CLIENT_ID"
const redirectUri = "YOUR_SPOTIFY_CALLBACK_URI"

/* ---- PKCE Authorization https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow ---- */

function base64URLEncode(arrayBuffer: ArrayBuffer): string {
  let binary = ""
  const bytes = new Uint8Array(arrayBuffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

async function sha256(
  buffer: ArrayBuffer | ArrayBufferView,
): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", buffer)
}

async function pkceChallengeFromVerifier(v: string): Promise<string> {
  const hashed = await sha256(new TextEncoder().encode(v))
  return base64URLEncode(hashed)
}

function generateRandomString(length = 43): string {
  const validChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
  let array = new Uint8Array(length)
  window.crypto.getRandomValues(array)
  const characters = Array.from(
    array,
    (byte) => validChars[byte % validChars.length],
  )
  return characters.join("")
}

// Direct users to Spotify's auth page with scope perms
async function initiateAuth() {
  const codeVerifier = generateRandomString()
  const codeChallenge = await pkceChallengeFromVerifier(codeVerifier)
  window.sessionStorage.setItem("pkce_code_verifier", codeVerifier)

  const scope = ""
    // "user-read-private user-read-email playlist-read-private playlist-modify-private playlist-modify-public"
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge_method=S256&code_challenge=${codeChallenge}`

  window.location.href = authUrl // Redirect user to Spotify's authorization page
}

interface AuthParams {
  client_id: string
  grant_type: string
  code: string
  redirect_uri: string
  code_verifier: string
}

// Use 'code' from url to fetch access token
async function handleAuthCallback() {
  type AuthParams = Record<string, string>

  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get("code")?.toString()

  if (!code) return null

  const codeVerifier =
    window.sessionStorage.getItem("pkce_code_verifier") || "null"
  const tokenUrl = "https://accounts.spotify.com/api/token"

  const params: AuthParams = {
    client_id: clientId,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  }

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  })

  const data = await response.json()
  if (!data.access_token) {
    console.error("Failed to retrieve access token", data)
    return null
  } else {
    return data
  }
}

// Main function for module. Sets tokens into state and sessionStorage
export async function handleAuth() {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get("code")

  if (!code) {
    console.log("No code found, initiating authentication...")
    initiateAuth()
    return null
  } else {
    console.log("Code found, attempting to fetch access token...")
    const data = await handleAuthCallback()

    if (!data) {
      console.error(
        "Authentication failed, no data returned from handleAuthCallback",
      )
      return null
    }

    console.log("Access token response object:", data)
    const expiresAt = new Date().getTime() + data.expires_in * 1000
    window.sessionStorage.setItem("access_token", data.access_token)
    window.sessionStorage.setItem("refresh_token", data.refresh_token)
    window.sessionStorage.setItem("expires_at", expiresAt.toString())

    console.log(
      "Authentication complete, access token received:",
      data.access_token,
    )
    return data.access_token
  }
}

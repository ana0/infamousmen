import { useRef, useState, useEffect } from 'react'
import './App.css'

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Ensure the video is ready for audio
      video.volume = 1.0
    }
  }, [])

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted
      videoRef.current.muted = newMutedState
      videoRef.current.volume = newMutedState ? 0 : 1
      setIsMuted(newMutedState)
    }
  }

  return (
    <div className="video-container" onClick={handleVideoClick}>
      <video 
        ref={videoRef}
        className="main-video" 
        autoPlay 
        muted 
        loop
        playsInline
      >
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {isMuted && (
        <div className="mute-indicator">
          🔇 Click to unmute
        </div>
      )}
    </div>
  )
}

export default App

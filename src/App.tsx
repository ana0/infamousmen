import { useRef, useState, useEffect } from 'react'
import './App.css'

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const [isMuted, setIsMuted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (video && canvas) {
      // Ensure the video is ready for audio
      video.volume = 1.0
      
      // Set up audio context and analyser
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      // Start spectrogram animation
      const animate = () => {
        if (analyser && canvas) {
          const bufferLength = analyser.frequencyBinCount
          const dataArray = new Uint8Array(bufferLength)
          analyser.getByteFrequencyData(dataArray)
          
          const ctx = canvas.getContext('2d')
          if (ctx) {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            
            // Check if we have any audio data
            const hasAudioData = dataArray.some(value => value > 0)
            
            if (hasAudioData) {
              // Draw real frequency data
              const barWidth = (canvas.width / bufferLength) * 2
              for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height
                const x = i * barWidth
                
                // Create gradient from top to bottom (inverted direction)
                const gradient = ctx.createLinearGradient(0, 0, 0, barHeight)
                gradient.addColorStop(0, '#ff0000')
                gradient.addColorStop(0.5, '#ff99cc')
                gradient.addColorStop(1, '#0000ff')
                
                ctx.fillStyle = gradient
                ctx.fillRect(x, 0, barWidth, barHeight)
              }
            } else {
              // Show demo pattern when no audio
              const time = Date.now() * 0.001
              const barWidth = (canvas.width / 64) * 2
              for (let i = 0; i < 64; i++) {
                const frequency = i / 64
                const amplitude = Math.sin(time * 2 + frequency * 10) * 0.5 + 0.5
                const barHeight = amplitude * canvas.height * 0.4
                const x = i * barWidth
                
                // Create gradient from top to bottom (inverted direction)
                const gradient = ctx.createLinearGradient(0, 0, 0, barHeight)
                gradient.addColorStop(0, '#ff0000')
                gradient.addColorStop(0.5, '#ff99cc')
                gradient.addColorStop(1, '#0000ff')
                
                ctx.fillStyle = gradient
                ctx.fillRect(x, 0, barWidth, barHeight)
              }
            }
          }
        }
        requestAnimationFrame(animate)
      }
      
      animate()
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const handleVideoClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (videoRef.current && audioContextRef.current && analyserRef.current) {
      const newMutedState = !videoRef.current.muted
      videoRef.current.muted = newMutedState
      videoRef.current.volume = newMutedState ? 0 : 1
      setIsMuted(newMutedState)
      
      // Connect audio source when unmuting
      if (!newMutedState && !sourceRef.current) {
        try {
          await audioContextRef.current.resume()
          const source = audioContextRef.current.createMediaElementSource(videoRef.current)
          source.connect(analyserRef.current)
          analyserRef.current.connect(audioContextRef.current.destination)
          sourceRef.current = source
        } catch (error) {
          console.log('Audio context connection failed:', error)
        }
      }
    }
  }

  return (
    <div className="video-container" onClick={handleVideoClick}>
      <canvas 
        ref={canvasRef}
        className="spectrogram-canvas"
        width={window.innerWidth}
        height={300}
      />
      <video 
        ref={videoRef}
        className="main-video" 
        crossOrigin="anonymous"
        autoPlay 
        muted 
        loop
        playsInline
      >
        <source src="https://pub-166474990ea24709a41c8e491c22ddfe.r2.dev/output_montage.mp4" type="video/mp4" />
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

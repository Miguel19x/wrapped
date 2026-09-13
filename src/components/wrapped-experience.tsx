import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  SkipBack,
  SkipForward,
  Sparkles,
  Clock,
  Volume2,
  VolumeX,
  Share2,
  ExternalLink,
  Trophy,
  RotateCcw,
  Check,
  Headphones
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { WRAPPED_SONGS, USER_STATS, type Song } from "@/lib/wrapped-data"
import { SpotifyWidget } from "./spotify-widget"
import { fireConfetti } from "@/lib/confetti"

export default function WrappedExperience() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState<Song>(WRAPPED_SONGS[0])
  const [volume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isSpotifyOpen, setIsSpotifyOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isPausedByHold, setIsPausedByHold] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)

  const TOTAL_SLIDES = 6

  // Format time (mm:ss)
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "0:00"
    const mins = Math.floor(timeInSeconds / 60)
    const secs = Math.floor(timeInSeconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Handle audio playback
  const playSong = useCallback((song: Song) => {
    setCurrentSong(song)
    if (audioRef.current) {
      audioRef.current.src = song.audioUrl
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch((e) => {
        console.warn("Audio autoplay policy or error:", e)
        if (audioRef.current && song.previewUrl) {
          audioRef.current.src = song.previewUrl
          audioRef.current.play().catch(() => {})
        }
      })
    }
  }, [])

  const togglePlayPause = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch((e) => console.warn(e))
    }
  }

  // Volume & Mute handling
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  // Audio time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setDuration(audioRef.current.duration || 0)
    }
  }

  // Next / Previous song
  const nextSong = () => {
    const currentIndex = WRAPPED_SONGS.findIndex((s) => s.id === currentSong.id)
    const nextIndex = (currentIndex + 1) % WRAPPED_SONGS.length
    playSong(WRAPPED_SONGS[nextIndex])
  }

  const prevSong = () => {
    const currentIndex = WRAPPED_SONGS.findIndex((s) => s.id === currentSong.id)
    const prevIndex = (currentIndex - 1 + WRAPPED_SONGS.length) % WRAPPED_SONGS.length
    playSong(WRAPPED_SONGS[prevIndex])
  }

  // Next / Previous Slide
  const goToSlide = useCallback((index: number) => {
    const target = Math.max(0, Math.min(TOTAL_SLIDES - 1, index))
    setCurrentSlide(target)

    if (target === 5 || target === 1) {
      fireConfetti()
    }

    if (target === 1) {
      playSong(WRAPPED_SONGS[0])
    } else if (target === 4) {
      playSong(WRAPPED_SONGS[3])
    }
  }, [playSong])

  const nextSlide = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      goToSlide(currentSlide + 1)
    }
  }, [currentSlide, goToSlide])

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1)
    }
  }, [currentSlide, goToSlide])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextSlide()
      } else if (e.key === "ArrowLeft") {
        prevSlide()
      } else if (e.key === " ") {
        e.preventDefault()
        togglePlayPause()
      } else if (e.key.toLowerCase() === "m") {
        toggleMute()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [nextSlide, prevSlide, isPlaying])

  // Story touch/mouse hold to pause
  const handleHoldStart = () => {
    holdTimerRef.current = setTimeout(() => {
      setIsPausedByHold(true)
    }, 200)
  }

  const handleHoldEnd = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    setIsPausedByHold(false)
  }

  // Auto story progress (advances after 14s unless held or on final slide)
  useEffect(() => {
    if (isPausedByHold || currentSlide === TOTAL_SLIDES - 1) return
    const timer = setTimeout(() => {
      goToSlide(currentSlide + 1)
    }, 14000)
    return () => clearTimeout(timer)
  }, [currentSlide, isPausedByHold, goToSlide])

  // Share / Copy handler
  const handleShare = () => {
    const text = `🎧 ¡Mira mi Spotify Wrapped 2024! Escuché ${USER_STATS.totalHours} horas de ${USER_STATS.topArtist}. Mi canción #1 fue "${WRAPPED_SONGS[0].title}".`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } else if (navigator.share) {
      navigator.share({
        title: "Spotify Wrapped 2024 - Mr. Vinotinto",
        text,
        url: window.location.href,
      }).catch(() => {})
    }
  }

  const ambientGradient = currentSong.gradient
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center p-0 sm:p-4 overflow-hidden bg-[#06060c] select-none">
      {/* Dynamic Ambient Background Glow */}
      <div
        className={`absolute inset-0 opacity-40 blur-[130px] transition-all duration-1000 pointer-events-none bg-gradient-to-tr ${ambientGradient}`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-black pointer-events-none" />

      {/* Main Wrapped Card */}
      <div
        className="relative w-full max-w-[430px] sm:max-w-[460px] h-[100dvh] sm:h-[88vh] sm:max-h-[800px] flex flex-col justify-between bg-black/60 backdrop-blur-2xl border-0 sm:border sm:border-white/15 sm:rounded-3xl shadow-2xl overflow-hidden z-10"
        onMouseDown={handleHoldStart}
        onMouseUp={handleHoldEnd}
        onTouchStart={handleHoldStart}
        onTouchEnd={handleHoldEnd}
      >
        {/* Top Header & Story Progress Bars */}
        <div className="p-3.5 sm:p-4 pb-1 z-20 flex-shrink-0">
          {/* Segmented Story Progress Bar */}
          <div className="flex gap-1.5 w-full mb-2.5">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  goToSlide(i)
                }}
                className="flex-1 h-1 rounded-full overflow-hidden bg-white/20 transition-all hover:bg-white/40 focus:outline-none"
                title={`Ir a diapositiva ${i + 1}`}
              >
                <div
                  className={`h-full transition-all duration-300 ${
                    i < currentSlide
                      ? "w-full bg-[#1DB954]"
                      : i === currentSlide
                      ? "w-full bg-gradient-to-r from-[#1DB954] to-yellow-400"
                      : "w-0"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Top Bar Navigation & Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#1DB954] flex items-center justify-center text-black">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.306c-.218.358-.68.472-1.038.254-2.846-1.74-6.428-2.133-10.65-1.168-.41.094-.814-.162-.907-.572-.094-.41.162-.813.572-.907 4.63-1.057 8.59-.616 11.765 1.332.358.218.472.68.254 1.038zm1.472-3.275c-.275.447-.86.59-1.307.315-3.257-2.002-8.223-2.583-12.076-1.413-.502.152-1.037-.134-1.19-.636-.153-.502.134-1.037.636-1.19 4.408-1.338 9.89-.693 13.622 1.617.447.275.59.86.315 1.307zm.126-3.41c-3.906-2.32-10.35-2.533-14.072-1.403-.6.182-1.238-.163-1.42-.763-.182-.6.163-1.238.763-1.42 4.28-1.3 11.39-1.055 15.864 1.602.538.32.713 1.018.393 1.556-.32.538-1.018.713-1.556.393z"/>
                </svg>
              </div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-white/90">
                WRAPPED 2024
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-white/40 mr-1">
                {currentSlide + 1} / {TOTAL_SLIDES}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleMute()
                }}
                title={isMuted ? "Activar sonido" : "Silenciar"}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsSpotifyOpen(true)
                }}
                title="Abrir reproductor oficial de Spotify"
              >
                <Headphones className="h-3.5 w-3.5 text-[#1DB954]" />
              </Button>
            </div>
          </div>
        </div>

        {/* Story Body with Side Touch Tap Zones (NO SCROLLBAR) */}
        <div className="relative flex-1 flex flex-col justify-center px-4 sm:px-5 py-1 overflow-y-auto no-scrollbar">
          {/* Floating Left Story Chevron Button */}
          {currentSlide > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevSlide()
              }}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 border border-white/25 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl backdrop-blur-md group"
              title="Historia anterior"
            >
              <ChevronLeft className="w-5 h-5 text-white/80 group-hover:text-white" />
            </button>
          )}

          {/* Floating Right Story Chevron Button */}
          {currentSlide < TOTAL_SLIDES - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextSlide()
              }}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 border border-white/25 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-2xl backdrop-blur-md group"
              title="Siguiente historia"
            >
              <ChevronRight className="w-5 h-5 text-white/80 group-hover:text-white" />
            </button>
          )}

          {/* Touch Zones for Fast Tap Navigation */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1/5 z-10 cursor-pointer"
            onClick={prevSlide}
            title="Toca para retroceder"
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-1/5 z-10 cursor-pointer"
            onClick={nextSlide}
            title="Toca para avanzar"
          />

          {/* Slide Transitions */}
          <AnimatePresence mode="wait">
            {/* SLIDE 0: Welcome Intro */}
            {currentSlide === 0 && (
              <motion.div
                key="slide-0"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative z-20 text-center flex flex-col items-center justify-center space-y-4 sm:space-y-5 my-auto"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full" />
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-yellow-400 via-rose-500 to-purple-600 flex items-center justify-center shadow-xl border border-white/20">
                    <Sparkles className="w-8 h-8 text-white animate-bounce" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-white/90 tracking-wide border border-white/10">
                    Tu Año en Música
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                    Hola, <span className="bg-gradient-to-r from-[#1DB954] via-emerald-300 to-yellow-300 text-transparent bg-clip-text">Mr. Vinotinto</span>
                  </h1>
                  <p className="text-sm text-white/80 font-medium max-w-xs mx-auto">
                    ¡Hola Nacho! Tus números de 2024 ya están listos. Prepárate para revivir tu año musical.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md w-full max-w-xs text-left space-y-2 shadow-inner">
                  <div className="flex justify-between items-center text-xs text-white/60">
                    <span>Artista #1</span>
                    <span className="font-semibold text-white">Chino & Nacho</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-white/60">
                    <span>Canciones analizadas</span>
                    <span className="font-semibold text-white">Top 5 Hits</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-white/60">
                    <span>Horas estimadas</span>
                    <span className="font-bold text-[#1DB954]">{USER_STATS.totalHours} hrs</span>
                  </div>
                </div>

                <Button
                  onClick={nextSlide}
                  className="rounded-full px-6 py-4 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-sm shadow-lg shadow-[#1DB954]/25 transition-transform hover:scale-105 active:scale-95"
                >
                  <span>Descubrir mi Wrapped</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            )}

            {/* SLIDE 1: Top Song #1 */}
            {currentSlide === 1 && (
              <motion.div
                key="slide-1"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative z-20 text-center flex flex-col items-center justify-center space-y-3.5 sm:space-y-4 my-auto"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold tracking-widest text-[#1DB954] uppercase">
                    Puesto de Honor #1
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Tu Canción Favorita
                  </h2>
                </div>

                {/* 3D Vinyl Album Disc Art */}
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto group">
                  <div
                    className={`absolute inset-0 rounded-full bg-[#111] border-4 border-[#222] shadow-2xl flex items-center justify-center transition-transform duration-700 ${
                      isPlaying && currentSong.id === "1" ? "animate-[spin_10s_linear_infinite]" : "rotate-12"
                    }`}
                  >
                    <div className="absolute inset-2 rounded-full border border-white/5" />
                    <div className="absolute inset-5 rounded-full border border-white/5" />
                    <div className="absolute inset-9 rounded-full border border-white/5" />
                  </div>

                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                    <img
                      src={WRAPPED_SONGS[0].coverUrl}
                      alt={WRAPPED_SONGS[0].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5 text-left">
                      <p className="text-base font-black text-white leading-snug">{WRAPPED_SONGS[0].title}</p>
                      <p className="text-[11px] text-white/80 font-medium">{WRAPPED_SONGS[0].artist}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 max-w-xs mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs">
                    <span>🔥 {WRAPPED_SONGS[0].playCount} reproducciones</span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                    Escuchaste esta canción <strong className="text-white">1,000 veces</strong> e hiciste que todo el grupo también se la aprendiera de memoria.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-0.5">
                  <Button
                    onClick={() => playSong(WRAPPED_SONGS[0])}
                    className="rounded-full px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs shadow-md"
                  >
                    {isPlaying && currentSong.id === "1" ? (
                      <>
                        <Pause className="w-3.5 h-3.5 mr-1" /> Pausar
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 mr-1 fill-current" /> Reproducir
                      </>
                    )}
                  </Button>
                  <a
                    href={WRAPPED_SONGS[0].spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-colors"
                  >
                    <span>Spotify</span>
                    <ExternalLink className="w-3 h-3 text-[#1DB954]" />
                  </a>
                </div>
              </motion.div>
            )}

            {/* SLIDE 2: Total Hours & Minutes */}
            {currentSlide === 2 && (
              <motion.div
                key="slide-2"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative z-20 text-center flex flex-col items-center justify-center space-y-4 my-auto"
              >
                <div className="w-14 h-14 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg">
                  <Clock className="w-7 h-7" />
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
                    Tiempo Total de Escucha
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    Horas con Chino y Nacho
                  </h2>
                </div>

                <div className="py-1">
                  <div className="text-6xl sm:text-7xl font-black bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-transparent bg-clip-text tracking-tight">
                    {USER_STATS.totalHours}
                  </div>
                  <p className="text-sm font-semibold text-white/90">Horas acumuladas</p>
                  <p className="text-xs text-white/50">≈ {USER_STATS.totalMinutes.toLocaleString()} minutos de puro ritmo</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md max-w-sm mx-auto space-y-1 shadow-lg">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                    Diagnóstico Musical
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    "{USER_STATS.jokeQuote}"
                  </p>
                  <p className="text-[11px] text-white/70">
                    Superaste a casi todos tus amigos con este nivel de fanatismo.
                  </p>
                </div>
              </motion.div>
            )}

            {/* SLIDE 3: Top 5 Songs List */}
            {currentSlide === 3 && (
              <motion.div
                key="slide-3"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative z-20 flex flex-col justify-center space-y-2 my-auto w-full max-w-sm mx-auto"
              >
                <div className="text-center space-y-0.5 pb-0.5">
                  <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                    Tu Rotación Favorita
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Tu Top 5 Canciones
                  </h2>
                </div>

                <div className="space-y-1.5">
                  {WRAPPED_SONGS.map((song, index) => {
                    const isSongActive = currentSong.id === song.id
                    return (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.06 }}
                        onClick={() => playSong(song)}
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                          isSongActive
                            ? "bg-white/15 border-[#1DB954] shadow-md"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`text-sm font-black w-4 text-center ${
                              index === 0
                                ? "text-yellow-400"
                                : index === 1
                                ? "text-cyan-400"
                                : "text-white/60"
                            }`}
                          >
                            #{index + 1}
                          </span>

                          <div className="relative w-8 h-8 rounded-md overflow-hidden flex-shrink-0 border border-white/10">
                            <img
                              src={song.coverUrl}
                              alt={song.title}
                              className="w-full h-full object-cover"
                            />
                            {isSongActive && isPlaying && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="flex items-end gap-0.5 h-2">
                                  <span className="w-0.5 bg-[#1DB954] animate-[bounce_0.6s_infinite_alternate]" />
                                  <span className="w-0.5 bg-[#1DB954] animate-[bounce_0.8s_infinite_alternate]" />
                                  <span className="w-0.5 bg-[#1DB954] animate-[bounce_0.5s_infinite_alternate]" />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{song.title}</p>
                            <p className="text-[10px] text-white/60 truncate">{song.playCount} reproducciones</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (isSongActive) {
                                togglePlayPause()
                              } else {
                                playSong(song)
                              }
                            }}
                            className={`p-1.5 rounded-full transition-colors ${
                              isSongActive
                                ? "bg-[#1DB954] text-black"
                                : "bg-white/10 text-white hover:bg-white/20"
                            }`}
                            title="Reproducir"
                          >
                            {isSongActive && isPlaying ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3 fill-current ml-0.5" />
                            )}
                          </button>

                          <a
                            href={song.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-[#1DB954] transition-colors"
                            title="Abrir en Spotify"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* SLIDE 4: Top Artist Badge */}
            {currentSlide === 4 && (
              <motion.div
                key="slide-4"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative z-20 text-center flex flex-col items-center justify-center space-y-4 my-auto"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-black shadow-xl shadow-amber-500/20">
                  <Trophy className="w-8 h-8" />
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold tracking-widest text-yellow-400 uppercase">
                    Tu Artista #1 de 2024
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {USER_STATS.topArtist}
                  </h2>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 via-white/5 to-purple-500/10 border border-yellow-500/30 backdrop-blur-md max-w-xs mx-auto space-y-1.5 shadow-2xl">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-yellow-400 text-black">
                    FAN DESTACADO
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white">
                    Top {USER_STATS.artistTopPercentile}
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">
                    Estuviste entre el 0.01% de oyentes más fieles de Chino & Nacho a nivel mundial durante todo el 2024.
                  </p>
                </div>

                <p className="text-[11px] text-white/60 max-w-xs mx-auto">
                  Tus temas más repetidos abarcaron desde sus clásicos románticos hasta sus temas más bailables.
                </p>
              </motion.div>
            )}

            {/* SLIDE 5: Final Summary Poster & Share */}
            {currentSlide === 5 && (
              <motion.div
                key="slide-5"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative z-20 flex flex-col justify-center space-y-3 my-auto w-full max-w-sm mx-auto"
              >
                {/* Poster Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#141418] to-[#0d0d12] border border-white/20 shadow-2xl space-y-2.5 text-left">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <div>
                      <h3 className="text-base font-black text-white tracking-tight leading-tight">Spotify Wrapped 2024</h3>
                      <p className="text-[11px] text-white/60">Resumen de Mr. Vinotinto</p>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#1DB954] flex items-center justify-center text-black font-bold">
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.306c-.218.358-.68.472-1.038.254-2.846-1.74-6.428-2.133-10.65-1.168-.41.094-.814-.162-.907-.572-.094-.41.162-.813.572-.907 4.63-1.057 8.59-.616 11.765 1.332.358.218.472.68.254 1.038zm1.472-3.275c-.275.447-.86.59-1.307.315-3.257-2.002-8.223-2.583-12.076-1.413-.502.152-1.037-.134-1.19-.636-.153-.502.134-1.037.636-1.19 4.408-1.338 9.89-.693 13.622 1.617.447.275.59.86.315 1.307zm.126-3.41c-3.906-2.32-10.35-2.533-14.072-1.403-.6.182-1.238-.163-1.42-.763-.182-.6.163-1.238.763-1.42 4.28-1.3 11.39-1.055 15.864 1.602.538.32.713 1.018.393 1.556-.32.538-1.018.713-1.556.393z"/>
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-white/50 text-[9px] uppercase font-bold">Top Canción</p>
                      <p className="font-bold text-white text-xs truncate">{WRAPPED_SONGS[0].title}</p>
                      <p className="text-white/70 text-[10px]">{WRAPPED_SONGS[0].playCount} reps</p>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-white/50 text-[9px] uppercase font-bold">Top Artista</p>
                      <p className="font-bold text-white text-xs truncate">{USER_STATS.topArtist}</p>
                      <p className="text-[#1DB954] font-semibold text-[10px]">Top {USER_STATS.artistTopPercentile}</p>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-white/50 text-[9px] uppercase font-bold">Tiempo Total</p>
                      <p className="font-bold text-white text-xs">{USER_STATS.totalHours} Horas</p>
                      <p className="text-white/70 text-[10px]">{USER_STATS.totalMinutes.toLocaleString()} min</p>
                    </div>

                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-white/50 text-[9px] uppercase font-bold">Personalidad</p>
                      <p className="font-bold text-white text-xs truncate">{USER_STATS.personalityType}</p>
                      <p className="text-white/70 text-[10px]">100% Vinotinto</p>
                    </div>
                  </div>

                  <div className="pt-0.5">
                    <p className="text-[10px] text-white/50 text-center">
                      Hecho para Vinotinto con amor y buen reggaetón venezolano 🇻🇪
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleShare}
                      className="flex-1 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs py-3.5 shadow-lg shadow-[#1DB954]/20"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1" /> ¡Enlace Copiado!
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 mr-1" /> Compartir Wrapped
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setIsSpotifyOpen(true)}
                      className="rounded-xl border-white/20 bg-white/5 hover:bg-white/15 text-white font-semibold text-xs px-3"
                      title="Reproducir en Spotify"
                    >
                      <Headphones className="w-3.5 h-3.5 text-[#1DB954] mr-1" />
                      Spotify
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => goToSlide(0)}
                    className="text-[11px] text-white/60 hover:text-white hover:bg-white/10 rounded-lg py-1.5 h-auto"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Volver a ver desde el principio
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Compact, Unified Bottom Player Bar */}
        <div className="relative border-t border-white/10 bg-black/80 backdrop-blur-xl z-20 flex-shrink-0">
          {/* Subtle 2px Audio Progress Bar with Scrubbing */}
          <div
            className="w-full h-1 bg-white/10 cursor-pointer group relative"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const clickX = e.clientX - rect.left
              const percent = clickX / rect.width
              if (duration > 0 && audioRef.current) {
                const newTime = percent * duration
                audioRef.current.currentTime = newTime
                setCurrentTime(newTime)
              }
            }}
          >
            <div
              className="h-full bg-gradient-to-r from-[#1DB954] to-yellow-400 group-hover:h-1.5 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Unified Controls Row */}
          <div className="p-2.5 sm:px-3 sm:py-2 flex items-center justify-between gap-2">
            {/* Left: Track Info with click to open Spotify */}
            <div
              className="flex items-center gap-2 min-w-0 max-w-[42%] sm:max-w-[45%] cursor-pointer group"
              onClick={() => setIsSpotifyOpen(true)}
              title="Click para abrir en reproductor de Spotify"
            >
              <div className="relative w-8 h-8 rounded-md overflow-hidden flex-shrink-0 border border-white/15 group-hover:scale-105 transition-transform">
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ExternalLink className="w-2.5 h-2.5 text-[#1DB954]" />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-bold text-white truncate group-hover:text-[#1DB954] transition-colors">
                    {currentSong.title}
                  </p>
                  {isPlaying && (
                    <div className="flex items-end gap-0.5 h-2 flex-shrink-0">
                      <span className="w-0.5 bg-[#1DB954] animate-[bounce_0.6s_infinite_alternate]" />
                      <span className="w-0.5 bg-[#1DB954] animate-[bounce_0.9s_infinite_alternate]" />
                      <span className="w-0.5 bg-[#1DB954] animate-[bounce_0.5s_infinite_alternate]" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-white/50 truncate font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </p>
              </div>
            </div>

            {/* Center: Track Playback Controls */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                onClick={prevSong}
                title="Pista anterior"
              >
                <SkipBack className="h-3.5 w-3.5 fill-current" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-[#1DB954] text-black hover:bg-[#1ed760] transition-transform active:scale-95 shadow-md"
                onClick={togglePlayPause}
                title={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5 fill-current" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                onClick={nextSong}
                title="Siguiente pista"
              >
                <SkipForward className="h-3.5 w-3.5 fill-current" />
              </Button>
            </div>

            {/* Right: Sound & Spotify Modal */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-white/70 hover:text-white hover:bg-white/10"
                onClick={toggleMute}
                title={isMuted ? "Activar sonido" : "Silenciar"}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5" />}
              </Button>

              <button
                onClick={() => setIsSpotifyOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1DB954]/15 hover:bg-[#1DB954]/25 text-[#1DB954] border border-[#1DB954]/30 text-[11px] font-bold transition-all hover:scale-105 active:scale-95"
                title="Abrir reproductor oficial de Spotify"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.306c-.218.358-.68.472-1.038.254-2.846-1.74-6.428-2.133-10.65-1.168-.41.094-.814-.162-.907-.572-.094-.41.162-.813.572-.907 4.63-1.057 8.59-.616 11.765 1.332.358.218.472.68.254 1.038zm1.472-3.275c-.275.447-.86.59-1.307.315-3.257-2.002-8.223-2.583-12.076-1.413-.502.152-1.037-.134-1.19-.636-.153-.502.134-1.037.636-1.19 4.408-1.338 9.89-.693 13.622 1.617.447.275.59.86.315 1.307zm.126-3.41c-3.906-2.32-10.35-2.533-14.072-1.403-.6.182-1.238-.163-1.42-.763-.182-.6.163-1.238.763-1.42 4.28-1.3 11.39-1.055 15.864 1.602.538.32.713 1.018.393 1.556-.32.538-1.018.713-1.556.393z"/>
                </svg>
                <span className="hidden sm:inline">Spotify</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hidden Audio Element for direct in-browser playback */}
        <audio
          ref={audioRef}
          src={currentSong.audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onEnded={nextSong}
        />
      </div>

      {/* Official Spotify Embed Modal */}
      <SpotifyWidget
        song={currentSong}
        isOpen={isSpotifyOpen}
        onClose={() => setIsSpotifyOpen(false)}
      />
    </div>
  )
}
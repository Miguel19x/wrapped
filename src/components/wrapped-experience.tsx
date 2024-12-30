import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, ChevronRight, ChevronLeft, Sparkles, Clock, Heart, Share2, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

interface Song {
  id: string
  title: string
  artist: string
  playCount: number
  totalMinutes: number
  audioUrl: string
}

const songs: Song[] = [
  { id: "1", title: "Niña Bonita", artist: "Chino & Nacho", playCount: 1000, totalMinutes: 3000, audioUrl: "../audio/nina-bonita.mp3" },
  { id: "2", title: "Me Voy Enamorando", artist: "Chino & Nacho", playCount: 859, totalMinutes: 2577, audioUrl: "../audio/me-voy-enamorando.mp3" },
  { id: "3", title: "Tu Angelito", artist: "Chino & Nacho", playCount: 678, totalMinutes: 2034, audioUrl: "../audio/tu-angelito.mp3" },
  { id: "4", title: "Andas En Mi Cabeza", artist: "Chino & Nacho", playCount: 543, totalMinutes: 1629, audioUrl: "../audio/andas-en-mi-cabeza.mp3" },
  { id: "5", title: "El Poeta", artist: "Chino & Nacho", playCount: 356, totalMinutes: 1068, audioUrl: "../audio/el-poeta.mp3" },
]

const slides = [
  {
    id: "Vinotinto",
    component: () => (
      <div className="text-center space-y-4">
        <Sparkles className="w-16 h-16 mx-auto text-yellow-400 animate-pulse" />
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-transparent bg-clip-text">Hola, Vinotinto</h1>
        <p className="text-white/80">¡Hola Nacho!</p>
      </div>
    ),
  },
  {
    id: "top-song",
    component: () => (
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">Tu canción favorita #1</h2>
        <div className="relative w-48 h-48 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-lg rotate-3 animate-pulse" />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg -rotate-3" />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-2xl font-bold text-white">{songs[0].title}</p>
          </div>
        </div>
        <p className="text-white/80">Has escuchado esta canción {songs[0].playCount} veces e hiciste que el grupo también</p>
      </div>
    ),
  },
  {
    id: "listening-time",
    component: () => (
      <div className="text-center space-y-6">
        <Clock className="w-16 h-16 mx-auto text-cyan-400" />
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-500 text-transparent bg-clip-text">Total de horas que has escuchado:</h2>
        <div className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
          {Math.round(songs.reduce((acc, song) => acc + song.totalMinutes, 0) / 60)}
        </div>
        <p className="text-white/80">Horas de Chino y Nacho.</p>
        <p className="text-white/80">Mrc estás enfermo bajale dos</p>
      </div>
    ),
  },
  {
    id: "top-5",
    component: () => (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 text-transparent bg-clip-text">Tu top 5</h2>
        <div className="space-y-4">
          {songs.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-lg"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">#{index + 1}</span>
              <div>
                <p className="font-bold text-white">{song.title}</p>
                <p className="text-sm text-white/60">{song.playCount} reproducciones</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
]

export default function WrappedExperience() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [volume, setVolume] = useState(0.5)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const playSong = (song: Song) => {
    if (audioRef.current) {
      audioRef.current.src = song.audioUrl
      audioRef.current.play()
      setIsPlaying(true)
      setCurrentSong(song)
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-700 to-blue-700 p-4">
      <Card className="w-full max-w-md bg-black/30 backdrop-blur-xl border-white/10 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {slides[currentSlide].component()}

            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-white hover:bg-white/10"
                onClick={previousSlide}
                disabled={currentSlide === 0}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 w-8 rounded-full ${
                      index === currentSlide ? "bg-gradient-to-r from-pink-500 to-yellow-500" : "bg-white/20"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-white hover:bg-white/10"
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 mr-4">
              <p className="text-sm font-medium text-white truncate">{currentSong?.title || "Select a song"}</p>
              <p className="text-xs text-white/60 truncate">{currentSong?.artist || "Chino & Nacho"}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-white/10"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-white/60" />
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              className="w-full"
              onValueChange={(value) => setVolume(value[0] / 100)}
            />
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <h3 className="text-sm font-medium text-white mb-2">Escucha tu top de canciones</h3>
          <div className="space-y-2">
            {songs.map((song) => (
              <Button
                key={song.id}
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white/10"
                onClick={() => playSong(song)}
              >
                <Play className="h-4 w-4 mr-2" />
                {song.title}
              </Button>
            ))}
          </div>
        </div>

        <audio ref={audioRef} />
      </Card>
    </div>
  )
}
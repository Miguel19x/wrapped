import React from "react"
import type { Song } from "@/lib/wrapped-data"
import { X, ExternalLink, Music } from "lucide-react"

interface SpotifyWidgetProps {
  song: Song
  isOpen: boolean
  onClose: () => void
}

export const SpotifyWidget: React.FC<SpotifyWidgetProps> = ({ song, isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#181818] border border-white/10 rounded-2xl p-5 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center text-black font-bold">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.516 17.306c-.218.358-.68.472-1.038.254-2.846-1.74-6.428-2.133-10.65-1.168-.41.094-.814-.162-.907-.572-.094-.41.162-.813.572-.907 4.63-1.057 8.59-.616 11.765 1.332.358.218.472.68.254 1.038zm1.472-3.275c-.275.447-.86.59-1.307.315-3.257-2.002-8.223-2.583-12.076-1.413-.502.152-1.037-.134-1.19-.636-.153-.502.134-1.037.636-1.19 4.408-1.338 9.89-.693 13.622 1.617.447.275.59.86.315 1.307zm.126-3.41c-3.906-2.32-10.35-2.533-14.072-1.403-.6.182-1.238-.163-1.42-.763-.182-.6.163-1.238.763-1.42 4.28-1.3 11.39-1.055 15.864 1.602.538.32.713 1.018.393 1.556-.32.538-1.018.713-1.556.393z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">Reproductor Spotify</h3>
              <p className="text-xs text-white/60">Conectado directamente a Spotify</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar reproductor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded Spotify IFrame Player */}
        <div className="rounded-xl overflow-hidden bg-black/50 shadow-inner mb-4">
          <iframe
            key={song.spotifyId}
            src={`https://open.spotify.com/embed/track/${song.spotifyId}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={`Spotify Player - ${song.title}`}
            className="w-full border-0"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-white/50 flex items-center gap-1 truncate">
            <Music className="w-3.5 h-3.5 flex-shrink-0" />
            {song.title} - {song.artist}
          </span>
          <a
            href={song.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1DB954] text-black font-semibold hover:bg-[#1ed760] transition-colors flex-shrink-0"
          >
            <span>Abrir en Spotify</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}

export interface Song {
  id: string
  title: string
  artist: string
  album: string
  playCount: number
  totalMinutes: number
  audioUrl: string
  previewUrl: string
  spotifyId: string
  spotifyUrl: string
  coverUrl: string
  gradient: string
  accentColor: string
}

export const WRAPPED_SONGS: Song[] = [
  {
    id: "1",
    title: "Niña Bonita",
    artist: "Chino & Nacho",
    album: "Mi Niña Bonita",
    playCount: 1000,
    totalMinutes: 3000,
    audioUrl: "/audio/nina-bonita.mp3",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/93/88/f4/9388f484-6cbe-7ecf-d89b-39b8183c2906/mzaf_18107247983422538523.plus.aac.p.m4a",
    spotifyId: "4u5xLMRN0dgKBFFN8FiNgv",
    spotifyUrl: "https://open.spotify.com/track/4u5xLMRN0dgKBFFN8FiNgv",
    coverUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02535b15f71a115b19d37bd8ac",
    gradient: "from-pink-500 via-rose-500 to-amber-500",
    accentColor: "#ec4899"
  },
  {
    id: "2",
    title: "Me Voy Enamorando",
    artist: "Chino & Nacho ft. Farruko",
    album: "Radio Universo",
    playCount: 859,
    totalMinutes: 2577,
    audioUrl: "/audio/me-voy-enamorando.mp3",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/39/d4/92/39d49221-9917-9dc7-1727-d8be776430a1/mzaf_165792066465203377.plus.aac.p.m4a",
    spotifyId: "39Gb80bu5xF0rQtAxTxUS1",
    spotifyUrl: "https://open.spotify.com/track/39Gb80bu5xF0rQtAxTxUS1",
    coverUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02f8c4cabe5ab9abbc0b9047f9",
    gradient: "from-cyan-500 via-blue-600 to-purple-600",
    accentColor: "#06b6d4"
  },
  {
    id: "3",
    title: "Tu Angelito",
    artist: "Chino & Nacho",
    album: "Mi Niña Bonita",
    playCount: 678,
    totalMinutes: 2034,
    audioUrl: "/audio/tu-angelito.mp3",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ce/f5/90/cef59099-a1af-d916-b8b2-220f58e9cbc3/mzaf_3662360299645232880.plus.aac.p.m4a",
    spotifyId: "77VXEopCatM9pqJl0beeCj",
    spotifyUrl: "https://open.spotify.com/track/77VXEopCatM9pqJl0beeCj",
    coverUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02535b15f71a115b19d37bd8ac",
    gradient: "from-emerald-400 via-teal-500 to-indigo-600",
    accentColor: "#10b981"
  },
  {
    id: "4",
    title: "Andas En Mi Cabeza",
    artist: "Chino & Nacho ft. Daddy Yankee",
    album: "Andas En Mi Cabeza",
    playCount: 543,
    totalMinutes: 1629,
    audioUrl: "/audio/andas-en-mi-cabeza.mp3",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a7/a8/2b/a7a82bf1-d1a7-6bc2-99c8-8d2779002e02/mzaf_8270474621708923270.plus.aac.p.m4a",
    spotifyId: "23WI5V2eD4EyGKxSl7Pyeq",
    spotifyUrl: "https://open.spotify.com/track/23WI5V2eD4EyGKxSl7Pyeq",
    coverUrl: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e026df5cc472d61a635abab06cf",
    gradient: "from-amber-400 via-orange-500 to-rose-600",
    accentColor: "#f59e0b"
  },
  {
    id: "5",
    title: "El Poeta",
    artist: "Chino & Nacho",
    album: "Supremo",
    playCount: 356,
    totalMinutes: 1068,
    audioUrl: "/audio/el-poeta.mp3",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ca/19/88/ca198843-d46b-1d88-e905-0456d9464905/mzaf_2284451913930104516.plus.aac.p.m4a",
    spotifyId: "0G31zWm4L2c9fJ9zAzWsar",
    spotifyUrl: "https://open.spotify.com/track/0G31zWm4L2c9fJ9zAzWsar",
    coverUrl: "https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e02f5918895e2fe1e1e62ba9f33",
    gradient: "from-purple-500 via-indigo-600 to-blue-600",
    accentColor: "#a855f7"
  }
]

export const USER_STATS = {
  userName: "Mr. Vinotinto",
  userTag: "Nacho",
  year: "2024",
  topArtist: "Chino & Nacho",
  artistTopPercentile: "0.01%",
  totalPlays: WRAPPED_SONGS.reduce((acc, s) => acc + s.playCount, 0),
  totalMinutes: WRAPPED_SONGS.reduce((acc, s) => acc + s.totalMinutes, 0),
  totalHours: Math.round(WRAPPED_SONGS.reduce((acc, s) => acc + s.totalMinutes, 0) / 60),
  topGenre: "Pop Latino / Reggaetón Romántico",
  personalityType: "El Fanático Incurable",
  jokeQuote: "Mrc estás enfermo, bájale dos a Chino & Nacho 🇻🇪🎧"
}

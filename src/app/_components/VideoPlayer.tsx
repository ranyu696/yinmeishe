'use client'
import {
  Gesture,
  isHLSProvider,
  MediaPlayer,
  MediaProvider,
  Poster,
  type MediaProviderAdapter,
} from '@vidstack/react'
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default'
import '@vidstack/react/player/styles/default/layouts/video.css'
import '@vidstack/react/player/styles/default/theme.css'
import React from 'react'

interface VideoPlayerProps {
  src: string
  poster?: string
}
function onProviderChange(provider: MediaProviderAdapter | null) {
  if (isHLSProvider(provider)) {
    // Default development URL.
    provider.library =
      'https://cdn.bootcdn.net/ajax/libs/hls.js/1.5.11/hls.min.js'
    // Default production URL.
    provider.library =
      'https://cdn.bootcdn.net/ajax/libs/hls.js/1.5.11/hls.min.js'
  }
}
const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster }) => {
  return (
    <MediaPlayer
      src={src}
      poster={poster}
      aspectRatio="16/9"
      playsInline
      onProviderChange={onProviderChange}
    >
      <MediaProvider>
        <Poster alt="视频海报" className="vds-poster" src={poster} />
      </MediaProvider>
      <Gesture
        action="toggle:controls"
        className="vds-gesture"
        event="pointerup"
      />
      <Gesture action="seek:-10" className="vds-gesture" event="dblpointerup" />
      <Gesture action="seek:10" className="vds-gesture" event="dblpointerup" />
      <Gesture
        action="toggle:fullscreen"
        className="vds-gesture"
        event="dblpointerup"
      />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  )
}

export default VideoPlayer

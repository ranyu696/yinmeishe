'use client'

import {
  Gesture,
  isHLSProvider,
  MediaPlayer,
  MediaProvider,
  Poster,
  useMediaState,
  type MediaPlayerInstance,
  type MediaProviderAdapter,
} from '@vidstack/react'
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default'
import '@vidstack/react/player/styles/default/layouts/video.css'
import '@vidstack/react/player/styles/default/theme.css'
import React, { useCallback, useEffect, useRef } from 'react'
import { api } from '~/trpc/react'

interface VideoPlayerProps {
  id: number
  src: string
  poster?: string
}

function onProviderChange(provider: MediaProviderAdapter | null) {
  if (isHLSProvider(provider)) {
    provider.library =
      'https://cdn.bootcdn.net/ajax/libs/hls.js/1.5.11/hls.min.js'
  }
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ id, src, poster }) => {
  const playerRef = useRef<MediaPlayerInstance>(null)
  const paused = useMediaState('paused', playerRef)
  const playbackStarted = useRef(false)
  const viewIncremented = useRef(false)

  const incrementViewsMutation = api.video.incrementViews.useMutation()

  const incrementViews = useCallback(() => {
    if (!viewIncremented.current) {
      incrementViewsMutation.mutate(id, {
        onSuccess: () => {
          console.log('视图计数已成功增加')
          viewIncremented.current = true
        },
        onError: (error) => {
          console.error('无法增加观看次数:', error)
        },
      })
    }
  }, [id, incrementViewsMutation])

  useEffect(() => {
    if (!paused && !playbackStarted.current) {
      playbackStarted.current = true
      incrementViews()
    }
  }, [paused, incrementViews])

  return (
    <MediaPlayer
      ref={playerRef}
      src={src}
      poster={poster}
      aspectRatio="16/9"
      playsInline
      load="eager"
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

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from '@nextui-org/react'
import { type Video, type VideoSource } from '@prisma/client'
import {
  Gesture,
  isHLSProvider,
  MediaPlayer,
  MediaProvider,
  type MediaProviderAdapter,
} from '@vidstack/react'
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default'
import '@vidstack/react/player/styles/default/layouts/video.css'
import '@vidstack/react/player/styles/default/theme.css'
import { useState } from 'react'

interface VideoPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  video: Video & { videoSources: VideoSource[] }
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  video,
}: VideoPlayerModalProps) {
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0)
  const videoSources = video.videoSources || []
  function onProviderChange(provider: MediaProviderAdapter | null) {
    if (isHLSProvider(provider)) {
      // 默认开发 URL。
      provider.library =
        'https://cdn.bootcdn.net/ajax/libs/hls.js/1.5.11/hls.js'
      // 默认生产 URL。
      provider.library =
        'https://cdn.bootcdn.net/ajax/libs/hls.js/1.5.11/hls.min.js'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalContent>
        <ModalHeader>{video.title}</ModalHeader>
        <ModalBody>
          {video.videoSources.length > 1 && (
            <Select
              label="选择播放源"
              selectedKeys={[selectedSourceIndex.toString()]}
              onSelectionChange={(keys) => {
                const selectedKey = Array.from(keys)[0] as string
                setSelectedSourceIndex(parseInt(selectedKey))
              }}
              className="mb-4"
            >
              {video.videoSources.map((source, index) => (
                <SelectItem key={index} value={index.toString()}>
                  播放源 {index + 1} ({source.playerType})
                </SelectItem>
              ))}
            </Select>
          )}
          <MediaPlayer
            playsInline
            title={video.title}
            src={videoSources[selectedSourceIndex]?.playUrl}
            aspectRatio="16/9"
            onProviderChange={onProviderChange}
          >
            <MediaProvider />
            <Gesture
              action="toggle:controls"
              className="vds-gesture"
              event="pointerup"
            />
            <Gesture
              action="seek:-10"
              className="vds-gesture"
              event="dblpointerup"
            />
            <Gesture
              action="seek:10"
              className="vds-gesture"
              event="dblpointerup"
            />
            <Gesture
              action="toggle:fullscreen"
              className="vds-gesture"
              event="dblpointerup"
            />
            <DefaultVideoLayout icons={defaultLayoutIcons} />
          </MediaPlayer>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onPress={onClose}>
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

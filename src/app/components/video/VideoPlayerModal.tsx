import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react'
import { type Video } from '@prisma/client'
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

interface VideoPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  video: Video
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  video,
}: VideoPlayerModalProps) {
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
          <MediaPlayer
            playsInline
            title={video.title}
            src={video.playUrl}
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

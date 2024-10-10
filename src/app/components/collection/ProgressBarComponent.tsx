import { Progress } from '@nextui-org/react'
import React from 'react'
import { api } from '~/trpc/react'

interface ProgressBarProps {
  apiId: number
}

interface CollectionProgress {
  progress: number
  status: 'FETCHING_LIST' | 'PROCESSING_VIDEOS' | 'COMPLETED'
  currentPage?: number
  totalPages?: number
  currentVideo?: number
  totalVideos?: number
}

export const ProgressBarComponent: React.FC<ProgressBarProps> = ({ apiId }) => {
  const [progress, setProgress] = React.useState<CollectionProgress>({
    progress: 0,
    status: 'FETCHING_LIST',
  })

  api.collector.getCollectionProgress.useSubscription(undefined, {
    onData: (data) => {
      if (data.apiId === apiId) {
        if (data.progress === 100) {
          setProgress((prev) => ({
            ...prev,
            progress: 100,
            status: 'COMPLETED',
          }))
        } else {
          setProgress(data as CollectionProgress)
        }
      }
    },
  })

  return (
    <>
      <Progress
        value={progress.progress}
        className="max-w-md"
        size="md"
        radius="sm"
        classNames={{
          base: 'max-w-md',
          track: 'drop-shadow-md border border-default',
          indicator: 'bg-gradient-to-r from-pink-500 to-yellow-500',
          label: 'tracking-wider font-medium text-default-600',
          value: 'text-foreground/60',
        }}
        label="采集进度"
        showValueLabel={true}
      />
      {progress.status === 'FETCHING_LIST' &&
        progress.currentPage &&
        progress.totalPages && (
          <p className="mt-1 text-sm text-gray-500">
            正在获取列表: 第 {progress.currentPage} 页，共 {progress.totalPages}{' '}
            页
          </p>
        )}
      {progress.status === 'PROCESSING_VIDEOS' &&
        progress.currentVideo &&
        progress.totalVideos && (
          <p className="mt-1 text-sm text-gray-500">
            正在处理视频: {progress.currentVideo} / {progress.totalVideos}
          </p>
        )}
      {progress.status === 'COMPLETED' && (
        <p className="mt-1 text-sm text-green-500">采集完成</p>
      )}
    </>
  )
}

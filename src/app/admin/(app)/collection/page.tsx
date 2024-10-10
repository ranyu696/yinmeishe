'use client'

import {
  Button,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { Edit, FileSearch, Link, Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import CollectionControl from '~/app/components/collection/CollectionControl'
import { DataBindingModal } from '~/app/components/collection/DataBindingModal'
import { ExternalApiForm } from '~/app/components/collection/ExternalApiForm'
import { ProgressBarComponent } from '~/app/components/collection/ProgressBarComponent'
import { ResourceDetailsModal } from '~/app/components/collection/ResourceDetailsModal'
import DeleteConfirmModal from '~/app/components/shared/DeleteConfirmModal'
import { api } from '~/trpc/react'

interface ExternalApi {
  id: number
  name: string
  url: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

type CollectionOption = 'all' | 'today' | 'week'

interface CollectionProgress {
  progress: number
  status: string
  currentPage?: number
  totalPages?: number
  currentVideo?: number
  totalVideos?: number
}
interface CollectionProgressData {
  apiId: number
  collectionId: string
  progress: number
  status: 'FETCHING_LIST' | 'PROCESSING_VIDEOS' | 'COMPLETED' | 'FAILED';
  currentPage?: number
  totalPages?: number
  currentVideo?: number
  totalVideos?: number
}

export default function CollectionPage() {
  const [isApiFormOpen, setIsApiFormOpen] = useState(false)
  const [editingApi, setEditingApi] = useState<ExternalApi | null>(null)
  const [isDataBindingModalOpen, setIsDataBindingModalOpen] = useState(false)
  const [isResourceDetailsModalOpen, setIsResourceDetailsModalOpen] =
    useState(false)
  const [selectedApiId, setSelectedApiId] = useState<number | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [activeCollections, setActiveCollections] = useState<
    Record<number, string>
  >({})
  const [, setCollectionProgress] = useState<
    Record<number, CollectionProgress>
  >({})

  const { data: externalApis, refetch: refetchApis } =
    api.externalApi.getAll.useQuery()
  const createApiMutation = api.externalApi.create.useMutation()
  const updateApiMutation = api.externalApi.update.useMutation()
  const deleteApiMutation = api.externalApi.delete.useMutation()
  const toggleActiveMutation = api.externalApi.toggleActive.useMutation()
  const startCollectionMutation = api.collector.startCollection.useMutation()

  api.collector.getCollectionProgress.useSubscription(undefined, {
    onData: (data: CollectionProgressData) => {
      setCollectionProgress((prev) => ({
        ...prev,
        [data.apiId]: {
          progress: data.progress,
          status: data.status,
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          currentVideo: data.currentVideo,
          totalVideos: data.totalVideos,
        },
      }))
    },
  })

  const handleStartCollection = useCallback(
    async (apiId: number, option: CollectionOption) => {
      try {
        const result = await startCollectionMutation.mutateAsync({
          apiId,
          mode: option === 'all' ? 'all' : 'hours',
          hours: option === 'today' ? 24 : option === 'week' ? 168 : undefined,
        })

        if (result.collectionId) {
          setActiveCollections((prev) => ({
            ...prev,
            [apiId]: result.collectionId,
          }))
          toast(
            `开始${option === 'all' ? '全部' : option === 'today' ? '今日' : '一周'}采集`,
            { type: 'success' },
          )
        }
      } catch (err) {
        if (err instanceof Error) {
          toast('启动采集任务时发生错误: ' + err.message, { type: 'error' })
        } else {
          toast('启动采集任务时发生未知错误', { type: 'error' })
        }
      }
    },
    [startCollectionMutation],
  )

  const handleSaveApi = async (api: ExternalApi) => {
    try {
      if (api.id) {
        await updateApiMutation.mutateAsync(api)
        toast('API 更新成功', { type: 'success' })
      } else {
        await createApiMutation.mutateAsync(api)
        toast('API 创建成功', { type: 'success' })
      }
      setIsApiFormOpen(false)
      setEditingApi(null)
      void refetchApis()
    } catch (err) {
      if (err instanceof Error) {
        toast('保存 API 时发生错误: ' + err.message, { type: 'error' })
      } else {
        toast('保存 API 时发生未知错误', { type: 'error' })
      }
    }
  }

  const handleDeleteApi = (id: number) => {
    setSelectedApiId(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedApiId) {
      try {
        await deleteApiMutation.mutateAsync(selectedApiId)
        void refetchApis()
        setIsDeleteModalOpen(false)
        toast('API 删除成功', { type: 'success' })
      } catch (err) {
        if (err instanceof Error) {
          toast('删除 API 时发生错误: ' + err.message, { type: 'error' })
        } else {
          toast('删除 API 时发生未知错误', { type: 'error' })
        }
      }
    }
  }

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await toggleActiveMutation.mutateAsync({ id, isActive })
      void refetchApis()
      toast(isActive ? 'API 同步已启用' : 'API 同步已停用', { type: 'success' })
    } catch (err) {
      if (err instanceof Error) {
        toast('切换 API 同步状态时发生错误: ' + err.message, { type: 'error' })
      } else {
        toast('切换 API 同步状态时发生未知错误', { type: 'error' })
      }
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">外部API管理</h1>
        <Button
          color="primary"
          startContent={<Plus />}
          onPress={() => {
            setEditingApi({
              id: 0,
              name: '',
              url: '',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            setIsApiFormOpen(true)
          }}
        >
          添加API
        </Button>
      </div>

      <Table aria-label="External APIs">
        <TableHeader>
          <TableColumn>名称</TableColumn>
          <TableColumn>地址</TableColumn>
          <TableColumn>采集进度</TableColumn>
          <TableColumn>同步图片</TableColumn>
          <TableColumn>操作</TableColumn>
        </TableHeader>
        <TableBody items={externalApis ?? []}>
          {(api) => (
            <TableRow key={api.id}>
              <TableCell>{api.name}</TableCell>
              <TableCell>{api.url}</TableCell>
              <TableCell>
                <ProgressBarComponent apiId={api.id} />
              </TableCell>
              <TableCell>
                <Switch
                  isSelected={api.isActive}
                  onValueChange={(isActive) =>
                    handleToggleActive(api.id, isActive)
                  }
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <CollectionControl
                    key={`${api.id}-${api.name}`}
                    apiId={api.id}
                    initialOption="all"
                    onStartCollection={handleStartCollection}
                    isDisabled={!!activeCollections[api.id]}
                  />
                  <Button
                    size="sm"
                    color="secondary"
                    startContent={<Link />}
                    onPress={() => {
                      setSelectedApiId(api.id)
                      setIsDataBindingModalOpen(true)
                    }}
                  >
                    数据绑定
                  </Button>
                  <Button
                    size="sm"
                    color="success"
                    startContent={<FileSearch />}
                    onPress={() => {
                      setSelectedApiId(api.id)
                      setIsResourceDetailsModalOpen(true)
                    }}
                  >
                    资源详情
                  </Button>
                  <Button
                    size="sm"
                    color="warning"
                    startContent={<Edit />}
                    onPress={() => {
                      setEditingApi(api)
                      setIsApiFormOpen(true)
                    }}
                  >
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    startContent={<Trash2 />}
                    onPress={() => handleDeleteApi(api.id)}
                  >
                    删除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <ExternalApiForm
        isOpen={isApiFormOpen}
        onOpenChange={setIsApiFormOpen}
        editingApi={editingApi}
        onSave={handleSaveApi}
        onChange={(api) => setEditingApi(api as ExternalApi)}
      />

      {selectedApiId && (
        <>
          <DataBindingModal
            isOpen={isDataBindingModalOpen}
            onOpenChange={setIsDataBindingModalOpen}
            apiId={selectedApiId}
          />

          <ResourceDetailsModal
            isOpen={isResourceDetailsModalOpen}
            onOpenChange={setIsResourceDetailsModalOpen}
            apiId={selectedApiId}
            categoryId={0} // 这里需要传入正确的 categoryId
          />
        </>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => void confirmDelete()}
        title="删除资源库"
        content="您确定要删除这个资源库吗？此操作不可撤销。"
      />
    </div>
  )
}

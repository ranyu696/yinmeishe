import type { Selection } from '@nextui-org/react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
} from '@nextui-org/react';
import React, { useMemo, useState } from 'react';
import { api } from '~/trpc/react';

interface ResourceDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  apiId: number;
  categoryId: number;
}

type Resource = {
  id: number;
  name: string;
  category: string;
  playerType: string;
  updatedAt: string;
};

type CollectionStatus = 'FETCHING_LIST' | 'PROCESSING_VIDEOS' | 'COMPLETED' | 'FAILED';

export function ResourceDetailsModal({
  isOpen,
  onOpenChange,
  apiId,
  categoryId,
}: ResourceDetailsModalProps) {
  const [page, setPage] = useState(1);
  const [collectionStatus, setCollectionStatus] = useState<CollectionStatus | null>(null);
  const [collectionProgress] = useState<number>(0);
  const [, setCollectionId] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  // Fetch resources based on API ID, page, and category ID
  const { data: resourcesData, isLoading } = api.externalApi.getResources.useQuery({
    apiId,
    page,
    categoryId,
  });

  const resources = useMemo(() => resourcesData?.resources ?? [], [resourcesData]);
  const totalPages = useMemo(() => Math.ceil((resourcesData?.total ?? 0) / 20), [resourcesData?.total]);

  // Start collection mutation
  const startCollectionMutation = api.collector.startCollection.useMutation<{
    collectionId: string;
  }>();

  // Subscription to collection progress

  const handleCollectSelected = async () => {
    try {
      const selectedResourceIds = Array.from(selectedKeys as Set<string>).map((key) => key.toString());
      const result = await startCollectionMutation.mutateAsync({
        apiId,
        mode: 'specific',
        resourceIds: selectedResourceIds,
        categoryId,
      });

      if (result?.collectionId) {
        setCollectionId(result.collectionId);
        setCollectionStatus('FETCHING_LIST');
      } else {
        throw new Error('未返回有效的 collectionId');
      }
    } catch (error) {
      console.error('开始收集时出错:', error);
      setCollectionStatus('FAILED');
    }
  };

  const columns = [
    { key: 'name', label: '资源名称' },
    { key: 'category', label: '分类' },
    { key: 'playerType', label: '播放器类型' },
    { key: 'updatedAt', label: '更新时间' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="5xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader>资源详情</ModalHeader>
        <ModalBody>
          <Table
            aria-label="Resource Details Table"
            selectionMode="multiple"
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={resources}
              emptyContent={
                isLoading ? (
                  <Spinner label="Loading..." />
                ) : (
                  'No resources found'
                )
              }
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>
                      {columnKey === 'updatedAt'
                        ? new Date(getKeyValue(item, columnKey as keyof Resource) as string).toLocaleString()
                        : getKeyValue(item, columnKey as keyof Resource)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
          {!isLoading && (
            <div className="mt-4 flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                page={page}
                total={totalPages}
                onChange={setPage}
              />
            </div>
          )}
          {collectionStatus && (
            <div className="mt-4 text-center">
              <p>{collectionStatus}</p>
              <p>进度: {collectionProgress}%</p>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onPress={handleCollectSelected}
            disabled={
              selectedKeys === 'all'
                ? false
                : (selectedKeys as Set<string>).size === 0 || !!collectionStatus
            }
          >
            采集选中资源 (
            {selectedKeys === 'all' ? '全部' : (selectedKeys as Set<string>).size}
            )
          </Button>
          <Button
            color="danger"
            variant="light"
            onPress={() => onOpenChange(false)}
          >
            关闭
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

'use client'

import { Button, Tab, Tabs } from '@nextui-org/react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import BasicSettings from '~/app/components/settings/BasicSettings'
import CategorySEOSettings from '~/app/components/settings/CategorySEOSettings'
import PerformanceSettings from '~/app/components/settings/PerformanceSettings'
import SEOSettings from '~/app/components/settings/SEOSettings'
import SocialSettings from '~/app/components/settings/SocialSettings'
import { api } from '~/trpc/react'
import { processAndUploadImage } from '~/utils/uploadUtils'

type SettingValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, string>
type SettingsType = Record<string, Record<string, SettingValue>>

interface UploadResult {
  filePath: string
}

interface UploadData {
  imageData: string
  fileName: string
}

export default function AdminSettingsPage() {
  const { data: settingsData, refetch } = api.systemSettings.getAll.useQuery()
  const updateSettings = api.systemSettings.updateMany.useMutation({
    onSuccess: () => {
      toast.success('设置已更新')
      void refetch()
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`)
    },
  })
  const uploadMutation =
    api.systemSettings.uploadImage.useMutation<UploadResult>()

  const [formData, setFormData] = useState<SettingsType>(() => {
    if (settingsData) {
      return Object.entries(settingsData).reduce<SettingsType>(
        (acc, [category, values]) => {
          acc[category] = Object.entries(values).reduce<
            Record<string, SettingValue>
          >((catAcc, [key, value]) => {
            catAcc[key] = value as SettingValue
            return catAcc
          }, {})
          return acc
        },
        {},
      )
    }
    return {}
  })

  const handleChange = (category: string, key: string, value: SettingValue) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] ?? {}),
        [key]: value,
      },
    }))
  }

  const handleFileUpload = async (
    file: File,
    category: string,
    key: string,
  ) => {
    try {
      const result = await processAndUploadImage(
        file,
        async (data: UploadData) => {
          const uploadResult = await uploadMutation.mutateAsync({
            category,
            imageData: data.imageData,
            fileName: data.fileName,
          })
          if (typeof uploadResult.filePath !== 'string') {
            throw new Error('Invalid upload result')
          }
          return uploadResult
        },
      )

      if (result && typeof result.filePath === 'string') {
        handleChange(category, key, result.filePath)
      } else {
        throw new Error('Invalid upload result')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('文件上传失败')
    }
  }

  const handleSubmit = () => {
    const updates = Object.entries(formData).flatMap(
      ([category, categorySettings]) =>
        Object.entries(categorySettings).map(([key, value]) => ({
          category,
          key,
          value,
        })),
    )
    updateSettings.mutate(updates)
  }

  if (!settingsData) return <div>Loading...</div>

  return (
    <div className="mx-auto my-14 flex w-full max-w-[95rem] flex-col gap-4 lg:px-6">
      <h1 className="mb-6 text-2xl font-bold">系统设置</h1>
      <Tabs>
        <Tab key="basic" title="基本设置">
          <BasicSettings
            settings={formData.basic ?? {}}
            onChange={(key, value) =>
              handleChange('basic', key, value as SettingValue)
            }
            onFileUpload={(file, key) =>
              void handleFileUpload(file, 'basic', key)
            }
          />
        </Tab>
        <Tab key="seo" title="SEO设置">
          <SEOSettings
            settings={formData.seo ?? {}}
            onChange={(key, value) =>
              handleChange('seo', key, value as SettingValue)
            }
          />
        </Tab>
        <Tab key="social" title="社交媒体设置">
          <SocialSettings
            settings={formData.social ?? {}}
            onChange={(key, value) =>
              handleChange('social', key, value as SettingValue)
            }
          />
        </Tab>
        <Tab key="categorySeo" title="分类首页SEO设置">
          <CategorySEOSettings
            settings={formData.categorySeo ?? {}}
            onChange={(key, value) =>
              handleChange('categorySeo', key, value as SettingValue)
            }
          />
        </Tab>
        <Tab key="performance" title="性能设置">
          <PerformanceSettings
            settings={formData.categorySeo ?? {}}
            onChange={(key, value) =>
              handleChange('performance', key, value as SettingValue)
            }
          />
        </Tab>
      </Tabs>
      <Button color="primary" onClick={handleSubmit} className="mt-6">
        保存所有设置
      </Button>
    </div>
  )
}

'use client'

import { Button, Tab, Tabs } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import BasicSettings from '~/app/components/settings/BasicSettings'
import CategorySEOSettings from '~/app/components/settings/CategorySEOSettings'
import PerformanceSettings from '~/app/components/settings/PerformanceSettings'
import SEOSettings from '~/app/components/settings/SEOSettings'
import SocialSettings from '~/app/components/settings/SocialSettings'
import { api } from '~/trpc/react'

type SettingValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, string>
type SettingsType = Record<string, Record<string, SettingValue>>

interface UploadResponse {
  filePath: string
  error?: string
}

export default function AdminSettingsPage() {
  const { data: settingsData, refetch } = api.systemSettings.getAll.useQuery()
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<SettingsType>({})
  const [isLoading, setIsLoading] = useState(true)

  const updateSettings = api.systemSettings.updateMany.useMutation({
    onSuccess: () => {
      toast.success('设置已更新')
      void refetch()
    },
    onError: (error) => {
      toast.error(`更新失败: ${error.message}`)
    },
  })

  useEffect(() => {
    if (settingsData) {
      const newFormData = Object.entries(settingsData).reduce<SettingsType>(
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
      setFormData(newFormData)
      setIsLoading(false)
    }
  }, [settingsData])

  useEffect(() => {
    console.log('Settings Data:', settingsData)
    console.log('Form Data:', formData)
  }, [settingsData, formData])

  const handleChange = (category: string, key: string, value: SettingValue) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] ?? {}),
        [key]: value,
      },
    }))
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    category: string,
    key: string,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)

      const response = await fetch('/api/upload/setting', {
        method: 'POST',
        body: formData,
      })

      const result = (await response.json()) as UploadResponse

      if (!response.ok) {
        throw new Error(result.error ?? '上传失败')
      }

      console.log('上传成功:', result)

      handleChange(category, key, result.filePath)

      toast.success('图片上传成功')
    } catch (error) {
      console.error('上传失败:', error)
      toast.error('图片上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = () => {
    const updates = Object.entries(formData).flatMap(
      ([category, categorySettings]) =>
        Object.entries(categorySettings).map(([key, value]) => ({
          category,
          key,
          value: value as string | number | boolean,
        })),
    )
    updateSettings.mutate(updates)
  }

  if (isLoading) return <div>Loading settings...</div>

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
            onFileChange={(event, key) =>
              void handleFileChange(event, 'basic', key)
            }
            uploading={uploading}
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
            settings={formData.performance ?? {}}
            onChange={(key, value) =>
              handleChange('performance', key, value as SettingValue)
            }
          />
        </Tab>
        <Tab key="performance" title="采集设置">
          <PerformanceSettings
            settings={formData.performance ?? {}}
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

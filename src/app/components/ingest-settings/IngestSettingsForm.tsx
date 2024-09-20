'use client'

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Switch,
  Tooltip,
} from '@nextui-org/react'
import { type IngestSettings } from '@prisma/client'
import { CopyIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { api } from '~/trpc/react'

function generateRandomPassword(length = 12) {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+'
  return Array.from(
    { length },
    () => charset[Math.floor(Math.random() * charset.length)],
  ).join('')
}

export function IngestSettingsForm({
  initialSettings,
}: {
  initialSettings: IngestSettings[]
}) {
  const [settings, setSettings] = useState(initialSettings)
  const updateMutation = api.ingestSettings.update.useMutation()

  const handleUpdate = async (id: string, data: Partial<IngestSettings>) => {
    try {
      await updateMutation.mutateAsync({ id, ...data })
      setSettings(settings.map((s) => (s.id === id ? { ...s, ...data } : s)))
      toast.success('设置已更新')
    } catch (error) {
      console.error('更新设置失败:', error)
      toast.error('更新设置失败，请重试')
    }
  }

  const handleRandomPassword = (id: string) => {
    const newPassword = generateRandomPassword()
    void handleUpdate(id, { apiKey: newPassword })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('已复制到剪贴板')
    } catch (error) {
      console.error('复制到剪贴板失败:', error)
      toast.error('复制失败，请手动复制')
    }
  }

  return (
    <div className="mx-auto my-14 flex w-full max-w-[95rem] flex-col gap-4 lg:px-6">
      {settings.map((setting) => (
        <Card key={setting.id} className="w-full">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{setting.type} 入库设置</h3>
            <Switch
              isSelected={setting.isEnabled}
              onValueChange={(checked) =>
                void handleUpdate(setting.id, { isEnabled: checked })
              }
            >
              启用
            </Switch>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <Input
              label="入库地址"
              value={setting.endpoint}
              onChange={(e) =>
                void handleUpdate(setting.id, { endpoint: e.target.value })
              }
            />
            <div className="flex items-center gap-2">
              <Input
                label="API密钥"
                value={setting.apiKey}
                onChange={(e) =>
                  void handleUpdate(setting.id, { apiKey: e.target.value })
                }
                className="grow"
              />
              <Button
                onClick={() => handleRandomPassword(setting.id)}
                size="sm"
              >
                随机
              </Button>
              <Tooltip content="复制到剪贴板">
                <Button
                  isIconOnly
                  onClick={() => void copyToClipboard(setting.apiKey)}
                  size="sm"
                >
                  <CopyIcon size={20} />
                </Button>
              </Tooltip>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  )
}

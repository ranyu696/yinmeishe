import { Input, Textarea } from '@nextui-org/react'
import React from 'react'

type SettingValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, string>

type BasicSettingsProps = {
  settings: Record<string, SettingValue>
  onChange: (key: string, value: SettingValue) => void
  onFileChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => void
  uploading: boolean
}

function BasicSettings({
  settings,
  onChange,
  onFileChange,
  uploading,
}: BasicSettingsProps) {
  return (
    <div className="space-y-4">
      <Input
        label="网站名称"
        value={settings.siteName as string}
        onChange={(e) => onChange('siteName', e.target.value)}
      />
      <Textarea
        label="网站描述"
        value={settings.description as string}
        onChange={(e) => onChange('description', e.target.value)}
      />
      <Input
        label="网站关键词"
        value={settings.keywords as string}
        onChange={(e) => onChange('keywords', e.target.value)}
      />
      <div>
        <Input
          label="网站Logo URL"
          value={settings.logoUrl as string}
          onChange={(e) => onChange('logoUrl', e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFileChange(e, 'logoUrl')}
          className="mt-2"
          disabled={uploading}
        />
      </div>
      <div>
        <Input
          label="网站图标URL"
          value={settings.faviconUrl as string}
          onChange={(e) => onChange('faviconUrl', e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFileChange(e, 'faviconUrl')}
          className="mt-2"
          disabled={uploading}
        />
      </div>
      {uploading && <p>上传中...</p>}
      <Input
        label="联系邮箱"
        value={settings.contactEmail as string}
        onChange={(e) => onChange('contactEmail', e.target.value)}
      />
      <Input
        label="版权信息"
        value={settings.copyright as string}
        onChange={(e) => onChange('copyright', e.target.value)}
      />
      <Input
        label="Telegram"
        value={settings.telegram as string}
        onChange={(e) => onChange('telegram', e.target.value)}
      />
    </div>
  )
}

export default BasicSettings

import { Input, Textarea } from '@nextui-org/react'

type SettingValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, string>

type CategorySEOSettingsProps = {
  settings: Record<string, SettingValue>
  onChange: (key: string, value: SettingValue) => void
}

function CategorySEOSettings({ settings, onChange }: CategorySEOSettingsProps) {
  const categories = ['video', 'novel', 'comic', 'gallery']

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold capitalize">
            {category} 首页SEO设置
          </h3>
          <Input
            label="标题"
            value={settings[`${category}Title`] as string}
            onChange={(e) => onChange(`${category}Title`, e.target.value)}
          />
          <Input
            label="关键词"
            value={settings[`${category}Keywords`] as string}
            onChange={(e) => onChange(`${category}Keywords`, e.target.value)}
          />
          <Textarea
            label="描述"
            value={settings[`${category}Description`] as string}
            onChange={(e) => onChange(`${category}Description`, e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}

export default CategorySEOSettings

import { Input, Switch } from '@nextui-org/react'

type SettingValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, string>

type PerformanceSettingsProps = {
  settings: Record<string, SettingValue>
  onChange: (key: string, value: SettingValue) => void
}

function PerformanceSettings({ settings, onChange }: PerformanceSettingsProps) {
  return (
    <div className="space-y-4">
      <Switch
        isSelected={settings.searchCacheEnabled as boolean}
        onValueChange={(checked) => onChange('searchCacheEnabled', checked)}
      >
        启用搜索缓存
      </Switch>
      <Input
        label="搜索缓存时间（秒）"
        value={String(settings.searchCacheTime ?? '')}
        onChange={(e) =>
          onChange('searchCacheTime', parseInt(e.target.value, 10) ?? 0)
        }
      />
    </div>
  )
}

export default PerformanceSettings

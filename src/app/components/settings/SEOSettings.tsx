import { Input, Textarea } from '@nextui-org/react'

type SettingValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, string>

type SEOSettingsProps = {
  settings: Record<string, SettingValue>
  onChange: (key: string, value: SettingValue) => void
}

function SEOSettings({ settings, onChange }: SEOSettingsProps) {
  return (
    <div className="space-y-4">
      <Input
        label="默认标题模板"
        value={settings.defaultTitleTemplate as string}
        onChange={(e) => onChange('defaultTitleTemplate', e.target.value)}
      />
      <Textarea
        label="默认描述"
        value={settings.defaultDescription as string}
        onChange={(e) => onChange('defaultDescription', e.target.value)}
      />
      <Input
        label="默认关键词"
        value={settings.defaultKeywords as string}
        onChange={(e) => onChange('defaultKeywords', e.target.value)}
      />
      <Textarea
        label="首页SEO描述"
        value={settings.homeDescription as string}
        onChange={(e) => onChange('homeDescription', e.target.value)}
      />
      <Input
        label="首页SEO关键词"
        value={settings.homeKeywords as string}
        onChange={(e) => onChange('homeKeywords', e.target.value)}
      />
      <Textarea
        label="Robots.txt 内容"
        value={settings.robotsTxt as string}
        onChange={(e) => onChange('robotsTxt', e.target.value)}
      />
      <Input
        label="Sitemap URL"
        value={settings.sitemapUrl as string}
        onChange={(e) => onChange('sitemapUrl', e.target.value)}
      />
    </div>
  )
}

export default SEOSettings

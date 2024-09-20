import { Input, Switch, Textarea } from '@nextui-org/react'

type SettingValue =
  | string
  | number
  | boolean
  | string[]
  | Record<string, string>

type SocialSettingsProps = {
  settings: Record<string, SettingValue>
  onChange: (key: string, value: SettingValue) => void
}

function SocialSettings({ settings, onChange }: SocialSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">社交媒体链接</h3>
        <Input
          label="微博"
          value={settings.weiboUrl as string}
          onChange={(e) => onChange('weiboUrl', e.target.value)}
        />
        <Input
          label="微信公众号"
          value={settings.wechatPublic as string}
          onChange={(e) => onChange('wechatPublic', e.target.value)}
        />
        <Input
          label="抖音"
          value={settings.douyinUrl as string}
          onChange={(e) => onChange('douyinUrl', e.target.value)}
        />
        <Input
          label="Facebook"
          value={settings.facebookUrl as string}
          onChange={(e) => onChange('facebookUrl', e.target.value)}
        />
        <Input
          label="Twitter"
          value={settings.twitterUrl as string}
          onChange={(e) => onChange('twitterUrl', e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">社交分享设置</h3>
        <Switch
          checked={settings.enableSocialShare as boolean}
          onChange={(e) => onChange('enableSocialShare', e.target.checked)}
        >
          启用社交分享
        </Switch>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Open Graph 设置</h3>
        <Input
          label="OG 标题"
          value={settings.ogTitle as string}
          onChange={(e) => onChange('ogTitle', e.target.value)}
        />
        <Textarea
          label="OG 描述"
          value={settings.ogDescription as string}
          onChange={(e) => onChange('ogDescription', e.target.value)}
        />
        <Input
          label="OG 图片 URL"
          value={settings.ogImageUrl as string}
          onChange={(e) => onChange('ogImageUrl', e.target.value)}
        />
        <Input
          label="OG 类型"
          value={settings.ogType as string}
          onChange={(e) => onChange('ogType', e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Twitter Cards 设置</h3>
        <Input
          label="Twitter Card 类型"
          value={settings.twitterCardType as string}
          onChange={(e) => onChange('twitterCardType', e.target.value)}
        />
        <Input
          label="Twitter 站点"
          value={settings.twitterSite as string}
          onChange={(e) => onChange('twitterSite', e.target.value)}
        />
        <Input
          label="Twitter 创建者"
          value={settings.twitterCreator as string}
          onChange={(e) => onChange('twitterCreator', e.target.value)}
        />
      </div>
    </div>
  )
}

export default SocialSettings

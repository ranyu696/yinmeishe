export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: '小新视频',
  description:
    '奈飞中文官方影视聚合平台，大型影视剧集弹幕网站，你想看的vip影视剧集全都有！奈飞中文每天搜集更新互联网最新电影和电视剧，提供免费在线无广告观看和下载服务，及时收录最新、最热、最全的影视大片，高清正版vip抢先免费看。',
  keywords: '奈飞,奈飞中文,奈飞影视',
  CategoryHomePages: [
    {
      type: 'novel',
      title: '《Novel Title》',
      keywords: 'novel, author, reading',
      description:
        'Detailed introduction to the novel 《Novel Title》, exploring the story background and characters.',
    },
    {
      type: 'comic',
      title: '《Comic Title》',
      keywords: 'comic, author, reading',
      description:
        'Delve into the plot and characters of the comic 《Comic Title》, come read it!',
    },
    {
      type: 'gallery',
      title: '《Gallery Title》',
      keywords: 'gallery, photography, art',
      description:
        'Enjoy the visual feast of the gallery 《Gallery Title》, experience the beauty of each piece.',
    },
    {
      type: 'video',
      title: '《Video Title》',
      keywords: 'video, content, entertainment',
      description:
        'Watch the video 《Video Title》, get the latest content and exciting moments.',
    },
  ],
  CategoryPages: [
    {
      type: 'novel',
      title: 'Novel Categories',
      keywords: 'novel, genre, reading',
      description: 'Categorized novels by type, easily find your favorite.',
    },
    {
      type: 'comic',
      title: 'Comic Categories',
      keywords: 'comic, genre, reading',
      description:
        'All kinds of comics are categorized here, enjoy the exciting stories.',
    },
    {
      type: 'gallery',
      title: 'Gallery Categories',
      keywords: 'gallery, genre, art',
      description:
        'Themed galleries categorized to showcase different styles of art.',
    },
    {
      type: 'video',
      title: 'Video Categories',
      keywords: 'video, genre, entertainment',
      description:
        'A collection of videos categorized by type, easily find content of interest.',
    },
  ],

  links: {
    github: 'https://github.com/nextui-org/nextui',
    twitter: 'https://twitter.com/getnextui',
    docs: 'https://nextui.org',
    discord: 'https://discord.gg/9b6yyZKmH4',
    sponsor: 'https://patreon.com/jrgarciadev',
  },
}

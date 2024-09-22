import { Link } from '@nextui-org/react'
import Banner from '../_components/banner'
import BottomLinks from '../_components/BottomLinks'
import BottomTags from '../_components/BottomTags'
import Category from '../_components/Category'
import Heads from '../_components/heads'
import IconAds from '../_components/IconAds'
import Navbar from '../_components/navbar'
import TopTags from '../_components/TopTags'
import TopLinks from '../_components/TopLinks'
import { PHProvider } from '../_components/posthog/providers'
import PostHogPageView from '../_components/posthog/PostHogPageView'
import { Suspense } from 'react'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PHProvider>
      <Suspense fallback={null}>
      <PostHogPageView /> 
      </Suspense>
    <div className="relative flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-7xl">
        <header className="w-full p-2">
          <Heads />
          <Banner />
          <Navbar />
          <Category />
          <IconAds />
          <TopLinks />
          <TopTags />
        </header>
        <main className="w-full flex-1 p-2">{children}</main>
        <IconAds />
        <BottomLinks />
        <BottomTags />
      </div>
      <footer className="flex w-full items-center justify-center py-3">
        <Link
          isExternal
          className="flex items-center gap-1 text-current"
          href="https://nextui-docs-v2.vercel.app?utm_source=next-app-template"
          title="nextui.org homepage"
        >
          <span className="text-default-600">Powered by</span>
          <p className="text-primary">NextUI</p>
        </Link>
      </footer>
    </div>
    </PHProvider>
  )
}

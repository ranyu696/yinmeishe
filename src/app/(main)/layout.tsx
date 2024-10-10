import { Suspense } from 'react'
import Banner from '../_components/banner'
import BottomLinks from '../_components/BottomLinks'
import BottomTags from '../_components/BottomTags'
import Categor from '../_components/Categor'
import Footer from '../_components/Footer'
import Heads from '../_components/Heads';

import IconAds from '../_components/IconAds'
import PostHogPageView from '../_components/posthog/PostHogPageView'
import { PHProvider } from '../_components/posthog/providers'
import TopLinks from '../_components/TopLinks'
import TopTags from '../_components/TopTags'

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
            <Categor />
            <IconAds />
            <TopLinks />
            <TopTags />
          </header>
          <main className="w-full flex-1 p-2">{children}</main>
          <IconAds />
          <BottomLinks />
          <BottomTags />
        </div>
        <Footer />
      </div>
    </PHProvider>
  )
}

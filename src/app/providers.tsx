'use client'

import { NextUIProvider } from '@nextui-org/system'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { TRPCReactProvider } from '~/trpc/react'

export interface ProvidersProps {
  children: React.ReactNode
  themeProps?: ThemeProviderProps
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter()

  return (
    <NextUIProvider navigate={(path) => router.push(path)}>
      {' '}
      {/* Wrap router.push in an arrow function */}
      <NextThemesProvider
        defaultTheme="system"
        attribute="class"
        {...themeProps}
      >
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </NextThemesProvider>
    </NextUIProvider>
  )
}

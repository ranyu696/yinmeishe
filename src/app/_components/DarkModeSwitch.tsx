'use client'

import { Switch } from '@nextui-org/react'
import { useTheme } from 'next-themes'

export const DarkModeSwitch = () => {
  const { theme, setTheme } = useTheme()

  return (
    <Switch
      isSelected={theme === 'dark'}
      onValueChange={(isSelected) => setTheme(isSelected ? 'dark' : 'light')}
    />
  )
}

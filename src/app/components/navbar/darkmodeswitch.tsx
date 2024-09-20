import { Switch } from '@nextui-org/react'
import { useTheme as useNextTheme } from 'next-themes'

export const DarkModeSwitch = () => {
  const { setTheme, resolvedTheme } = useNextTheme()
  return (
    <Switch
      isSelected={resolvedTheme === 'dark' ? true : false}
      onValueChange={(e) => setTheme(e ? 'dark' : 'light')}
    />
  )
}

import { Copyright, Mail, Send } from 'lucide-react'
import Link from 'next/link'
import { api } from '~/trpc/server'

interface Settings {
  contactEmail?: string
  copyright?: string
  telegram?: string
}

const Footer = async () => {
  const settings: Settings = await api.systemSettings.getByCategory('basic')

  return (
    <footer className="mx-auto mt-6 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {settings.contactEmail && (
            <div className="flex items-center gap-2">
              <Mail className="size-5 text-gray-600 dark:text-gray-400" />
              <Link
                href={`mailto:${settings.contactEmail}`}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {settings.contactEmail}
              </Link>
            </div>
          )}
          {settings.copyright && (
            <div className="flex items-center gap-2">
              <Copyright className="size-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {settings.copyright}
              </span>
            </div>
          )}
          {settings.telegram && (
            <div className="flex items-center gap-2">
              <Send className="size-5 text-gray-600 dark:text-gray-400" />
              <Link
                href={settings.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Telegram
              </Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

export default Footer

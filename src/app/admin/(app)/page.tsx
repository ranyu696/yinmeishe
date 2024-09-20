import { redirect } from 'next/navigation'
import { Content } from '~/app/components/home/content'
import { auth } from '~/server/auth'

export default async function Home() {
  const session = await auth()

  if (!session || session.user?.role !== 'admin') {
    redirect('/admin-login')
  }

  return <Content />
}

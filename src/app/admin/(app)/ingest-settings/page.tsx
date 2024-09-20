import { IngestSettingsForm } from '~/app/components/ingest-settings/IngestSettingsForm'
import { api } from '~/trpc/server'

export default async function IngestSettingsPage() {
  const settings = await api.ingestSettings.getAll()

  return <IngestSettingsForm initialSettings={settings} />
}

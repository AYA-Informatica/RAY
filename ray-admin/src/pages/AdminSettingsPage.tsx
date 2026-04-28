import { useState } from 'react'
import { Save, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Input, Badge } from '@/components/atoms'
import { PageHeader } from '@/components/organisms/AdminLayout'

interface Toggle {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

const Toggle = ({ checked, onChange, label }: Toggle) => (
  <label className="flex items-center justify-between cursor-pointer">
    <span className="text-sm font-sans text-text-primary">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-surface-modal border border-border'
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  </label>
)

export const AdminSettingsPage = () => {
  const [requireApproval, setRequireApproval] = useState(false)
  const [allowRegistrations, setAllowRegistrations] = useState(true)
  const [minPriceFlag, setMinPriceFlag] = useState('100')
  const [maxListingsPerDay, setMaxListingsPerDay] = useState('10')
  const [featuredPrice, setFeaturedPrice] = useState('499')
  const [topAdPrice, setTopAdPrice] = useState('999')
  const [eliteSellerPrice, setEliteSellerPrice] = useState('9900')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Save to API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully')
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const mockAdmins = [
    { id: '1', email: 'admin@ray.rw', role: 'admin' },
    { id: '2', email: 'moderator@ray.rw', role: 'moderator' },
  ]

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Settings"
        subtitle="Configure platform settings and moderation rules"
        actions={
          <Button size="sm" onClick={handleSave} loading={isSaving} leftIcon={<Save className="w-3.5 h-3.5" />}>
            Save Changes
          </Button>
        }
      />

      <div className="flex-1 p-8 flex flex-col gap-8 max-w-4xl">
        {/* App Config */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-display font-bold text-text-primary">App Configuration</h2>
          <div className="flex flex-col gap-4 p-5 bg-surface-card rounded-2xl border border-border">
            <Toggle
              checked={requireApproval}
              onChange={setRequireApproval}
              label="Require listing approval before going live"
            />
            <Toggle
              checked={allowRegistrations}
              onChange={setAllowRegistrations}
              label="Allow new user registrations"
            />
          </div>
        </section>

        {/* Moderation */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-display font-bold text-text-primary">Moderation</h2>
          <div className="flex flex-col gap-4 p-5 bg-surface-card rounded-2xl border border-border">
            <Input
              label="Auto-flag listings with price below (Rwf)"
              type="number"
              value={minPriceFlag}
              onChange={(e) => setMinPriceFlag(e.target.value)}
            />
            <Input
              label="Max listings per user per day"
              type="number"
              value={maxListingsPerDay}
              onChange={(e) => setMaxListingsPerDay(e.target.value)}
            />
          </div>
        </section>

        {/* Featured Pricing */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-display font-bold text-text-primary">Featured Pricing</h2>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Featured Listing (Rwf)"
              type="number"
              value={featuredPrice}
              onChange={(e) => setFeaturedPrice(e.target.value)}
            />
            <Input
              label="Top Ad (Rwf)"
              type="number"
              value={topAdPrice}
              onChange={(e) => setTopAdPrice(e.target.value)}
            />
            <Input
              label="Elite Seller (Rwf)"
              type="number"
              value={eliteSellerPrice}
              onChange={(e) => setEliteSellerPrice(e.target.value)}
            />
          </div>
        </section>

        {/* Admin Users */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-display font-bold text-text-primary">Admin Users</h2>
          <div className="bg-surface-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary font-sans uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-text-secondary font-sans uppercase">
                    Role
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-text-secondary font-sans uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockAdmins.map((admin) => (
                  <tr key={admin.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-sm text-text-primary font-sans">{admin.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={admin.role === 'admin' ? 'primary' : 'muted'}>{admin.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                        title="Remove access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

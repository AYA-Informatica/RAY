import { useEffect, useState, useCallback } from 'react'
import {
  useReactTable, getCoreRowModel, flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import {
  Search, RefreshCw, CheckCircle2, Ban, ShieldCheck,
  ExternalLink, ChevronDown,
} from 'lucide-react'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Button, Badge, Skeleton } from '@/components/atoms'
import { PageHeader } from '@/components/organisms/AdminLayout'
import { adminUsersApi } from '@/services/api'
import type { User, VerificationStatus } from '@/types'

const VERIFICATION_BADGE: Record<VerificationStatus, { label: string; variant: 'success' | 'warning' | 'muted' | 'primary' }> = {
  none:   { label: 'Unverified', variant: 'muted' },
  phone:  { label: 'Phone', variant: 'warning' },
  id:     { label: 'ID Verified', variant: 'success' },
  dealer: { label: 'Dealer', variant: 'primary' },
}

const columnHelper = createColumnHelper<User>()

export const AdminUsersPage = () => {
  const [users, setUsers]       = useState<User[]>([])
  const [total, setTotal]       = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState<'all' | 'banned' | 'unverified' | 'dealers'>('all')
  const [page, setPage]         = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const PAGE_SIZE = 25

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_SIZE),
      }
      if (search) params.q = search
      if (filter !== 'all') params.filter = filter
      const res = await adminUsersApi.getAll(params)
      setUsers(res.users)
      setTotal(res.total)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }, [page, search, filter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const doAction = async (id: string, action: 'ban' | 'unban' | 'verify', label: string) => {
    setActionLoading(id + action)
    try {
      if (action === 'ban')    await adminUsersApi.ban(id, 'Violates terms of service')
      if (action === 'unban')  await adminUsersApi.unban(id)
      if (action === 'verify') await adminUsersApi.verify(id)
      toast.success(`User ${label}`)
      fetchUsers()
    } catch {
      toast.error(`Failed to ${label} user`)
    } finally {
      setActionLoading(null)
    }
  }

  const columns = [
    columnHelper.accessor('avatar', {
      header: '',
      cell: (info) => (
        <div className="w-9 h-9 rounded-full bg-surface-modal overflow-hidden flex-shrink-0">
          {info.getValue()
            ? <img src={info.getValue()} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-text-muted text-xs font-bold">
                {info.row.original.displayName[0]}
              </div>}
        </div>
      ),
      enableSorting: false,
    }),
    columnHelper.accessor('displayName', {
      header: 'Name',
      cell: (info) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-text-primary font-sans">{info.getValue()}</span>
          <span className="text-xs text-text-muted font-sans">{info.row.original.phone}</span>
        </div>
      ),
    }),
    columnHelper.accessor('location', {
      header: 'Location',
      cell: (info) => (
        <span className="text-xs text-text-secondary font-sans">
          {info.getValue()?.displayLabel ?? '—'}
        </span>
      ),
      enableSorting: false,
    }),
    columnHelper.accessor('verificationStatus', {
      header: 'Verification',
      cell: (info) => {
        const v = VERIFICATION_BADGE[info.getValue()]
        return <Badge variant={v.variant}>{v.label}</Badge>
      },
    }),
    columnHelper.accessor('trustLevel', {
      header: 'Trust',
      cell: (info) => (
        <div className="flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={clsx(
                'w-2 h-2 rounded-full',
                i < info.getValue() ? 'bg-primary' : 'bg-border'
              )}
            />
          ))}
        </div>
      ),
    }),
    columnHelper.accessor('activeListings', {
      header: 'Listings',
      cell: (info) => (
        <span className="text-sm text-text-secondary font-sans">{info.getValue() ?? 0}</span>
      ),
    }),
    columnHelper.accessor('memberSince', {
      header: 'Joined',
      cell: (info) => (
        <span className="text-xs text-text-muted font-sans whitespace-nowrap">
          {format(new Date(info.getValue()), 'dd MMM yy')}
        </span>
      ),
    }),
    columnHelper.accessor('isBanned', {
      header: 'Status',
      cell: (info) => (
        info.getValue()
          ? <Badge variant="danger" dot>Banned</Badge>
          : <Badge variant="success" dot>Active</Badge>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const { id, isBanned, verificationStatus } = info.row.original
        const loading = !!actionLoading
        return (
          <div className="flex items-center gap-1">
            {verificationStatus === 'phone' && (
              <button
                onClick={() => doAction(id, 'verify', 'verified')}
                disabled={loading}
                className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors disabled:opacity-50"
                title="Verify user"
              >
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                const action = isBanned ? 'unban' : 'ban'
                if (confirm(`${isBanned ? 'Unban' : 'Ban'} this user?`)) {
                  doAction(id, action, isBanned ? 'unbanned' : 'banned')
                }
              }}
              disabled={loading}
              className={clsx(
                'p-1.5 rounded-lg transition-colors disabled:opacity-50',
                isBanned
                  ? 'text-success hover:bg-success/10'
                  : 'text-danger hover:bg-danger/10'
              )}
              title={isBanned ? 'Unban' : 'Ban user'}
            >
              {isBanned ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
            </button>
            <a
              href={`/profile/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-modal transition-colors"
              title="View profile"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  const FILTER_TABS = [
    { label: 'All Users', value: 'all' as const },
    { label: 'Banned', value: 'banned' as const },
    { label: 'Unverified', value: 'unverified' as const },
    { label: 'Dealers', value: 'dealers' as const },
  ]

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Users"
        subtitle={`${total.toLocaleString()} registered users`}
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchUsers}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        }
      />

      <div className="flex-1 p-6 flex flex-col gap-4">

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 pr-4 py-2 bg-surface-modal border border-border rounded-xl text-sm font-sans text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary w-72"
            />
          </div>

          <div className="flex gap-1 p-1 bg-surface-modal rounded-xl border border-border">
            {FILTER_TABS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => { setFilter(value); setPage(1) }}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all',
                  filter === value
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-border">
                    {hg.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3 text-left text-xs font-bold text-text-secondary font-sans uppercase tracking-wider whitespace-nowrap">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        {Array.from({ length: columns.length }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-5 rounded-md" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : table.getRowModel().rows.length === 0
                  ? (
                      <tr>
                        <td colSpan={columns.length} className="px-4 py-16 text-center text-text-secondary font-sans text-sm">
                          No users found
                        </td>
                      </tr>
                    )
                  : table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className={clsx(
                          'border-b border-border last:border-0 hover:bg-surface-modal transition-colors',
                          row.original.isBanned && 'opacity-60'
                        )}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="px-4 py-3">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-text-muted font-sans">
                Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
              </p>
              <div className="flex items-center gap-1">
                <Button size="xs" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <span className="px-3 py-1 text-xs font-sans text-text-secondary">{page} / {Math.ceil(total / PAGE_SIZE)}</span>
                <Button size="xs" variant="secondary" disabled={page >= Math.ceil(total / PAGE_SIZE)} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

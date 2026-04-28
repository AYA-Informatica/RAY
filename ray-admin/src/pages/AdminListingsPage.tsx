import { useEffect, useState, useCallback } from 'react'
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  flexRender, createColumnHelper, type SortingState,
} from '@tanstack/react-table'
import { Search, RefreshCw, CheckCircle, XCircle, Trash2, Star, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Button, Badge, Input, Skeleton } from '@/components/atoms'
import { PageHeader } from '@/components/organisms/AdminLayout'
import { adminListingsApi } from '@/services/api'
import type { Listing, ListingStatus } from '@/types'

const STATUS_BADGE: Record<ListingStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'muted' | 'primary' }> = {
  active:         { label: 'Active',          variant: 'success' },
  pending_review: { label: 'Pending Review',  variant: 'warning' },
  rejected:       { label: 'Rejected',        variant: 'danger' },
  sold:           { label: 'Sold',            variant: 'muted' },
  expired:        { label: 'Expired',         variant: 'muted' },
}

const columnHelper = createColumnHelper<Listing>()

export const AdminListingsPage = () => {
  const [listings, setListings] = useState<Listing[]>([])
  const [total, setTotal]       = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [sorting, setSorting]   = useState<SortingState>([])
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all')
  const [page, setPage]         = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const PAGE_SIZE = 20

  const fetchListings = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: String(PAGE_SIZE),
      }
      if (search) params.q = search
      if (statusFilter !== 'all') params.status = statusFilter
      const res = await adminListingsApi.getAll(params)
      setListings(res.listings)
      setTotal(res.total)
    } catch (err) {
      toast.error('Failed to load listings')
    } finally {
      setIsLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchListings() }, [fetchListings])

  const handleAction = async (
    id: string,
    action: 'approve' | 'reject' | 'delete' | 'feature',
    label: string
  ) => {
    setActionLoading(id + action)
    try {
      if (action === 'approve')  await adminListingsApi.approve(id)
      if (action === 'reject')   await adminListingsApi.reject(id, 'Violates community guidelines')
      if (action === 'delete')   await adminListingsApi.delete(id)
      if (action === 'feature')  await adminListingsApi.feature(id, true)
      toast.success(`Listing ${label}`)
      fetchListings()
    } catch {
      toast.error(`Failed to ${label} listing`)
    } finally {
      setActionLoading(null)
    }
  }

  const columns = [
    columnHelper.accessor('coverImage', {
      header: '',
      cell: (info) => (
        <img
          src={info.getValue()}
          alt=""
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
      ),
      enableSorting: false,
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => (
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-semibold text-text-primary font-sans truncate max-w-[200px]">
            {info.getValue()}
          </span>
          <span className="text-xs text-text-muted font-sans capitalize">
            {info.row.original.category}
          </span>
        </div>
      ),
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: (info) => (
        <span className="text-sm font-semibold text-primary font-sans whitespace-nowrap">
          Rwf {info.getValue().toLocaleString()}
        </span>
      ),
    }),
    columnHelper.accessor('seller', {
      header: 'Seller',
      cell: (info) => (
        <span className="text-sm text-text-secondary font-sans">
          {info.getValue().displayName}
        </span>
      ),
      enableSorting: false,
    }),
    columnHelper.accessor('location', {
      header: 'Location',
      cell: (info) => (
        <span className="text-xs text-text-muted font-sans">
          {info.getValue().displayLabel}
        </span>
      ),
      enableSorting: false,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const s = STATUS_BADGE[info.getValue()]
        return <Badge variant={s.variant}>{s.label}</Badge>
      },
    }),
    columnHelper.accessor('views', {
      header: 'Views',
      cell: (info) => (
        <span className="text-sm text-text-secondary font-sans">{info.getValue().toLocaleString()}</span>
      ),
    }),
    columnHelper.accessor('postedAt', {
      header: 'Posted',
      cell: (info) => (
        <span className="text-xs text-text-muted font-sans whitespace-nowrap">
          {format(new Date(info.getValue()), 'dd MMM yy')}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const id = info.row.original.id
        const status = info.row.original.status
        return (
          <div className="flex items-center gap-1">
            {status === 'pending_review' && (
              <>
                <button
                  onClick={() => handleAction(id, 'approve', 'approved')}
                  disabled={!!actionLoading}
                  className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors disabled:opacity-50"
                  title="Approve"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAction(id, 'reject', 'rejected')}
                  disabled={!!actionLoading}
                  className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                  title="Reject"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => handleAction(id, 'feature', 'featured')}
              disabled={!!actionLoading || info.row.original.isFeatured}
              className="p-1.5 rounded-lg text-warning hover:bg-warning/10 transition-colors disabled:opacity-50"
              title="Feature"
            >
              <Star className={clsx('w-4 h-4', info.row.original.isFeatured && 'fill-warning')} />
            </button>
            <a
              href={`/listing/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-modal transition-colors"
              title="View listing"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => {
                if (confirm('Delete this listing? This cannot be undone.')) {
                  handleAction(id, 'delete', 'deleted')
                }
              }}
              disabled={!!actionLoading}
              className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      },
    }),
  ]

  const table = useReactTable({
    data: listings,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / PAGE_SIZE),
  })

  const STATUS_TABS: { label: string; value: ListingStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Pending', value: 'pending_review' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Sold', value: 'sold' },
  ]

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Listings"
        subtitle={`${total.toLocaleString()} total listings`}
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchListings}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        }
      />

      <div className="flex-1 p-6 flex flex-col gap-4">

        {/* Filters row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search listings..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 pr-4 py-2 bg-surface-modal border border-border rounded-xl text-sm font-sans text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary w-64"
            />
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 p-1 bg-surface-modal rounded-xl border border-border">
            {STATUS_TABS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => { setStatusFilter(value); setPage(1) }}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all',
                  statusFilter === value
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
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-bold text-text-secondary font-sans uppercase tracking-wider whitespace-nowrap"
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            className={clsx(
                              'flex items-center gap-1',
                              header.column.getCanSort() && 'cursor-pointer hover:text-text-primary transition-colors'
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <span className="text-text-muted">
                                {header.column.getIsSorted() === 'asc'
                                  ? <ChevronUp className="w-3 h-3" />
                                  : header.column.getIsSorted() === 'desc'
                                  ? <ChevronDown className="w-3 h-3" />
                                  : <ChevronDown className="w-3 h-3 opacity-30" />}
                              </span>
                            )}
                          </button>
                        )}
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
                          No listings found
                        </td>
                      </tr>
                    )
                  : table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-border last:border-0 hover:bg-surface-modal transition-colors"
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
                <Button
                  size="xs"
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-xs font-sans text-text-secondary">
                  {page} / {Math.ceil(total / PAGE_SIZE)}
                </span>
                <Button
                  size="xs"
                  variant="secondary"
                  disabled={page >= Math.ceil(total / PAGE_SIZE)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

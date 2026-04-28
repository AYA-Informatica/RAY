import { useEffect, useState, useCallback } from 'react'
import { clsx } from 'clsx'
import { format } from 'date-fns'
import { Flag, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button, Badge, Skeleton } from '@/components/atoms'
import { PageHeader } from '@/components/organisms/AdminLayout'
import { adminReportsApi } from '@/services/api'
import type { Report } from '@/services/api'

const STATUS_META = {
  pending:   { label: 'Pending',   variant: 'warning' as const },
  resolved:  { label: 'Resolved',  variant: 'success' as const },
  dismissed: { label: 'Dismissed', variant: 'muted' as const },
}

const REASON_LABELS: Record<string, string> = {
  scam:         '🚨 Scam / Fraud',
  spam:         '📨 Spam',
  fake:         '🎭 Fake listing',
  inappropriate: '🔞 Inappropriate content',
  wrong_price:  '💰 Wrong price',
  duplicate:    '📋 Duplicate',
  other:        '❓ Other',
}

export const AdminReportsPage = () => {
  const [reports, setReports]   = useState<Report[]>([])
  const [total, setTotal]       = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'pending' | 'resolved' | 'dismissed' | 'all'>('pending')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await adminReportsApi.getAll(statusFilter === 'all' ? undefined : statusFilter)
      setReports(res.reports)
      setTotal(res.total)
    } catch {
      toast.error('Failed to load reports')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { fetchReports() }, [fetchReports])

  const doAction = async (id: string, action: 'resolve' | 'dismiss', payload?: string) => {
    setActionLoading(id + action)
    try {
      if (action === 'resolve')  await adminReportsApi.resolve(id, payload ?? 'warning_issued')
      if (action === 'dismiss')  await adminReportsApi.dismiss(id)
      toast.success(`Report ${action === 'resolve' ? 'resolved' : 'dismissed'}`)
      fetchReports()
    } catch {
      toast.error('Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const TABS = [
    { label: 'Pending', value: 'pending' as const },
    { label: 'Resolved', value: 'resolved' as const },
    { label: 'Dismissed', value: 'dismissed' as const },
    { label: 'All', value: 'all' as const },
  ]

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Reports & Moderation"
        subtitle={`${total} ${statusFilter === 'all' ? 'total' : statusFilter} reports`}
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchReports}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        }
      />

      <div className="flex-1 p-6 flex flex-col gap-4">

        {/* Status tabs */}
        <div className="flex gap-1 p-1 bg-surface-modal rounded-xl border border-border self-start">
          {TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-semibold font-sans transition-all',
                statusFilter === value
                  ? 'bg-primary text-white'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Reports list */}
        <div className="flex flex-col gap-3">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))
            : reports.length === 0
            ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Flag className="w-10 h-10 text-text-muted" />
                  <p className="text-sm text-text-secondary font-sans">No {statusFilter !== 'all' ? statusFilter : ''} reports</p>
                </div>
              )
            : reports.map((report) => {
                const isExpanded = expandedId === report.id
                const meta = STATUS_META[report.status]
                const isActioning = !!actionLoading?.startsWith(report.id)

                return (
                  <div
                    key={report.id}
                    className="bg-surface-card rounded-2xl border border-border overflow-hidden"
                  >
                    {/* Report header */}
                    <button
                      className="w-full flex items-start gap-4 p-4 text-left hover:bg-surface-modal transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    >
                      {/* Type icon */}
                      <div className={clsx(
                        'p-2 rounded-xl flex-shrink-0 mt-0.5',
                        report.type === 'listing' ? 'bg-primary/10 text-primary' : 'bg-warning/10 text-warning'
                      )}>
                        <Flag className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-text-primary font-sans capitalize">
                            {report.type} reported
                          </span>
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </div>
                        <p className="text-sm text-text-secondary font-sans mt-0.5">
                          {REASON_LABELS[report.reason] ?? report.reason}
                        </p>
                        <p className="text-xs text-text-muted font-sans mt-1">
                          Reported {format(new Date(report.createdAt), 'dd MMM yyyy HH:mm')}
                          {' · '}ID: {report.id.slice(0, 8)}
                        </p>
                      </div>

                      {/* Quick action buttons (pending only) */}
                      {report.status === 'pending' && (
                        <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="xs"
                            variant="success"
                            onClick={() => doAction(report.id, 'resolve', 'content_removed')}
                            loading={isActioning}
                            leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                          >
                            Resolve
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => doAction(report.id, 'dismiss')}
                            loading={isActioning}
                            leftIcon={<XCircle className="w-3.5 h-3.5" />}
                          >
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-border p-4 flex flex-col gap-4 bg-surface-modal/50 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4 text-sm font-sans">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-text-muted uppercase font-semibold tracking-wider">Type</span>
                            <span className="text-text-primary capitalize">{report.type}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-text-muted uppercase font-semibold tracking-wider">Target ID</span>
                            <div className="flex items-center gap-2">
                              <span className="text-text-primary font-mono text-xs">{report.targetId}</span>
                              <a
                                href={report.type === 'listing' ? `/listing/${report.targetId}` : `/profile/${report.targetId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary-dark"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-text-muted uppercase font-semibold tracking-wider">Reported By</span>
                            <span className="text-text-primary">{report.reportedBy}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-text-muted uppercase font-semibold tracking-wider">Reason</span>
                            <span className="text-text-primary">{REASON_LABELS[report.reason] ?? report.reason}</span>
                          </div>
                        </div>

                        {/* Action buttons for expanded view */}
                        {report.status === 'pending' && (
                          <div className="flex gap-2 pt-2 border-t border-border">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => doAction(report.id, 'resolve', 'content_removed')}
                              loading={isActioning}
                              leftIcon={<CheckCircle className="w-4 h-4" />}
                            >
                              Remove Content
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => doAction(report.id, 'resolve', 'user_banned')}
                              loading={isActioning}
                            >
                              Ban User
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => doAction(report.id, 'resolve', 'warning_issued')}
                              loading={isActioning}
                            >
                              Issue Warning
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => doAction(report.id, 'dismiss')}
                              loading={isActioning}
                            >
                              Dismiss
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
        </div>
      </div>
    </div>
  )
}

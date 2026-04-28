import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/components/organisms/AdminLayout'
import { AdminGuard } from '@/guards/AdminGuard'
import { AdminLoginPage } from '@/pages/AdminLoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { AdminListingsPage } from '@/pages/AdminListingsPage'
import { AdminUsersPage } from '@/pages/AdminUsersPage'
import { AdminReportsPage } from '@/pages/AdminReportsPage'
import { AdminAnalyticsPage } from '@/pages/AdminAnalyticsPage'
import { AdminSettingsPage } from '@/pages/AdminSettingsPage'
import { AdminListingDetailPage } from '@/pages/AdminListingDetailPage'

export const AdminRouter = () => (
  <Routes>
    <Route path="/admin/login" element={<AdminLoginPage />} />

    <Route
      path="/admin"
      element={
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      }
    >
      <Route index element={<Navigate to="/admin/dashboard" replace />} />

      <Route
        path="dashboard"
        element={
          <AdminGuard allowedRoles={['admin']}>
            <DashboardPage />
          </AdminGuard>
        }
      />
      <Route
        path="listings"
        element={
          <AdminGuard allowedRoles={['admin', 'moderator']}>
            <AdminListingsPage />
          </AdminGuard>
        }
      />
      <Route
        path="users"
        element={
          <AdminGuard allowedRoles={['admin', 'support']}>
            <AdminUsersPage />
          </AdminGuard>
        }
      />
      <Route
        path="reports"
        element={
          <AdminGuard allowedRoles={['admin', 'moderator', 'support']}>
            <AdminReportsPage />
          </AdminGuard>
        }
      />
      <Route
        path="analytics"
        element={
          <AdminGuard allowedRoles={['admin']}>
            <AdminAnalyticsPage />
          </AdminGuard>
        }
      />
      <Route
        path="settings"
        element={
          <AdminGuard allowedRoles={['admin']}>
            <AdminSettingsPage />
          </AdminGuard>
        }
      />
      <Route
        path="listings/:id"
        element={
          <AdminGuard allowedRoles={['admin', 'moderator']}>
            <AdminListingDetailPage />
          </AdminGuard>
        }
      />

      {/* Catch-all inside admin */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Route>

    {/* Root redirect */}
    <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
  </Routes>
)

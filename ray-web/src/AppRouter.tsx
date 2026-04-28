import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'

import { HomePage } from '@/pages/HomePage'
import { SearchResultsPage } from '@/pages/SearchResultsPage'
import { ListingDetailPage } from '@/pages/ListingDetailPage'
import { PostAdPage } from '@/pages/PostAdPage'
import { AuthPage } from '@/pages/AuthPage'
import { ChatListPage, ChatDetailPage } from '@/pages/ChatPages'
import { AccountPage } from '@/pages/AccountPage'
import { SellerProfilePage } from '@/pages/SellerProfilePage'
import { CategoryPage } from '@/pages/CategoryPage'
import { NotFoundPage, ProfileSetupPage } from '@/pages/misc'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { MyListingsPage } from '@/pages/MyListingsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { PremiumPage } from '@/pages/PremiumPage'

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public routes — wrapped in Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/listing/:id" element={<ListingDetailPage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/profile/:id" element={<SellerProfilePage />} />

        {/* Protected routes */}
        <Route
          path="/post"
          element={<ProtectedRoute><PostAdPage /></ProtectedRoute>}
        />
        <Route
          path="/chat"
          element={<ProtectedRoute><ChatListPage /></ProtectedRoute>}
        />
        <Route
          path="/chat/:id"
          element={<ProtectedRoute><ChatDetailPage /></ProtectedRoute>}
        />
        <Route
          path="/account"
          element={<ProtectedRoute><AccountPage /></ProtectedRoute>}
        />
        <Route
          path="/account/listings"
          element={<ProtectedRoute><AccountPage /></ProtectedRoute>}
        />
        <Route
          path="/account/saved"
          element={<ProtectedRoute><AccountPage /></ProtectedRoute>}
        />
        <Route
          path="/account/notifications"
          element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}
        />
        <Route
          path="/account/settings"
          element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
        />
        <Route
          path="/my-listings"
          element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>}
        />
        <Route path="/premium" element={<PremiumPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Routes WITHOUT Layout (full-screen) */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/setup-profile" element={<ProfileSetupPage />} />

      {/* Redirect legacy paths */}
      <Route path="/listings" element={<Navigate to="/search" replace />} />
    </Routes>
  )
}

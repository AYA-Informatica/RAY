// firebase-messaging-sw.js
// Place this file in ray-web/public/
// This service worker handles background push notifications.

importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js')

// These values must match ray-web/.env
// They are intentionally public — Firebase config is not a secret.
firebase.initializeApp({
  apiKey:            self.__WB_FIREBASE_API_KEY__        || 'YOUR_API_KEY',
  authDomain:        self.__WB_FIREBASE_AUTH_DOMAIN__    || 'your-project.firebaseapp.com',
  projectId:         self.__WB_FIREBASE_PROJECT_ID__     || 'your-project-id',
  storageBucket:     self.__WB_FIREBASE_STORAGE_BUCKET__ || 'your-project.appspot.com',
  messagingSenderId: self.__WB_FIREBASE_SENDER_ID__      || 'YOUR_SENDER_ID',
  appId:             self.__WB_FIREBASE_APP_ID__         || 'YOUR_APP_ID',
})

const messaging = firebase.messaging()

// ─── Background message handler ──────────────
// Fires when the app is in the background or closed.
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload)

  const { title, body, imageUrl } = payload.notification ?? {}
  const data = payload.data ?? {}

  self.registration.showNotification(title ?? 'RAY', {
    body:  body ?? 'You have a new notification',
    icon:  '/ray-icon-192.png',
    badge: '/ray-badge-72.png',
    image: imageUrl,
    data,
    actions: [
      { action: 'open', title: 'Open RAY' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    requireInteraction: false,
    silent: false,
  })
})

// ─── Notification click handler ───────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const data          = event.notification.data ?? {}
  const { type, conversationId, listingId } = data

  let url = '/'
  if (type === 'new_message' && conversationId) url = `/chat/${conversationId}`
  if (type === 'listing_activity' && listingId)  url = `/listing/${listingId}`
  if (type === 'listing_expiring' && listingId)  url = `/listing/${listingId}`

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing tab if open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            client.navigate(url)
            return
          }
        }
        // Open new tab
        if (clients.openWindow) return clients.openWindow(url)
      })
  )
})

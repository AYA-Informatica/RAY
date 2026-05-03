// firebase-messaging-sw.js
// Place this file in ray-web/public/
// This service worker handles background push notifications.

importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js')

// Firebase config is intentionally public — these values are safe to commit.
// See: https://firebase.google.com/docs/projects/api-keys
// The actual security is enforced by Firebase Security Rules, not by hiding the config.
const firebaseConfig = {
  apiKey:            "REPLACE_WITH_ACTUAL_VALUE",
  authDomain:        "REPLACE_WITH_ACTUAL_VALUE",
  projectId:         "REPLACE_WITH_ACTUAL_VALUE",
  storageBucket:     "REPLACE_WITH_ACTUAL_VALUE",
  messagingSenderId: "REPLACE_WITH_ACTUAL_VALUE",
  appId:             "REPLACE_WITH_ACTUAL_VALUE",
}

firebase.initializeApp(firebaseConfig)

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

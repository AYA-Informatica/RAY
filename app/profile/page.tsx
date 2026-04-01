'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/lib/store';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!user?.phone) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user?.phone) {
    return null;
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user.phone.slice(-2).toUpperCase();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="p-6 space-y-6">
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarFallback className="text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold text-gray-900">{user.name || 'User'}</h1>
            <p className="text-gray-600 text-sm mt-1">{user.phone}</p>
          </div>

          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Location</p>
              <p className="text-gray-900 mt-1">{user.location || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Member Since</p>
              <p className="text-gray-900 mt-1">
                {user.joinedAt
                  ? new Date(user.joinedAt).toLocaleDateString()
                  : 'Today'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
              <p className="text-green-600 font-medium mt-1">✓ Verified</p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Logout
          </Button>

          <Button
            onClick={() => router.push('/')}
            className="w-full"
            size="lg"
          >
            Back to Home
          </Button>
        </Card>
      </div>
    </div>
  );
}

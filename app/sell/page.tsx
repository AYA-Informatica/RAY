'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store';
import { Plus } from 'lucide-react';

export default function SellPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.phone) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user?.phone) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="outline" onClick={() => router.push('/')} className="mb-6">
          ← Back to Home
        </Button>

        <Card className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Plus className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Post a Listing</h1>
            <p className="text-gray-600">
              Share your item with thousands of buyers in Kigali
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Coming soon! You&apos;ll be able to:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">✓</span>
                <span>Upload photos of your item</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">✓</span>
                <span>Set your price and negotiate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">✓</span>
                <span>Select category and condition</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">✓</span>
                <span>Track views and interest from buyers</span>
              </li>
            </ul>
          </div>

          <Button className="w-full" size="lg" disabled>
            Coming Soon
          </Button>
        </Card>
      </div>
    </div>
  );
}

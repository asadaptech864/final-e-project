'use client'
import { useSession } from 'next-auth/react'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import HeroSub from "@/components/shared/HeroSub";

const Profile = () => {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Please sign in to view your profile</p>
          <Link href="/signin" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
    <HeroSub
      title="Profile"
      description="View your profile information"
      badge="Profile"
    />
    <div className="min-h-screen bg-gray-50 dark:bg-dark py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white/20">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'Profile'}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon icon="ph:user" width={48} height={48} />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{session.user?.name}</h1>
                <p className="text-white/80">{session.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
              <Link
                href="/profile/edit"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Icon icon="ph:user-circle" width={16} height={16} />
                Edit Profile
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Full Name
                    </label>
                    <p className="text-gray-900 dark:text-white">{session.user?.name || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Email Address
                    </label>
                    <p className="text-gray-900 dark:text-white">{session.user?.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Phone Number
                    </label>
                    <p className="text-gray-900 dark:text-white">{session.user?.phone || 'Not provided'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Gender
                    </label>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {session.user?.gender || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                  Additional Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Address
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {session.user?.address || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Account Type
                    </label>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {session.user?.role || 'User'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Member Since
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {session.user?.createdAt 
                        ? new Date(session.user.createdAt).toLocaleDateString()
                        : 'Not available'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Quick Actions</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/profile/edit"
                  className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:user-circle" className="text-primary" width={20} height={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Edit Profile</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your information</p>
                  </div>
                </Link>

                <Link
                  href="/reservation-table"
                  className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:calendar" className="text-blue-600 dark:text-blue-400" width={20} height={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">My Reservations</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View booking history</p>
                  </div>
                </Link>

                <Link
                  href="/maintenance-requests"
                  className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:wrench" className="text-orange-600 dark:text-orange-400" width={20} height={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Maintenance</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Request services</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default Profile 
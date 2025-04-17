"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/app/components/dashboard/header"
import BottomNavigation from "@/app/components/dashboard/bottom-navigation"

export default function AdminProfile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== "admin") {
        router.push("/")
        return
      }
      setUser(parsedUser)
    } catch (e) {
      console.error("Error parsing user data:", e)
      router.push("/")
      return
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-poppins">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DashboardHeader />

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Profile</h1>
          <p className="text-gray-600 font-poppins">Manage your personal information</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 font-poppins mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 font-poppins mb-1">First Name</p>
                <p className="text-gray-900 font-poppins">{user?.firstName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-poppins mb-1">Last Name</p>
                <p className="text-gray-900 font-poppins">{user?.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-poppins mb-1">Email</p>
                <p className="text-gray-900 font-poppins">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-poppins mb-1">Company</p>
                <p className="text-gray-900 font-poppins">{user?.companyName}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-poppins mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 font-poppins mb-1">Role</p>
                <p className="text-gray-900 font-poppins capitalize">{user?.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-poppins mb-1">Account Status</p>
                <p className="text-green-600 font-poppins">Active</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import DashboardHeader from "@/app/components/dashboard/header"
import BottomNavigation from "@/app/components/dashboard/bottom-navigation"
import TransactionForm from "@/app/components/transactions/transaction-form"

export default function CreateTransaction() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem("user")
        if (!userData) {
          router.push("/admin/login")
          return
        }

        const parsedUser = JSON.parse(userData)
        if (parsedUser.role !== "admin") {
          router.push("/")
          return
        }
        setUser(parsedUser)
        setLoading(false)
      } catch (e) {
        console.error("Error checking authentication:", e)
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-poppins">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DashboardHeader />

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center mb-6">
          <Link href="/admin/transactions" className="mr-4 text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Create Transaction</h1>
            <p className="text-gray-600 font-poppins">Create a new financial transaction</p>
          </div>
        </div>

        {/* Transaction Form */}
        <TransactionForm mode="create" />
      </main>

      <BottomNavigation />
    </div>
  )
}

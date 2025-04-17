"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import DashboardHeader from "@/app/components/dashboard/header"
import BottomNavigation from "@/app/components/dashboard/bottom-navigation"
import TransactionForm from "@/app/components/transactions/transaction-form"
import { getTransactionById } from "@/app/actions/transaction-actions"
import { toast } from "@/hooks/use-toast"

export default function EditTransaction() {
  const router = useRouter()
  const params = useParams()
  const transactionId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [transaction, setTransaction] = useState<any>(null)

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

        // Fetch transaction data
        await fetchTransaction()
      } catch (e) {
        console.error("Error checking authentication:", e)
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [router, transactionId])

  const fetchTransaction = async () => {
    try {
      const response = await getTransactionById(transactionId)

      if (response.success) {
        setTransaction(response.transaction)
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch transaction",
          variant: "destructive",
        })
        router.push("/admin/transactions")
      }
    } catch (error) {
      console.error("Error fetching transaction:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching the transaction",
        variant: "destructive",
      })
      router.push("/admin/transactions")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-poppins">Loading transaction data...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Edit Transaction</h1>
            <p className="text-gray-600 font-poppins">
              Edit transaction <span className="font-medium">{transactionId}</span>
            </p>
          </div>
        </div>

        {/* Transaction Form */}
        <TransactionForm mode="edit" initialData={transaction} />
      </main>

      <BottomNavigation />
    </div>
  )
}

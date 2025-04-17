"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import DashboardHeader from "@/app/components/dashboard/header"
import BottomNavigation from "@/app/components/dashboard/bottom-navigation"
import { Toast } from "@/app/components/ui/toast"
import { getStaffMember } from "@/app/actions/staff-actions"

export default function EditPaymentPage() {
  const router = useRouter()
  const params = useParams()
  const staffId = Number.parseInt(params.id as string)
  const paymentId = Number.parseInt(params.paymentId as string)

  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<any>(null)
  const [formData, setFormData] = useState({
    periodStart: "",
    periodEnd: "",
    amount: "",
    datePaid: "",
    notes: "",
  })
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

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
    } catch (e) {
      console.error("Error parsing user data:", e)
      router.push("/")
      return
    }

    // Fetch staff data
    fetchStaffData()
    // In a real app, you would also fetch the payment data here
    // For now, we'll just simulate it with a timeout
    setTimeout(() => {
      setFormData({
        periodStart: "2023-01-01",
        periodEnd: "2023-01-31",
        amount: "5000",
        datePaid: "2023-02-05",
        notes: "Monthly salary payment",
      })
      setLoading(false)
    }, 1000)
  }, [router, staffId, paymentId])

  const fetchStaffData = async () => {
    try {
      const response = await getStaffMember(staffId)
      if (response.success) {
        setStaff(response.data)
      } else {
        setToast({ message: response.error || "Failed to fetch staff details", type: "error" })
        router.push("/admin/staff")
      }
    } catch (error) {
      console.error("Error fetching staff data:", error)
      setToast({ message: "An error occurred while fetching staff data", type: "error" })
      router.push("/admin/staff")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would call an API to update the payment
    setToast({ message: "Payment updated successfully", type: "success" })

    // Redirect after a short delay
    setTimeout(() => {
      router.push(`/admin/staff/payments/${staffId}`)
    }, 1500)
  }

  if (loading || !staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-poppins">Loading payment data...</p>
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
          <Link
            href={`/admin/staff/payments/${staffId}`}
            className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Edit Payment</h1>
            <p className="text-gray-600 font-poppins">Update payment details for {staff.name}</p>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="periodStart" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Period Start <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="periodStart"
                    name="periodStart"
                    value={formData.periodStart}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="periodEnd" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Period End <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="periodEnd"
                    name="periodEnd"
                    value={formData.periodEnd}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Amount ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-poppins">₹</span>
                  </div>
                  <input
                    type="text"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="datePaid" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Date Paid <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="datePaid"
                    name="datePaid"
                    value={formData.datePaid}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins"
                  placeholder="Add any notes about this payment..."
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <Link
                href={`/admin/staff/payments/${staffId}`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A86FF] text-sm font-medium font-poppins transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3A86FF] hover:bg-[#3A86FF]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A86FF] font-poppins transition-colors"
              >
                Update Payment
              </button>
            </div>
          </form>
        </div>
      </main>

      <BottomNavigation />

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

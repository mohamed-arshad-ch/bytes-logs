"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, CreditCard, DollarSign, Receipt, User } from "lucide-react"
import DashboardHeader from "@/app/components/dashboard/header"
import BottomNavigation from "@/app/components/dashboard/bottom-navigation"
import { Toast } from "@/app/components/ui/toast"
import { recordStaffPayment, getStaffMember } from "@/app/actions/staff-actions"
import { formatCurrency } from "@/lib/utils-currency"

// Staff type definition
type Staff = {
  id: number
  name: string
  email: string
  position: string
  join_date: string
  status: "active" | "inactive"
  avatar: string
  role: "admin" | "support" | "finance"
  payment_rate: number
}

export default function RecordStaffPayment() {
  const router = useRouter()
  const params = useParams()
  const staffId = Number.parseInt(params.id as string)

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState({
    amount: "",
    datePaid: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

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

    // Fetch staff details
    fetchStaffData()
  }, [router, staffId])

  const fetchStaffData = async () => {
    setLoading(true)
    try {
      const staffResponse = await getStaffMember(staffId)
      if (!staffResponse.success) {
        setToast({ message: staffResponse.error || "Failed to fetch staff details", type: "error" })
        router.push("/admin/staff")
        return
      }
      setStaff(staffResponse.data)
    } catch (error) {
      console.error("Error fetching staff data:", error)
      setToast({ message: "An error occurred while fetching staff data", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    // Validate amount
    if (!formData.amount) {
      newErrors.amount = "Amount is required"
    } else if (isNaN(Number.parseFloat(formData.amount)) || Number.parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number"
    }

    // Validate date paid
    if (!formData.datePaid) {
      newErrors.datePaid = "Payment date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const form = new FormData()
      form.append("staffId", staffId.toString())
      form.append("amount", formData.amount)
      form.append("datePaid", formData.datePaid)
      form.append("notes", formData.notes)

      const response = await recordStaffPayment(form)

      if (response.success) {
        setToast({ message: "Payment recorded successfully", type: "success" })
        // Redirect to staff payments page after a short delay
        setTimeout(() => {
          router.push(`/admin/staff/payments/${staffId}`)
        }, 2000)
      } else {
        setToast({ message: response.error || "Failed to record payment", type: "error" })
      }
    } catch (error) {
      console.error("Error recording payment:", error)
      setToast({ message: "An unexpected error occurred", type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateMonthlyAmount = (): number => {
    if (!staff) return 0
    // Assuming 160 hours per month (40 hours per week * 4 weeks)
    return staff.payment_rate * 160
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading || !staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-poppins">Loading staff data...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Record Payment</h1>
            <p className="text-gray-600 font-poppins">Add a new payment record for {staff.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form Card */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Amount Field */}
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                      Payment Amount *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <DollarSign className="h-5 w-5" />
                      </span>
                      <input
                        type="text"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleFormChange}
                        className={`pl-10 block w-full rounded-md border ${
                          errors.amount ? "border-red-300" : "border-gray-300"
                        } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent font-poppins`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.amount && <p className="mt-1 text-sm text-red-600 font-poppins">{errors.amount}</p>}
                  </div>

                  {/* Date Paid Field */}
                  <div>
                    <label htmlFor="datePaid" className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                      Payment Date *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <Calendar className="h-5 w-5" />
                      </span>
                      <input
                        type="date"
                        id="datePaid"
                        name="datePaid"
                        value={formData.datePaid}
                        onChange={handleFormChange}
                        className={`pl-10 block w-full rounded-md border ${
                          errors.datePaid ? "border-red-300" : "border-gray-300"
                        } py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent font-poppins`}
                      />
                    </div>
                    {errors.datePaid && <p className="mt-1 text-sm text-red-600 font-poppins">{errors.datePaid}</p>}
                  </div>

                  {/* Notes Field */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1 font-poppins">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      rows={4}
                      className="block w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:border-transparent font-poppins"
                      placeholder="Additional details about this payment..."
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#3A86FF] text-white rounded-md py-2 px-4 hover:bg-[#3A86FF]/90 focus:outline-none focus:ring-2 focus:ring-[#3A86FF] focus:ring-offset-2 transition-colors disabled:opacity-70 font-poppins"
                    >
                      {isSubmitting ? "Processing..." : "Record Payment"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Staff Info Card */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center mb-6">
                <img
                  src={staff.avatar || "/placeholder.svg"}
                  alt={staff.name}
                  className="w-16 h-16 rounded-full mr-4 bg-gray-200"
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 font-poppins">{staff.name}</h2>
                  <p className="text-gray-600 text-sm font-poppins">{staff.position}</p>
                  <div className="flex items-center mt-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        staff.status === "active" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                    <span className="text-xs text-gray-500 font-poppins capitalize">{staff.status}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center text-gray-600">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span className="text-sm font-poppins">Hourly Rate:</span>
                  </div>
                  <span className="font-medium text-gray-900 font-poppins">
                    {formatCurrency(staff.payment_rate)}/hr
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center text-gray-600">
                    <Receipt className="h-4 w-4 mr-2" />
                    <span className="text-sm font-poppins">Est. Monthly:</span>
                  </div>
                  <span className="font-medium text-gray-900 font-poppins">
                    {formatCurrency(calculateMonthlyAmount())}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span className="text-sm font-poppins">Role:</span>
                  </div>
                  <span className="font-medium text-gray-900 font-poppins capitalize">{staff.role}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm font-poppins">Joined:</span>
                  </div>
                  <span className="font-medium text-gray-900 font-poppins">{formatDate(staff.join_date)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium text-blue-900 mb-2 font-poppins">Payment Information</h3>
                  <p className="text-sm text-blue-800 font-poppins">
                    Enter the payment amount and date to record a new payment for this staff member. This will be added
                    to their payment history and included in financial reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

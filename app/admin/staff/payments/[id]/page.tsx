"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Edit,
  Eye,
  Plus,
  Trash2,
  X,
  FileText,
  User,
  Info,
  CreditCard,
  TrendingUp,
} from "lucide-react"
import DashboardHeader from "@/app/components/dashboard/header"
import BottomNavigation from "@/app/components/dashboard/bottom-navigation"
import { Toast } from "@/app/components/ui/toast"
import {
  getStaffMember,
  getStaffPaymentsList,
  getStaffTotalPaid,
  getStaffPaymentStatistics,
} from "@/app/actions/staff-actions"
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

// Payment type definition
type Payment = {
  id: number
  staff_id: number
  period_start?: string
  period_end?: string
  amount: number
  date_paid: string
  notes: string
}

export default function StaffPayments() {
  const router = useRouter()
  const params = useParams()
  const staffId = Number.parseInt(params.id as string)

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<Staff | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [totalPaid, setTotalPaid] = useState(0)
  const [paymentStats, setPaymentStats] = useState<{ month: string; total: number }[]>([])
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6)

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

    // Fetch staff and payment data
    fetchStaffData()
  }, [router, staffId])

  const fetchStaffData = async () => {
    setLoading(true)
    try {
      // Fetch staff details
      const staffResponse = await getStaffMember(staffId)
      if (!staffResponse.success) {
        setToast({ message: staffResponse.error || "Failed to fetch staff details", type: "error" })
        router.push("/admin/staff")
        return
      }
      setStaff(staffResponse.data)

      // Fetch staff payments
      const paymentsResponse = await getStaffPaymentsList(staffId)
      if (paymentsResponse.success) {
        setPayments(paymentsResponse.data)
      } else {
        setToast({ message: paymentsResponse.error || "Failed to fetch staff payments", type: "error" })
      }

      // Fetch total paid amount
      const totalPaidResponse = await getStaffTotalPaid(staffId)
      if (totalPaidResponse.success && totalPaidResponse.data !== undefined) {
        setTotalPaid(totalPaidResponse.data)
      } else {
        // Default to calculating from payments if API call fails
        setTotalPaid(0) // Will be calculated by calculateTotalPaid later
      }

      // Fetch payment statistics
      const statsResponse = await getStaffPaymentStatistics(staffId)
      if (statsResponse.success) {
        setPaymentStats(statsResponse.data)
      }
    } catch (error) {
      console.error("Error fetching staff data:", error)
      setToast({ message: "An error occurred while fetching staff data", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  // Calculate total amount paid from payments
  const calculateTotalPaid = () => {
    return payments.reduce((sum, payment) => {
      const amount = typeof payment.amount === "number" ? payment.amount : Number.parseFloat(payment.amount) || 0
      return sum + amount
    }, 0)
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentPayments = payments.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(payments.length / itemsPerPage)

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Handle payment actions
  const handleViewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment)
    setShowPaymentDetails(true)
  }

  const handleEditPayment = (id: number) => {
    router.push(`/admin/staff/payments/${staffId}/edit/${id}`)
  }

  const handleDeletePayment = (id: number) => {
    // In a real app, this would call an API to delete the payment
    console.log(`Delete payment ${id}`)
    setToast({ message: "Payment deletion is not implemented yet", type: "info" })
  }

  const handleRecordNewPayment = () => {
    router.push(`/admin/staff/payments/${staffId}/record`)
  }

  if (loading || !staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-poppins">Loading staff payment data...</p>
        </div>
      </div>
    )
  }

  // Calculate total amount from current payments
  const calculatedTotalPaid = calculateTotalPaid()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DashboardHeader />

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center mb-6">
          <Link href="/admin/staff" className="mr-4 text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Staff Payment Management</h1>
            <p className="text-gray-600 font-poppins">View and manage payments for {staff.name}</p>
          </div>
        </div>

        {/* Staff Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-start">
              <img
                src={staff.avatar || "/placeholder.svg"}
                alt={staff.name}
                className="w-20 h-20 rounded-full mr-4 bg-gray-200"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 font-poppins">{staff.name}</h2>
                <p className="text-gray-600 font-poppins">{staff.position}</p>
                <p className="text-gray-500 text-sm mt-1 font-poppins">{staff.email}</p>
                <p className="text-gray-500 text-sm font-poppins">Joined: {formatDate(staff.join_date)}</p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:ml-6 mt-4 md:mt-0">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 font-poppins mb-1">Total Paid</p>
                <p className="text-2xl font-semibold text-gray-900 font-poppins">
                  {formatCurrency(isNaN(calculatedTotalPaid) ? 0 : calculatedTotalPaid)}
                </p>
                <div className="flex items-center text-green-500 text-xs mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span className="font-poppins">{payments.length} payments</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 font-poppins mb-1">Payment Rate</p>
                <p className="text-2xl font-semibold text-gray-900 font-poppins">
                  {formatCurrency(staff.payment_rate)}/hr
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-500 font-poppins mb-1">Last Payment</p>
                <p className="text-2xl font-semibold text-gray-900 font-poppins">
                  {payments.length > 0 ? formatCurrency(payments[0].amount) : formatCurrency(0)}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-poppins">
                  {payments.length > 0 ? formatDate(payments[0].date_paid) : "No payments yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={handleRecordNewPayment}
            className="bg-[#3A86FF] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#3A86FF]/90 transition-colors font-poppins"
          >
            <Plus className="w-4 h-4" />
            Record New Payment
          </button>
        </div>

        {/* Payments Card Grid */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 font-poppins mb-4">Payment Records</h3>

          {currentPayments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1 font-poppins">No payment records found</h3>
                <p className="text-gray-500 font-poppins mb-4">Start by recording a payment for this staff member</p>
                <button
                  onClick={handleRecordNewPayment}
                  className="bg-[#3A86FF] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#3A86FF]/90 transition-colors font-poppins"
                >
                  <Plus className="w-4 h-4" />
                  Record First Payment
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900 font-poppins text-lg">Payment #{payment.id}</h3>
                        <p className="text-gray-600 text-sm font-poppins">Paid on: {formatDate(payment.date_paid)}</p>
                      </div>
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium font-poppins">
                        Paid
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span className="text-sm font-poppins">Amount:</span>
                        </div>
                        <span className="font-bold text-gray-900 font-poppins">{formatCurrency(payment.amount)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm font-poppins">Date Paid:</span>
                        </div>
                        <span className="text-gray-900 font-poppins">{formatDate(payment.date_paid)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                      onClick={() => handleViewPaymentDetails(payment)}
                      className="p-2 rounded-full bg-blue-50 text-[#3A86FF] hover:bg-blue-100 transition-colors"
                      aria-label="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditPayment(payment.id)}
                      className="p-2 rounded-full bg-purple-50 text-[#8338EC] hover:bg-purple-100 transition-colors"
                      aria-label="Edit payment"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="p-2 rounded-full bg-pink-50 text-[#FF006E] hover:bg-pink-100 transition-colors"
                      aria-label="Delete payment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {payments.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500 font-poppins">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">{Math.min(indexOfLastItem, payments.length)}</span> of{" "}
                <span className="font-medium">{payments.length}</span> payments
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? "bg-[#3A86FF] text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    } font-medium font-poppins`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Payment Details Side Panel */}
      {showPaymentDetails && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 font-poppins">Payment Details</h2>
                <button
                  onClick={() => setShowPaymentDetails(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#3A86FF]/10 flex items-center justify-center mr-4">
                    <FileText className="w-6 h-6 text-[#3A86FF]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 font-poppins">Payment #{selectedPayment.id}</h3>
                    <p className="text-gray-500 font-poppins">For: {staff.name}</p>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 font-poppins">
                    Paid
                  </span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-gray-500 font-poppins">{formatCurrency(selectedPayment.amount)}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 font-poppins flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Payment Details
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                        <p className="text-sm text-gray-600 font-poppins">Amount</p>
                      </div>
                      <p className="font-medium text-gray-900 font-poppins">{formatCurrency(selectedPayment.amount)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <p className="text-sm text-gray-600 font-poppins">Date Paid</p>
                      </div>
                      <p className="font-medium text-gray-900 font-poppins">{formatDate(selectedPayment.date_paid)}</p>
                    </div>
                  </div>
                </div>

                {selectedPayment.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 font-poppins flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Notes
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-gray-700 font-poppins">{selectedPayment.notes}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 font-poppins flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Staff Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="font-medium text-gray-900 font-poppins">{staff.name}</p>
                    <p className="text-sm text-gray-600 font-poppins mt-1">{staff.position}</p>
                    <p className="text-sm text-gray-600 font-poppins mt-1">{staff.email}</p>
                    <p className="text-sm text-gray-600 font-poppins mt-1">
                      Rate: {formatCurrency(staff.payment_rate)}/hr
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => handleEditPayment(selectedPayment.id)}
                  className="flex-1 bg-[#3A86FF] text-white px-4 py-2 rounded-md hover:bg-[#3A86FF]/90 transition-colors font-poppins flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Payment
                </button>
                <button
                  onClick={() => {
                    setShowPaymentDetails(false)
                    handleDeletePayment(selectedPayment.id)
                  }}
                  className="flex-1 border border-red-300 text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition-colors font-poppins flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

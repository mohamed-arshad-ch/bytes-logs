"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  FileText,
  Plus,
  Printer,
  Search,
  Trash2,
  X,
  User,
  DollarSign,
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  CalendarClock,
  Building,
  Mail,
  Phone,
  MapPin,
  FileIcon,
  Tag,
  ShoppingCart,
  Info,
  Clipboard,
} from "lucide-react"
import DashboardHeader from "@/app/components/dashboard/header"
import BottomNavigation from "@/app/components/dashboard/bottom-navigation"
import {
  getTransactionsForUser,
  getClientsForUser,
  filterTransactions,
  deleteTransaction,
  getTransactionById,
} from "@/app/actions/transaction-actions"
import { toast } from "@/hooks/use-toast"
import { ConfirmationModal } from "@/app/components/ui/confirmation-modal"

// Import the currency utility
import { formatCurrency } from "@/lib/utils-currency"
import { AddButton } from "@/app/components/ui/floating-action-button"
// Transaction type definition
type Transaction = {
  id: number
  transactionId: string
  clientId: string | number
  clientName: string
  transactionDate: string
  dueDate: string
  totalAmount: number
  status: "draft" | "pending" | "paid" | "partial" | "overdue"
  referenceNumber?: string
  createdAt?: string
  updatedAt?: string
}

export default function AdminTransactions() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [clientFilter, setClientFilter] = useState("all")
  const [startDateFilter, setStartDateFilter] = useState("")
  const [endDateFilter, setEndDateFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)
  const [showTransactionDetails, setShowTransactionDetails] = useState(false)
  const [loadingTransaction, setLoadingTransaction] = useState(false)

  // Confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8) // Increased for simpler cards
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

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

        // Fetch transactions
        await fetchTransactions()

        // Fetch clients for filter
        await fetchClients()
      } catch (e) {
        console.error("Error checking authentication:", e)
        router.push("/admin/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const response = await getTransactionsForUser()
      if (response.success) {
        setTransactions(response.transactions)
        setFilteredTransactions(response.transactions)
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch transactions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching transactions",
        variant: "destructive",
      })
    }
  }

  // Fetch clients
  const fetchClients = async () => {
    try {
      const response = await getClientsForUser()
      if (response.success) {
        setClients(response.clients)
      } else {
        console.error("Error fetching clients:", response.error)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Apply filters
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setLoading(true)
        const response = await filterTransactions({
          status: statusFilter,
          clientId: clientFilter,
          startDate: startDateFilter,
          endDate: endDateFilter,
          searchQuery: searchQuery,
        })

        if (response.success && Array.isArray(response.transactions)) {
          // Make sure transactions is an array before trying to sort it
          const filtered = [...response.transactions]

          // Apply sort
          if (sortField && filtered.length > 0) {
            filtered.sort((a, b) => {
              let comparison = 0
              switch (sortField) {
                case "transactionId":
                  comparison = a.transactionId.localeCompare(b.transactionId)
                  break
                case "clientName":
                  comparison = a.clientName.localeCompare(b.clientName)
                  break
                case "transactionDate":
                  comparison = new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
                  break
                case "dueDate":
                  comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                  break
                case "totalAmount":
                  comparison = a.totalAmount - b.totalAmount
                  break
                case "status":
                  comparison = a.status.localeCompare(b.status)
                  break
                default:
                  comparison = 0
              }

              return sortDirection === "asc" ? comparison : -comparison
            })
          }

          setFilteredTransactions(filtered)
          setCurrentPage(1) // Reset to first page when filters change
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to filter transactions",
            variant: "destructive",
          })
          // Set empty array to prevent errors
          setFilteredTransactions([])
        }
      } catch (error) {
        console.error("Error applying filters:", error)
        // Set empty array to prevent errors
        setFilteredTransactions([])
        toast({
          title: "Error",
          description: "An unexpected error occurred while filtering transactions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (!loading) {
      applyFilters()
    }
  }, [statusFilter, clientFilter, startDateFilter, endDateFilter, searchQuery, sortField, sortDirection])

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Status badge colors and icons
  const statusInfo = {
    paid: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
    unpaid: { color: "bg-red-100 text-red-800", icon: <AlertCircle className="w-4 h-4" /> },
    pending: { color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4" /> },
    partial: { color: "bg-blue-100 text-blue-800", icon: <DollarSign className="w-4 h-4" /> },
    overdue: { color: "bg-red-100 text-red-800", icon: <AlertCircle className="w-4 h-4" /> },
    draft: { color: "bg-gray-100 text-gray-800", icon: <FileText className="w-4 h-4" /> },
  }

  // Handle transaction actions
  const handleViewTransaction = async (transaction: Transaction) => {
    try {
      setLoadingTransaction(true)
      const response = await getTransactionById(transaction.transactionId)

      if (response.success) {
        setSelectedTransaction(response.transaction)
        setShowTransactionDetails(true)
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch transaction details",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching transaction details:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching transaction details",
        variant: "destructive",
      })
    } finally {
      setLoadingTransaction(false)
    }
  }

  const handlePrintInvoice = (id: string) => {
    console.log(`Print invoice ${id}`)
    // In a real app, this would open a print dialog or generate a PDF
    toast({
      title: "Print Invoice",
      description: "This feature is not implemented yet",
    })
  }

  const handleEditTransaction = (id: string) => {
    router.push(`/admin/transactions/edit/${id}`)
  }

  // Updated to show confirmation modal
  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id)
    setShowDeleteModal(true)
  }

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return

    try {
      const response = await deleteTransaction(transactionToDelete)

      if (response.success) {
        toast({
          title: "Success",
          description: "Transaction deleted successfully",
        })

        // Refresh transactions
        await fetchTransactions()

        // Close the transaction details panel if it's open
        if (selectedTransaction && selectedTransaction.transactionId === transactionToDelete) {
          setShowTransactionDetails(false)
        }
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete transaction",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the transaction",
        variant: "destructive",
      })
    } finally {
      setShowDeleteModal(false)
      setTransactionToDelete(null)
    }
  }

  const handleExport = () => {
    console.log("Export transactions")
    // In a real app, this would generate a CSV or Excel file
    toast({
      title: "Export Transactions",
      description: "This feature is not implemented yet",
    })
  }

  // Get payment method name
  const getPaymentMethodName = (methodId?: string) => {
    if (!methodId) return "N/A"
    const methods = {
      "method-001": "Credit Card",
      "method-002": "Bank Transfer",
      "method-003": "PayPal",
      "method-004": "Cash",
      "method-005": "Check",
    }
    return methods[methodId as keyof typeof methods] || "N/A"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-poppins">Loading transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DashboardHeader />

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Page Header with repositioned Add New button */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Transactions</h1>
            {/* <Link
              href="/admin/transactions/create"
              className="bg-[#3A86FF] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#3A86FF]/90 transition-colors font-poppins"
            >
              <Plus className="w-4 h-4" />
              Create Transaction
            </Link> */}
          </div>
          <p className="text-gray-600 font-poppins">Manage your financial transactions</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 md:max-w-xs">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] font-poppins"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Status Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] font-poppins"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="overdue">Overdue</option>
                  <option value="draft">Draft</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Client Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] font-poppins"
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                >
                  <option value="all">All Clients</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="date"
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] font-poppins"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    placeholder="Start Date"
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="relative">
                  <input
                    type="date"
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] font-poppins"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    placeholder="End Date"
                  />
                </div>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="flex items-center gap-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] font-poppins"
              >
                <Download className="h-4 w-4" />
                Export
              </button>

              {/* Clear Filters */}
              <button
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-poppins"
                onClick={() => {
                  setStatusFilter("all")
                  setClientFilter("all")
                  setStartDateFilter("")
                  setEndDateFilter("")
                  setSearchQuery("")
                }}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Card View - Modern UI */}
        <div className="mb-6">
          {currentTransactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-500 font-poppins">
              <div className="flex flex-col items-center justify-center py-12">
                <FileIcon className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  No transactions match your current filters. Try adjusting your search or filter criteria.
                </p>
                <button
                  onClick={() => {
                    setStatusFilter("all")
                    setClientFilter("all")
                    setStartDateFilter("")
                    setEndDateFilter("")
                    setSearchQuery("")
                  }}
                  className="bg-[#3A86FF] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#3A86FF]/90 transition-colors font-poppins"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentTransactions.map((transaction) => (
                <div
                  key={transaction.transactionId}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900 font-poppins text-lg">{transaction.transactionId}</h3>
                        <p className="text-sm text-gray-500 font-poppins">{transaction.clientName}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          statusInfo[transaction.status].color
                        } font-poppins capitalize`}
                      >
                        {statusInfo[transaction.status].icon}
                        <span>{transaction.status}</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span className="text-sm font-poppins">Amount:</span>
                        </div>
                        <span className="font-bold text-gray-900 font-poppins">
                          {formatCurrency(transaction.totalAmount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm font-poppins">Date:</span>
                        </div>
                        <span className="text-gray-900 font-poppins">{formatDate(transaction.transactionDate)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <CalendarClock className="h-4 w-4 mr-2" />
                          <span className="text-sm font-poppins">Due:</span>
                        </div>
                        <span className="text-gray-900 font-poppins">{formatDate(transaction.dueDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                      onClick={() => handleViewTransaction(transaction)}
                      className="p-2 rounded-full bg-blue-50 text-[#3A86FF] hover:bg-blue-100 transition-colors"
                      aria-label="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditTransaction(transaction.transactionId)}
                      className="p-2 rounded-full bg-purple-50 text-[#8338EC] hover:bg-purple-100 transition-colors"
                      aria-label="Edit transaction"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(transaction.transactionId)}
                      className="p-2 rounded-full bg-pink-50 text-[#FF006E] hover:bg-pink-100 transition-colors"
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-500 font-poppins">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium">{Math.min(indexOfLastItem, filteredTransactions.length)}</span> of{" "}
                <span className="font-medium">{filteredTransactions.length}</span> transactions
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

        {/* Transaction Details Side Panel */}
        {showTransactionDetails && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white w-full max-w-md h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 font-poppins">Transaction Details</h2>
                  <button
                    onClick={() => setShowTransactionDetails(false)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {loadingTransaction ? (
                  <div className="flex justify-center py-8">
                    <div className="w-10 h-10 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-[#3A86FF]/10 flex items-center justify-center mr-4">
                          <FileText className="w-6 h-6 text-[#3A86FF]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                            {selectedTransaction.transactionId}
                          </h3>
                          <p className="text-gray-500 font-poppins">
                            {selectedTransaction.referenceNumber
                              ? `Ref: ${selectedTransaction.referenceNumber}`
                              : "No reference number"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center mb-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            statusInfo[selectedTransaction.status].color
                          } font-poppins capitalize`}
                        >
                          {statusInfo[selectedTransaction.status].icon}
                          <span>{selectedTransaction.status}</span>
                        </span>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-gray-500 font-poppins">
                          {formatCurrency(selectedTransaction.totalAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 font-poppins flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          Client Information
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="font-medium text-gray-900 font-poppins">{selectedTransaction.clientName}</p>
                          {selectedTransaction.clientContactPerson && (
                            <div className="flex items-center text-sm text-gray-600 font-poppins mt-2">
                              <User className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{selectedTransaction.clientContactPerson}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-600 font-poppins mt-2">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{selectedTransaction.clientEmail}</span>
                          </div>
                          {selectedTransaction.clientPhone && (
                            <div className="flex items-center text-sm text-gray-600 font-poppins mt-2">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{selectedTransaction.clientPhone}</span>
                            </div>
                          )}
                          <div className="flex items-start text-sm text-gray-600 font-poppins mt-2">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                            <span>{selectedTransaction.clientAddress}</span>
                          </div>
                          <div className="flex items-center mt-3 text-sm text-[#3A86FF]">
                            <User className="w-4 h-4 mr-1" />
                            <Link href={`/admin/clients/edit/${selectedTransaction.clientId}`} className="font-poppins">
                              View Client Profile
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 font-poppins flex items-center">
                          <Info className="w-4 h-4 mr-2" />
                          Transaction Details
                        </h4>
                        <div className="bg-gray-50 rounded-md p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                              <p className="text-sm text-gray-600 font-poppins">Transaction Date</p>
                            </div>
                            <p className="font-medium text-gray-900 font-poppins">
                              {formatDate(selectedTransaction.transactionDate)}
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <CalendarClock className="h-4 w-4 text-gray-500 mr-2" />
                              <p className="text-sm text-gray-600 font-poppins">Due Date</p>
                            </div>
                            <p className="font-medium text-gray-900 font-poppins">
                              {formatDate(selectedTransaction.dueDate)}
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                              <p className="text-sm text-gray-600 font-poppins">Payment Method</p>
                            </div>
                            <p className="font-medium text-gray-900 font-poppins">
                              {getPaymentMethodName(selectedTransaction.paymentMethod)}
                            </p>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                              <p className="text-sm text-gray-600 font-poppins">Total Amount</p>
                            </div>
                            <p className="font-medium text-gray-900 font-poppins">
                              {formatCurrency(selectedTransaction.totalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {selectedTransaction.lineItems && selectedTransaction.lineItems.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 font-poppins flex items-center">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Line Items
                          </h4>
                          <div className="space-y-3">
                            {selectedTransaction.lineItems.map((item: any) => (
                              <div key={item.id} className="bg-gray-50 p-3 rounded-md">
                                <div className="flex justify-between mb-1">
                                  <p className="font-medium text-gray-900 font-poppins">
                                    {item.productName || item.description}
                                  </p>
                                  <p className="font-medium text-gray-900 font-poppins">{formatCurrency(item.total)}</p>
                                </div>
                                <div className="text-sm text-gray-500 font-poppins">
                                  {item.quantity} x {formatCurrency(item.unitPrice)}
                                  {item.taxRate > 0 && ` (+ ${item.taxRate}% tax)`}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedTransaction.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 font-poppins flex items-center">
                            <Clipboard className="w-4 h-4 mr-2" />
                            Notes
                          </h4>
                          <p className="text-gray-700 font-poppins bg-gray-50 p-3 rounded-md">
                            {selectedTransaction.notes}
                          </p>
                        </div>
                      )}

                      {selectedTransaction.terms && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 font-poppins flex items-center">
                            <Tag className="w-4 h-4 mr-2" />
                            Terms & Conditions
                          </h4>
                          <p className="text-gray-700 font-poppins bg-gray-50 p-3 rounded-md">
                            {selectedTransaction.terms}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                      <button
                        onClick={() => handleEditTransaction(selectedTransaction.transactionId)}
                        className="flex-1 bg-[#3A86FF] text-white px-4 py-2 rounded-md hover:bg-[#3A86FF]/90 transition-colors font-poppins flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Transaction
                      </button>
                      <button
                        onClick={() => handlePrintInvoice(selectedTransaction.transactionId)}
                        className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors font-poppins flex items-center justify-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        Print Invoice
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
<AddButton/>
      <BottomNavigation />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteTransaction}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone and will also remove the associated ledger entry."
        confirmText="Delete Transaction"
        type="danger"
      />
    </div>
  )
}

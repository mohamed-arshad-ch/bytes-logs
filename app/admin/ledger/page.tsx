"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  X,
  DollarSign,
  ArrowUp,
  ArrowDown,
  FileText,
  Calendar,
  RefreshCw,
  Eye,
  User,
  Building,
  Clock,
  CreditCard,
  Info,
  Tag,
  FileIcon,
} from "lucide-react"
import DashboardHeader from "@/app/components/dashboard/header"
import BottomNavigation from "@/app/components/dashboard/bottom-navigation"
import { Toast } from "@/app/components/ui/toast"
import { getCurrentMonthSummary, getLedgerYearlySummary } from "@/app/actions/ledger-actions"
import { formatCurrency } from "@/lib/utils-currency"

// Type definitions
type LedgerEntry = {
  id: number
  entry_date: string
  entry_type: "income" | "expense"
  amount: number
  description: string
  reference_id: string
  reference_type: "client_transaction" | "staff_payment"
  client_id: number | null
  staff_id: number | null
  client_name?: string
  staff_name?: string
  created_at: string
  updated_at: string
}

type YearlySummary = {
  year: number
  income: number
  expense: number
  profit: number
}

export default function AdminLedger() {
  const router = useRouter()

  // Get current date information
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1 // JavaScript months are 0-indexed

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [allEntries, setAllEntries] = useState<LedgerEntry[]>([])
  const [yearlySummary, setYearlySummary] = useState<YearlySummary[]>([
    // Default data for the last 5 years
    ...Array.from({ length: 5 }, (_, i) => ({
      year: currentYear - 4 + i,
      income: 0,
      expense: 0,
      profit: 0,
    })),
  ])
  const [currentMonthTotals, setCurrentMonthTotals] = useState({
    income: 0,
    expense: 0,
    profit: 0,
  })

  // Filter state - default to current month and year
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredEntries, setFilteredEntries] = useState<LedgerEntry[]>([])

  // Selected entry for details panel
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null)
  const [showDetailsPanel, setShowDetailsPanel] = useState(false)

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(6) // Reduced for card view

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

      // Load data
      fetchCurrentMonthData()
      fetchYearlySummary()
    } catch (e) {
      console.error("Error parsing user data:", e)
      router.push("/")
      return
    }
  }, [router])

  // Apply filters when filter criteria change
  useEffect(() => {
    if (allEntries.length > 0) {
      applyFilters()
    }
  }, [selectedYear, selectedMonth, searchQuery, allEntries])

  const fetchCurrentMonthData = async () => {
    setLoading(true)
    try {
      const response = await getCurrentMonthSummary()
      if (response.success) {
        setCurrentMonthTotals(response.summary)
        setAllEntries(response.entries)
        setFilteredEntries(response.entries)
      } else {
        setToast({ message: response.error || "Failed to fetch current month data", type: "error" })
      }
    } catch (error) {
      console.error("Error fetching current month data:", error)
      setToast({ message: "An unexpected error occurred", type: "error" })
    } finally {
      setLoading(false)
    }
  }

  const fetchYearlySummary = async () => {
    try {
      const response = await getLedgerYearlySummary()
      if (response.success && response.summary.length > 0) {
        setYearlySummary(response.summary)
      }
    } catch (error) {
      console.error("Error fetching yearly summary:", error)
    }
  }

  // Client-side filtering
  const applyFilters = () => {
    let filtered = [...allEntries]

    // Filter by year
    filtered = filtered.filter((entry) => {
      const entryDate = new Date(entry.entry_date)
      return entryDate.getFullYear() === selectedYear
    })

    // Filter by month
    filtered = filtered.filter((entry) => {
      const entryDate = new Date(entry.entry_date)
      return entryDate.getMonth() + 1 === selectedMonth
    })

    // Filter by search query
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (entry) =>
          entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (entry.client_name && entry.client_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (entry.staff_name && entry.staff_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          entry.reference_id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredEntries(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get month name
  const getMonthName = (monthNumber: number) => {
    const date = new Date()
    date.setMonth(monthNumber - 1)
    return date.toLocaleString("default", { month: "long" })
  }

  // Calculate totals for the filtered entries
  const calculateTotals = () => {
    let totalIncome = 0
    let totalExpense = 0

    filteredEntries.forEach((entry) => {
      if (entry.entry_type === "income") {
        totalIncome += entry.amount
      } else {
        totalExpense += entry.amount
      }
    })

    return {
      income: totalIncome,
      expense: totalExpense,
      profit: totalIncome - totalExpense,
    }
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentEntries = filteredEntries.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)

  // Filter handlers
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number.parseInt(e.target.value))
  }

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(Number.parseInt(e.target.value))
  }

  const clearFilters = () => {
    setSelectedYear(currentYear)
    setSelectedMonth(currentMonth)
    setSearchQuery("")
    setCurrentPage(1)
  }

  const refreshData = () => {
    fetchCurrentMonthData()
    fetchYearlySummary()
    setToast({ message: "Ledger data refreshed", type: "success" })
  }

  const handleViewDetails = (entry: LedgerEntry) => {
    setSelectedEntry(entry)
    setShowDetailsPanel(true)
  }

  const closeDetailsPanel = () => {
    setShowDetailsPanel(false)
    setTimeout(() => setSelectedEntry(null), 300) // Clear after animation
  }

  const totals = calculateTotals()

  if (loading && allEntries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-poppins">Loading ledger data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DashboardHeader />

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Financial Ledger</h1>
            <p className="text-gray-600 font-poppins">Track and manage all financial transactions</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-200 transition-colors font-poppins"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => console.log("Export ledger data")}
              className="bg-[#3A86FF] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#3A86FF]/90 transition-colors font-poppins"
            >
              <Download className="w-4 h-4" />
              Export Ledger
            </button>
          </div>
        </div>

        {/* Current Month Summary */}
        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 mb-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-[#3A86FF] mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 font-poppins">
              Current Month: {getMonthName(currentMonth)} {currentYear}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <ArrowUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 font-poppins">Total Income</h3>
                  <p className="text-2xl font-bold text-gray-900 font-poppins">
                    {formatCurrency(currentMonthTotals.income)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <ArrowDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 font-poppins">Total Expenses</h3>
                  <p className="text-2xl font-bold text-gray-900 font-poppins">
                    {formatCurrency(currentMonthTotals.expense)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 font-poppins">Net Profit</h3>
                  <p
                    className={`text-2xl font-bold ${
                      currentMonthTotals.profit >= 0 ? "text-green-600" : "text-red-600"
                    } font-poppins`}
                  >
                    {formatCurrency(currentMonthTotals.profit)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simplified Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 md:max-w-xs">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search ledger entries..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] font-poppins"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Year Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] font-poppins"
                  value={selectedYear}
                  onChange={handleYearChange}
                >
                  {yearlySummary.map((summary) => (
                    <option key={summary.year} value={summary.year}>
                      {summary.year}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Month Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] font-poppins"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {getMonthName(m)}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Clear Filters */}
              <button
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-poppins"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                Reset to Current Month
              </button>
            </div>
          </div>
        </div>

        {/* Ledger Entries Cards */}
        <div className="mb-6">
          {filteredEntries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2 font-poppins">No ledger entries found</h3>
              <p className="text-gray-500 font-poppins mb-4">
                No entries match your current filters. Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={clearFilters}
                className="bg-[#3A86FF] text-white px-4 py-2 rounded-md inline-flex items-center gap-2 hover:bg-[#3A86FF]/90 transition-colors font-poppins"
              >
                <X className="w-4 h-4" />
                Reset to Current Month
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div
                          className={`w-10 h-10 rounded-full ${
                            entry.entry_type === "income" ? "bg-green-100" : "bg-red-100"
                          } flex items-center justify-center mr-3`}
                        >
                          {entry.entry_type === "income" ? (
                            <ArrowUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-poppins">{formatDate(entry.entry_date)}</p>
                          <h3 className="font-medium text-gray-900 font-poppins">
                            {entry.client_name || entry.staff_name || "N/A"}
                          </h3>
                        </div>
                      </div>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          entry.entry_type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        } font-poppins capitalize`}
                      >
                        {entry.entry_type}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600 font-poppins line-clamp-1">{entry.description}</p>
                      <span
                        className={`font-medium ${
                          entry.entry_type === "income" ? "text-green-600" : "text-red-600"
                        } font-poppins`}
                      >
                        {entry.entry_type === "income" ? "+" : "-"}
                        {formatCurrency(entry.amount)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 p-3 bg-gray-50 flex justify-end">
                    <button
                      onClick={() => handleViewDetails(entry)}
                      className="p-2 rounded-full bg-blue-50 text-[#3A86FF] hover:bg-blue-100 transition-colors"
                      aria-label="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredEntries.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-poppins">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">{Math.min(indexOfLastItem, filteredEntries.length)}</span> of{" "}
              <span className="font-medium">{filteredEntries.length}</span> entries
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
      </main>

      {/* Details Side Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-1/2 lg:w-1/3 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
          showDetailsPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedEntry && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 font-poppins">Entry Details</h2>
              <button
                onClick={closeDetailsPanel}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center mb-6">
                <div
                  className={`w-12 h-12 rounded-full ${
                    selectedEntry.entry_type === "income" ? "bg-green-100" : "bg-red-100"
                  } flex items-center justify-center mr-4`}
                >
                  {selectedEntry.entry_type === "income" ? (
                    <ArrowUp className="w-6 h-6 text-green-600" />
                  ) : (
                    <ArrowDown className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 font-poppins capitalize">
                    {selectedEntry.entry_type} Entry
                  </h3>
                  <p className="text-gray-500 font-poppins">Ref: {selectedEntry.reference_id}</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 font-poppins flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Basic Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <p className="text-sm text-gray-600 font-poppins">Date</p>
                      </div>
                      <p className="font-medium text-gray-900 font-poppins">{formatDate(selectedEntry.entry_date)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-gray-500 mr-2" />
                        <p className="text-sm text-gray-600 font-poppins">Type</p>
                      </div>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          selectedEntry.entry_type === "income"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        } font-poppins capitalize`}
                      >
                        {selectedEntry.entry_type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                        <p className="text-sm text-gray-600 font-poppins">Amount</p>
                      </div>
                      <p
                        className={`font-medium ${
                          selectedEntry.entry_type === "income" ? "text-green-600" : "text-red-600"
                        } font-poppins`}
                      >
                        {selectedEntry.entry_type === "income" ? "+" : "-"}
                        {formatCurrency(selectedEntry.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 font-poppins flex items-center">
                    <FileIcon className="w-4 h-4 mr-2" />
                    Description
                  </h4>
                  <p className="text-gray-700 font-poppins">{selectedEntry.description}</p>
                </div>

                {/* Related Party */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 font-poppins flex items-center">
                    {selectedEntry.client_name ? (
                      <Building className="w-4 h-4 mr-2" />
                    ) : (
                      <User className="w-4 h-4 mr-2" />
                    )}
                    {selectedEntry.client_name ? "Client" : "Staff"}
                  </h4>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900 font-poppins">
                      {selectedEntry.client_name || selectedEntry.staff_name || "N/A"}
                    </p>
                    {selectedEntry.client_id && (
                      <button
                        onClick={() => router.push(`/admin/clients/${selectedEntry.client_id}`)}
                        className="text-sm text-[#3A86FF] hover:underline font-poppins flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Client Details
                      </button>
                    )}
                    {selectedEntry.staff_id && (
                      <button
                        onClick={() => router.push(`/admin/staff/${selectedEntry.staff_id}`)}
                        className="text-sm text-[#3A86FF] hover:underline font-poppins flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Staff Details
                      </button>
                    )}
                  </div>
                </div>

                {/* Reference Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 font-poppins flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Reference Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-500 mr-2" />
                        <p className="text-sm text-gray-600 font-poppins">Reference ID</p>
                      </div>
                      <p className="font-medium text-gray-900 font-poppins">{selectedEntry.reference_id}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-gray-500 mr-2" />
                        <p className="text-sm text-gray-600 font-poppins">Reference Type</p>
                      </div>
                      <p className="font-medium text-gray-900 font-poppins capitalize">
                        {selectedEntry.reference_type.replace("_", " ")}
                      </p>
                    </div>
                    {selectedEntry.reference_type === "client_transaction" && (
                      <button
                        onClick={() => router.push(`/admin/transactions/edit/${selectedEntry.reference_id}`)}
                        className="text-sm text-[#3A86FF] hover:underline font-poppins flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Transaction Details
                      </button>
                    )}
                    {selectedEntry.reference_type === "staff_payment" && (
                      <button
                        onClick={() => router.push(`/admin/staff/payments/${selectedEntry.staff_id}`)}
                        className="text-sm text-[#3A86FF] hover:underline font-poppins flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Payment Details
                      </button>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 font-poppins flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Timestamps
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <p className="text-sm text-gray-600 font-poppins">Created</p>
                      </div>
                      <p className="text-sm text-gray-900 font-poppins">
                        {new Date(selectedEntry.created_at).toLocaleString()}
                      </p>
                    </div>
                    {selectedEntry.updated_at && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                          <p className="text-sm text-gray-600 font-poppins">Updated</p>
                        </div>
                        <p className="text-sm text-gray-900 font-poppins">
                          {new Date(selectedEntry.updated_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay when panel is open */}
      {showDetailsPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeDetailsPanel}></div>
      )}

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <BottomNavigation />
    </div>
  )
}

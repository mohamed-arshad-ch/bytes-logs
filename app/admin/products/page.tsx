"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Grid,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Package,
  Tag,
  Percent,
  User,
  DollarSign,
  Layers,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import DashboardHeader from "@/app/components/dashboard/header"
import BottomNavigation from "@/app/components/dashboard/bottom-navigation"
import { Toast } from "@/app/components/ui/toast"
import { filterProducts, searchProducts, deleteProduct, type Product, getAllProducts } from "@/lib/db-service"
import { formatCurrency } from "@/lib/utils-currency"
import { ConfirmationModal } from "@/app/components/ui/confirmation-modal"
import { AddButton } from "@/app/components/ui/floating-action-button"
export default function AdminProducts() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<string | null>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"card" | "grid">("card")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetails, setShowProductDetails] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | number | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)
  const [totalProducts, setTotalProducts] = useState(0)

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

    // Load products
    loadProducts()
  }, [router])

  // Load products with filters
  const loadProducts = async () => {
    setLoading(true)
    try {
      let filteredProducts: Product[] = []

      if (searchQuery) {
        // Search by query
        filteredProducts = await searchProducts(searchQuery)
      } else if (categoryFilter !== "all" || statusFilter !== "all") {
        // Filter by category and status
        filteredProducts = await filterProducts(categoryFilter, statusFilter)
      } else {
        // Get all products
        filteredProducts = await getAllProducts()
      }

      // Sort products
      if (sortField) {
        filteredProducts = filteredProducts.sort((a, b) => {
          let comparison = 0
          switch (sortField) {
            case "name":
              comparison = a.name.localeCompare(b.name)
              break
            case "price":
              comparison = a.price - b.price
              break
            case "category":
              comparison = a.category.localeCompare(b.category)
              break
            default:
              comparison = 0
          }

          return sortDirection === "asc" ? comparison : -comparison
        })
      }

      setProducts(filteredProducts)
      setTotalProducts(filteredProducts.length)
    } catch (error) {
      console.error("Error loading products:", error)
      setToast({ message: "Failed to load products", type: "error" })
    } finally {
      setLoading(false)
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
    if (!loading && user) {
      loadProducts()
    }
  }, [categoryFilter, statusFilter, searchQuery, sortField, sortDirection])

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(totalProducts / itemsPerPage)

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Status badge colors
  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
  }

  // Category icons and colors
  const categoryInfo = {
    service: { icon: "🔧", color: "bg-blue-100 text-blue-800" },
    product: { icon: "📦", color: "bg-purple-100 text-purple-800" },
    subscription: { icon: "🔄", color: "bg-amber-100 text-amber-800" },
  }

  // Handle product actions
  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDetails(true)
  }

  const handleEditProduct = (id: string | number) => {
    router.push(`/admin/products/edit/${id}`)
  }

  // Updated to show confirmation modal
  const handleDeleteClick = (id: string | number) => {
    setProductToDelete(id)
    setShowDeleteModal(true)
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    setIsDeleting(true)
    try {
      const success = await deleteProduct(productToDelete)
      if (success) {
        // Remove from local state
        setProducts(products.filter((p) => p.id !== productToDelete))
        setToast({ message: "Product deleted successfully", type: "success" })

        // Close details panel if the deleted product was selected
        if (selectedProduct && selectedProduct.id === productToDelete) {
          setShowProductDetails(false)
        }
      } else {
        setToast({ message: "Failed to delete product", type: "error" })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      setToast({ message: "An error occurred while deleting the product", type: "error" })
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
      setProductToDelete(null)
    }
  }

  const handleAddProduct = () => {
    router.push("/admin/products/add")
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3A86FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-poppins">Loading products...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Products & Services</h1>
            <p className="text-gray-600 font-poppins">Manage your catalog</p>
          </div>
          {/* <button
            onClick={handleAddProduct}
            className="bg-[#3A86FF] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#3A86FF]/90 transition-colors font-poppins"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button> */}
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
                  placeholder="Search products..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] font-poppins"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* Category Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] font-poppins"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="service">Services</option>
                  <option value="product">Products</option>
                  <option value="subscription">Subscription</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] font-poppins"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] font-poppins"
                  value={sortField || "name"}
                  onChange={(e) => {
                    setSortField(e.target.value)
                    setSortDirection("asc")
                  }}
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="category">Sort by Category</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("card")}
                  className={`px-3 py-2 flex items-center ${
                    viewMode === "card" ? "bg-gray-100" : "bg-white"
                  } hover:bg-gray-50 transition-colors`}
                >
                  <List className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 flex items-center ${
                    viewMode === "grid" ? "bg-gray-100" : "bg-white"
                  } hover:bg-gray-50 transition-colors`}
                >
                  <Grid className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={() => console.log("Export products data")}
                className="flex items-center gap-1 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] font-poppins"
              >
                <Download className="h-4 w-4" />
                Export
              </button>

              {/* Clear Filters */}
              <button
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm font-poppins"
                onClick={() => {
                  setCategoryFilter("all")
                  setStatusFilter("all")
                  setSearchQuery("")
                  setSortField("name")
                  setSortDirection("asc")
                }}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Card View */}
        {viewMode === "card" && (
          <div className="mb-6">
            {currentProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-500 font-poppins">
                <div className="flex flex-col items-center justify-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 max-w-md mb-6">
                    No products match your current filters. Try adjusting your search or filter criteria.
                  </p>
                  <button
                    onClick={() => {
                      setCategoryFilter("all")
                      setStatusFilter("all")
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentProducts.map((product) => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ${
                      selectedProduct?.id === product.id ? "ring-2 ring-[#3A86FF]" : ""
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <span className="mr-2 text-xl">{categoryInfo[product.category].icon}</span>
                          <h3 className="text-xl font-semibold text-gray-900 font-poppins text-lg">{product.name}</h3>
                        </div>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[product.status]
                          } font-poppins capitalize`}
                        >
                          {product.status}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-gray-600 text-sm line-clamp-2 font-poppins">{product.description}</p>
                      </div>

                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-600">
                            <Tag className="h-4 w-4 mr-2" />
                            <span className="text-sm font-poppins">Category:</span>
                          </div>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              categoryInfo[product.category].color
                            } font-poppins capitalize`}
                          >
                            {product.category}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span className="text-sm font-poppins">Price:</span>
                          </div>
                          <span className="font-bold text-gray-900 font-poppins">{formatCurrency(product.price)}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-600">
                            <Percent className="h-4 w-4 mr-2" />
                            <span className="text-sm font-poppins">Tax Rate:</span>
                          </div>
                          <span className="text-gray-900 font-poppins">{product.taxRate}%</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className="text-sm font-poppins">Created:</span>
                          </div>
                          <span className="text-gray-900 font-poppins">{formatDate(product.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end space-x-3">
                      <button
                        onClick={() => handleViewDetails(product)}
                        className="p-2 rounded-full bg-blue-50 text-[#3A86FF] hover:bg-blue-100 transition-colors"
                        aria-label="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="p-2 rounded-full bg-purple-50 text-[#8338EC] hover:bg-purple-100 transition-colors"
                        aria-label="Edit product"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product.id)}
                        className="p-2 rounded-full bg-pink-50 text-[#FF006E] hover:bg-pink-100 transition-colors"
                        aria-label="Delete product"
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination for Card View */}
            {products.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-500 font-poppins">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(indexOfLastItem, products.length)}</span> of{" "}
                  <span className="font-medium">{products.length}</span> products
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
        )}

        {/* Products Grid View */}
        {viewMode === "grid" && (
          <div className="mb-6">
            {currentProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-500 font-poppins">
                No products found matching your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <span className="mr-2 text-xl">{categoryInfo[product.category].icon}</span>
                          <h3 className="font-medium text-gray-900 font-poppins">{product.name}</h3>
                        </div>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[product.status]
                          } font-poppins capitalize`}
                        >
                          {product.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2 font-poppins">{product.description}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            categoryInfo[product.category].color
                          } font-poppins capitalize`}
                        >
                          {product.category}
                        </span>
                        <span className="font-bold text-gray-900 font-poppins">{formatCurrency(product.price)}</span>
                      </div>
                      <div className="text-sm text-gray-500 font-poppins">Tax Rate: {product.taxRate}%</div>
                      <div className="text-sm text-gray-500 font-poppins mt-2">
                        Created: {formatDate(product.created_at)}
                      </div>
                    </div>
                    <div className="border-t border-gray-100 p-3 bg-gray-50 flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(product)}
                        className="p-1 text-gray-500 hover:text-[#3A86FF] transition-colors"
                        aria-label="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="p-1 text-gray-500 hover:text-[#8338EC] transition-colors"
                        aria-label="Edit product"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product.id)}
                        className="p-1 text-gray-500 hover:text-[#FF006E] transition-colors"
                        aria-label="Delete product"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination for Grid View */}
            {products.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-500 font-poppins">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(indexOfLastItem, products.length)}</span> of{" "}
                  <span className="font-medium">{products.length}</span> products
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
        )}

        {/* Product Details Side Panel */}
        {showProductDetails && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white w-full max-w-md h-full overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 font-poppins">Product Details</h2>
                  <button
                    onClick={() => setShowProductDetails(false)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Product Icon and Name */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                      <span className="text-2xl">{categoryInfo[selectedProduct.category].icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 font-poppins">{selectedProduct.name}</h3>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          categoryInfo[selectedProduct.category].color
                        } font-poppins capitalize`}
                      >
                        {selectedProduct.category}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                      {selectedProduct.status === "active" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-poppins">Status</p>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[selectedProduct.status]
                        } font-poppins capitalize`}
                      >
                        {selectedProduct.status}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 font-poppins">
                      Description
                    </h4>
                    <p className="text-gray-900 font-poppins bg-gray-50 p-3 rounded-md">
                      {selectedProduct.description || "No description provided."}
                    </p>
                  </div>

                  {/* Pricing Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 font-poppins">
                      Pricing Information
                    </h4>
                    <div className="bg-gray-50 rounded-md p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                          <p className="text-sm text-gray-600 font-poppins">Unit Price</p>
                        </div>
                        <p className="font-semibold text-gray-900 font-poppins">
                          {formatCurrency(selectedProduct.price)}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Percent className="h-4 w-4 text-gray-500 mr-2" />
                          <p className="text-sm text-gray-600 font-poppins">Tax Rate</p>
                        </div>
                        <p className="text-gray-900 font-poppins">{selectedProduct.taxRate}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 font-poppins">
                      Additional Information
                    </h4>
                    <div className="bg-gray-50 rounded-md p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-500 mr-2" />
                          <p className="text-sm text-gray-600 font-poppins">Created By</p>
                        </div>
                        <p className="text-gray-900 font-poppins">User ID: {selectedProduct.created_by || "N/A"}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                          <p className="text-sm text-gray-600 font-poppins">Created At</p>
                        </div>
                        <p className="text-gray-900 font-poppins">{formatDate(selectedProduct.created_at)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Layers className="h-4 w-4 text-gray-500 mr-2" />
                          <p className="text-sm text-gray-600 font-poppins">Product ID</p>
                        </div>
                        <p className="text-gray-900 font-poppins">{selectedProduct.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                    <button
                      onClick={() => {
                        setShowProductDetails(false)
                        handleEditProduct(selectedProduct.id)
                      }}
                      className="flex-1 bg-[#3A86FF] text-white px-4 py-2 rounded-md hover:bg-[#3A86FF]/90 transition-colors font-poppins flex items-center justify-center gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit Product
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteModal(true)
                        setProductToDelete(selectedProduct.id)
                      }}
                      className="flex-1 border border-red-300 text-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition-colors font-poppins flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Product
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteProduct}
          title="Delete Product"
          message="Are you sure you want to delete this product? This action cannot be undone."
          confirmText="Delete Product"
          type="danger"
        />
      </main>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
<AddButton/>
      <BottomNavigation />
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import DashboardHeader from "@/app/components/dashboard/header"
import BottomNavigation from "@/app/components/dashboard/bottom-navigation"
import { Toast } from "@/app/components/ui/toast"
import { createProduct } from "@/lib/db-service"

export default function AddProduct() {
  const router = useRouter()
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "service" as "service" | "product" | "subscription",
    price: "",
    taxRate: "0",
    status: "active" as "active" | "inactive",
  })

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    price: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors = {
      name: formData.name ? "" : "Product name is required",
      description: formData.description ? "" : "Description is required",
      price: formData.price
        ? isNaN(Number(formData.price)) || Number(formData.price) <= 0
          ? "Please enter a valid price"
          : ""
        : "Price is required",
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Get user data from localStorage
      const userData = localStorage.getItem("user")
      if (!userData) {
        setToast({ message: "User authentication required", type: "error" })
        router.push("/")
        return
      }

      const user = JSON.parse(userData)
      const userId = user.id

      // Convert price and taxRate to numbers
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: Number(formData.price),
        taxRate: Number(formData.taxRate),
        status: formData.status,
      }

      // Create product in database with user ID
      await createProduct(productData, userId)

      // Show success toast
      setToast({ message: "Product added successfully", type: "success" })

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/admin/products")
      }, 1500)
    } catch (error) {
      console.error("Error adding product:", error)
      setToast({ message: "Failed to add product", type: "error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DashboardHeader />

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Add New Product</h1>
            <p className="text-gray-600 font-poppins">Create a new product or service for your catalog</p>
          </div>
        </div>

        {/* Product Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Product/Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins`}
                  placeholder="e.g., Website Development"
                  disabled={isSubmitting}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500 font-poppins">{errors.name}</p>}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins`}
                  placeholder="Describe your product or service..."
                  disabled={isSubmitting}
                />
                {errors.description && <p className="mt-1 text-xs text-red-500 font-poppins">{errors.description}</p>}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins"
                  disabled={isSubmitting}
                >
                  <option value="service">Service</option>
                  <option value="product">Product</option>
                  <option value="subscription">Subscription</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Unit Price ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-poppins">$</span>
                  </div>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`block w-full pl-8 pr-3 py-2 border ${
                      errors.price ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins`}
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.price && <p className="mt-1 text-xs text-red-500 font-poppins">{errors.price}</p>}
              </div>

              {/* Tax Rate */}
              <div>
                <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="text"
                  id="taxRate"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins"
                  placeholder="0"
                  disabled={isSubmitting}
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Status
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="status-active"
                      name="status"
                      value="active"
                      checked={formData.status === "active"}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#3A86FF] focus:ring-[#3A86FF] border-gray-300"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="status-active" className="ml-2 block text-sm text-gray-700 font-poppins">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="status-inactive"
                      name="status"
                      value="inactive"
                      checked={formData.status === "inactive"}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#3A86FF] focus:ring-[#3A86FF] border-gray-300"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="status-inactive" className="ml-2 block text-sm text-gray-700 font-poppins">
                      Inactive
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A86FF] text-sm font-medium font-poppins transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3A86FF] hover:bg-[#3A86FF]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A86FF] font-poppins transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <BottomNavigation />
    </div>
  )
}

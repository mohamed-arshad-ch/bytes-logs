"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import DashboardHeader from "@/app/components/dashboard/header"
import BottomNavigation from "@/app/components/dashboard/bottom-navigation"
import { Toast } from "@/app/components/ui/toast"
import { addStaffMember } from "@/app/actions/staff-actions"

export default function AddStaffPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    role: "support",
    status: "active",
    paymentRate: "",
    joinDate: new Date().toISOString().split("T")[0], // Today's date
  })

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    position: "",
    paymentRate: "",
  })

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

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
      name: formData.name ? "" : "Name is required",
      email: formData.email
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
          ? ""
          : "Please enter a valid email"
        : "Email is required",
      position: formData.position ? "" : "Position is required",
      paymentRate: formData.paymentRate
        ? isNaN(Number(formData.paymentRate)) || Number(formData.paymentRate) <= 0
          ? "Please enter a valid payment rate"
          : ""
        : "Payment rate is required",
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Create form data
    const staffFormData = new FormData()
    staffFormData.append("name", formData.name)
    staffFormData.append("email", formData.email)
    staffFormData.append("position", formData.position)
    staffFormData.append("role", formData.role)
    staffFormData.append("status", formData.status)
    staffFormData.append("paymentRate", formData.paymentRate)
    staffFormData.append("joinDate", formData.joinDate)

    try {
      const response = await addStaffMember(staffFormData)
      if (response.success) {
        setToast({ message: "Staff member added successfully", type: "success" })
        // Redirect after a short delay
        setTimeout(() => {
          router.push("/admin/staff")
        }, 1500)
      } else {
        setToast({ message: response.error || "Failed to add staff member", type: "error" })
      }
    } catch (error) {
      console.error("Error adding staff:", error)
      setToast({ message: "An error occurred while adding staff member", type: "error" })
    }
  }

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
            <h1 className="text-2xl font-bold text-gray-900 font-poppins">Add Staff Member</h1>
            <p className="text-gray-600 font-poppins">Create a new staff member account</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Full Name <span className="text-red-500">*</span>
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
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500 font-poppins">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins`}
                  placeholder="john.doe@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500 font-poppins">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    errors.position ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins`}
                  placeholder="Senior Developer"
                />
                {errors.position && <p className="mt-1 text-xs text-red-500 font-poppins">{errors.position}</p>}
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins"
                >
                  <option value="admin">Admin</option>
                  <option value="support">Support</option>
                  <option value="finance">Finance</option>
                </select>
              </div>

              <div>
                <label htmlFor="paymentRate" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Payment Rate ($/hr) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="paymentRate"
                  name="paymentRate"
                  value={formData.paymentRate}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border ${
                    errors.paymentRate ? "border-red-500" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins`}
                  placeholder="75.00"
                />
                {errors.paymentRate && <p className="mt-1 text-xs text-red-500 font-poppins">{errors.paymentRate}</p>}
              </div>

              <div>
                <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 font-poppins mb-1">
                  Join Date
                </label>
                <input
                  type="date"
                  id="joinDate"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins"
                />
              </div>

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
                    />
                    <label htmlFor="status-inactive" className="ml-2 block text-sm text-gray-700 font-poppins">
                      Inactive
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <Link
                href="/admin/staff"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A86FF] text-sm font-medium font-poppins transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3A86FF] hover:bg-[#3A86FF]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A86FF] font-poppins transition-colors"
              >
                Add Staff Member
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

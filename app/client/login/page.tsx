"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, FileText, Lock, Mail } from "lucide-react"
import { loginUser } from "@/app/actions/auth-actions"

export default function ClientLogin() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Check if user is already logged in
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        const user = JSON.parse(userData)
        if (user.role === "client") {
          router.push("/client/dashboard")
        }
      } catch (e) {
        // Invalid stored data, clear it
        localStorage.removeItem("user")
      }
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await loginUser(formData)

      if (result.success) {
        // Check if the user is a client
        if (result.role !== "client") {
          setError("You don't have permission to access the client portal")
          return
        }

        // Store user data in localStorage
        if (result.user) {
          localStorage.setItem("user", JSON.stringify(result.user))
        }

        // Redirect to client dashboard
        router.push("/client/dashboard")
      } else {
        setError(result.error || "Login failed. Please check your credentials.")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#3A86FF]/5 to-transparent" />

      {/* Abstract Client Pattern */}
      <div className="absolute bottom-10 right-10 opacity-5">
        <div className="flex flex-col gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-40 h-8 border border-[#3A86FF] rounded-md" />
          ))}
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.07)] p-8 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-[#3A86FF] to-[#8338EC] flex items-center justify-center text-white font-bold text-2xl mb-4">
            IH
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 font-poppins">InvoiceHub</h1>
          <h2 className="text-lg font-medium mt-2 font-poppins">Client Portal</h2>
          <p className="text-[#6B7280] text-sm mt-1 font-poppins">Access your invoices and transactions</p>
        </div>

        {/* Client Badge */}
        <div className="absolute top-8 right-8">
          <div className="flex items-center justify-center bg-[#3A86FF]/10 rounded-full p-2">
            <FileText className="w-5 h-5 text-[#3A86FF]" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-poppins">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 font-poppins">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isSubmitting}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins"
                placeholder="client@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 font-poppins">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#3A86FF] focus:border-[#3A86FF] text-sm font-poppins"
                placeholder="••••••••"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                disabled={isSubmitting}
                className="h-4 w-4 text-[#3A86FF] focus:ring-[#3A86FF] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-poppins">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <Link href="#" className="font-medium text-[#3A86FF] hover:text-[#3A86FF]/80 font-poppins">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3A86FF] hover:bg-[#3A86FF]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A86FF] transition-colors duration-200 font-poppins ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Help Text */}
        <p className="mt-6 text-xs text-center text-gray-500 font-poppins">
          Having trouble signing in? Contact your account manager
        </p>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-poppins">
          <span>© 2025 InvoiceHub</span>
          <Link href="#" className="text-[#3A86FF] hover:underline font-poppins">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}

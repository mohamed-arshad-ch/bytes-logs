"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Home, Package, Users } from "lucide-react"

export default function BottomNavigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/")
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-50">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-around items-center">
          <Link
            href="/admin/dashboard"
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-md transition-colors ${
              isActive("/admin/dashboard") ? "text-[#3A86FF]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1 font-poppins">Dashboard</span>
          </Link>

          <Link
            href="/admin/clients"
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-md transition-colors ${
              isActive("/admin/clients") ? "text-[#3A86FF]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs mt-1 font-poppins">Clients</span>
          </Link>

          <Link
            href="/admin/transactions"
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-md transition-colors ${
              isActive("/admin/transactions") ? "text-[#3A86FF]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs mt-1 font-poppins">Transactions</span>
          </Link>

          <Link
            href="/admin/staff"
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-md transition-colors ${
              isActive("/admin/staff") ? "text-[#3A86FF]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs mt-1 font-poppins">Staff</span>
          </Link>

          <Link
            href="/admin/products"
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-md transition-colors ${
              isActive("/admin/products") ? "text-[#3A86FF]" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-xs mt-1 font-poppins">Products</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

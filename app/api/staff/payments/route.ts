import { type NextRequest, NextResponse } from "next/server"
import { recordStaffPayment } from "@/app/actions/staff-actions"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const result = await recordStaffPayment(formData)

    if (result.success) {
      return NextResponse.json({ success: true, data: result.data })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in staff payments API:", error)
    return NextResponse.json(
      { success: false, error: "An error occurred while processing your request" },
      { status: 500 },
    )
  }
}

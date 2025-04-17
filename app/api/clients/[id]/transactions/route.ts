// Create a new API route to fetch transactions for a specific client

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getAuthSession } from "@/app/actions/auth-actions"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession()

    if (!session) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const clientId = params.id

    // Verify the client belongs to the current user
    const clientCheck = await sql`
      SELECT id FROM clients 
      WHERE id = ${clientId} AND created_by = ${session.userId}
    `

    if (!clientCheck || clientCheck.length === 0) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 })
    }

    // Get transactions for the client
    const transactions = await sql`
      SELECT 
        t.id,
        t.transaction_id as "transactionId",
        t.transaction_date as "date",
        t.due_date as "dueDate",
        t.total_amount as "amount",
        t.status,
        COALESCE(
          (SELECT description FROM transaction_items WHERE transaction_id = t.id LIMIT 1),
          'Service'
        ) as "description",
        t.reference_number as "referenceNumber"
      FROM transactions t
      WHERE t.client_id = ${clientId}
      ORDER BY t.transaction_date DESC
    `

    return NextResponse.json({
      success: true,
      transactions: transactions.map((t: any) => ({
        ...t,
        date: t.date
          ? new Date(t.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : null,
        dueDate: t.dueDate
          ? new Date(t.dueDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : null,
        amount: Number(t.amount),
      })),
    })
  } catch (error) {
    console.error("Error fetching client transactions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 })
  }
}

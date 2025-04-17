import { sql } from "./db"
import bcrypt from "bcryptjs"

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(userData: {
  firstName: string
  lastName: string
  email: string
  password: string
  companyName: string
  role: string
}) {
  const { firstName, lastName, email, password, companyName, role } = userData

  try {
    // Check if user already exists
    const existingUser = await sql`
     SELECT id FROM users WHERE email = ${email}
   `

    if (existingUser.length > 0) {
      return { success: false, error: "User with this email already exists" }
    }

    // Hash the password
    const passwordHash = await hashPassword(password)

    // Insert the new user
    const result = await sql`
     INSERT INTO users (first_name, last_name, email, password_hash, company_name, role)
     VALUES (${firstName}, ${lastName}, ${email}, ${passwordHash}, ${companyName}, ${role})
     RETURNING id, email, role
   `

    return {
      success: true,
      user: {
        id: result[0].id,
        email: result[0].email,
        role: result[0].role,
      },
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    // Find user by email
    const users = await sql`
     SELECT id, email, password_hash, role, first_name, last_name ,client_id,staff_id
     FROM users 
     WHERE email = ${email}
   `

    if (users.length === 0) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = users[0]

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash)

    if (!passwordValid) {
      return { success: false, error: "Invalid email or password" }
    }

    // Return user data (excluding password)
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        client_id: user.client_id,
        staff_id: user.staff_id,
      },
    }
  } catch (error) {
    console.error("Error authenticating user:", error)
    return { success: false, error: "Authentication failed" }
  }
}

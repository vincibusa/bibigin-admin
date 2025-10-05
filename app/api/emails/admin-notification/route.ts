import { NextRequest, NextResponse } from 'next/server'
import { sendAdminNotificationEmail, AdminNotificationData } from '@/lib/email'

// Add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order, customer } = body

    if (!order || !customer?.firstName || !customer?.lastName || !customer?.email) {
      const response = NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: order, customer.firstName, customer.lastName, customer.email' 
        },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    // Order data is now passed directly from frontend, no need for database query

    // Prepare email data
    const emailData: AdminNotificationData = {
      order,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone
      },
      dashboardUrl: `${process.env.ADMIN_URL || 'http://localhost:3002'}/orders`
    }

    // Send admin notification email
    await sendAdminNotificationEmail(emailData)

    const response = NextResponse.json({
      success: true,
      message: 'Admin notification email sent successfully'
    })
    return addCorsHeaders(response)

  } catch (error) {
    console.error('Error sending admin notification email:', error)
    
    const response = NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send admin notification' 
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
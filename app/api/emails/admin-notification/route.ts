import { NextRequest, NextResponse } from 'next/server'
import { sendAdminNotificationEmail, AdminNotificationData } from '@/lib/email'
import { getOrder } from '@/lib/orders'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, customer } = body

    if (!orderId || !customer?.firstName || !customer?.lastName || !customer?.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: orderId, customer.firstName, customer.lastName, customer.email' 
        },
        { status: 400 }
      )
    }

    // Get order details from database
    const order = await getOrder(orderId)
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

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

    return NextResponse.json({
      success: true,
      message: 'Admin notification email sent successfully'
    })

  } catch (error) {
    console.error('Error sending admin notification email:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send admin notification' 
      },
      { status: 500 }
    )
  }
}
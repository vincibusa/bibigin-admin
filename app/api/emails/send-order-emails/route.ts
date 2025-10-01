import { NextRequest, NextResponse } from 'next/server'
import { 
  sendOrderConfirmationEmail, 
  sendAdminNotificationEmail,
  defaultBankDetails, 
  OrderConfirmationData, 
  AdminNotificationData 
} from '@/lib/email'
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

    // Prepare customer confirmation email data
    const customerEmailData: OrderConfirmationData = {
      order,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: order.customerEmail // Use email from order
      },
      bankDetails: {
        iban: defaultBankDetails.iban,
        bankName: defaultBankDetails.bankName,
        beneficiary: defaultBankDetails.beneficiary,
        reference: defaultBankDetails.reference(orderId)
      }
    }

    // Prepare admin notification email data
    const adminEmailData: AdminNotificationData = {
      order,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: order.customerEmail, // Use email from order
        phone: customer.phone
      },
      dashboardUrl: `${process.env.ADMIN_URL || 'http://localhost:3002'}/orders`
    }

    // Send both emails in parallel
    const results = await Promise.allSettled([
      sendOrderConfirmationEmail(customerEmailData),
      sendAdminNotificationEmail(adminEmailData)
    ])

    // Check results
    const customerEmailResult = results[0]
    const adminEmailResult = results[1]

    const response = {
      success: true,
      message: 'Order emails processed',
      details: {
        customerEmail: {
          success: customerEmailResult.status === 'fulfilled',
          error: customerEmailResult.status === 'rejected' ? customerEmailResult.reason?.message : null
        },
        adminEmail: {
          success: adminEmailResult.status === 'fulfilled',
          error: adminEmailResult.status === 'rejected' ? adminEmailResult.reason?.message : null
        }
      }
    }

    // If both emails failed, return error status
    if (customerEmailResult.status === 'rejected' && adminEmailResult.status === 'rejected') {
      return NextResponse.json(
        { 
          ...response,
          success: false,
          message: 'Both emails failed to send'
        },
        { status: 500 }
      )
    }

    // If at least one email succeeded, return success with details
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error sending order emails:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send order emails' 
      },
      { status: 500 }
    )
  }
}
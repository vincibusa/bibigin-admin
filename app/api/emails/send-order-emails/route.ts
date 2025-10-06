import { NextRequest, NextResponse } from 'next/server'
import {
  sendOrderConfirmationEmail,
  sendAdminNotificationEmail,
  defaultBankDetails,
  OrderConfirmationData,
  AdminNotificationData
} from '@/lib/email'

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

    // Prepare customer confirmation email data
    const customerEmailData: OrderConfirmationData = {
      order,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email // Use email from customer data
      },
      bankDetails: {
        iban: defaultBankDetails.iban,
        bankName: defaultBankDetails.bankName,
        beneficiary: defaultBankDetails.beneficiary,
        reference: defaultBankDetails.reference(order.id, `${customer.firstName} ${customer.lastName}`)
      }
    }

    // Prepare admin notification email data
    const adminEmailData: AdminNotificationData = {
      order,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email, // Use email from customer data
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
      const errorResponse = NextResponse.json(
        { 
          ...response,
          success: false,
          message: 'Both emails failed to send'
        },
        { status: 500 }
      )
      return addCorsHeaders(errorResponse)
    }

    // If at least one email succeeded, return success with details
    const successResponse = NextResponse.json(response)
    return addCorsHeaders(successResponse)

  } catch (error) {
    console.error('Error sending order emails:', error)
    
    const response = NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send order emails' 
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
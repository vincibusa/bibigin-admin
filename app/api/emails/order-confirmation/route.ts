import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail, defaultBankDetails, OrderConfirmationData } from '@/lib/email'

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
    const emailData: OrderConfirmationData = {
      order,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email
      },
      bankDetails: {
        iban: defaultBankDetails.iban,
        bankName: defaultBankDetails.bankName,
        beneficiary: defaultBankDetails.beneficiary,
        reference: defaultBankDetails.reference(order.id, `${customer.firstName} ${customer.lastName}`)
      }
    }

    // Send email
    await sendOrderConfirmationEmail(emailData)

    const response = NextResponse.json({
      success: true,
      message: 'Order confirmation email sent successfully'
    })
    return addCorsHeaders(response)

  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    
    const response = NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}
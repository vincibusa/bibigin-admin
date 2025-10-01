import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail, defaultBankDetails, OrderConfirmationData } from '@/lib/email'
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
        reference: defaultBankDetails.reference(orderId)
      }
    }

    // Send email
    await sendOrderConfirmationEmail(emailData)

    return NextResponse.json({
      success: true,
      message: 'Order confirmation email sent successfully'
    })

  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      },
      { status: 500 }
    )
  }
}
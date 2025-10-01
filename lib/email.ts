import nodemailer from 'nodemailer'
import { Order } from './types'

// Email configuration interface
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Email template data interfaces
export interface OrderConfirmationData {
  order: Order
  customer: {
    firstName: string
    lastName: string
    email: string
  }
  bankDetails: {
    iban: string
    bankName: string
    beneficiary: string
    reference: string
  }
}

export interface AdminNotificationData {
  order: Order
  customer: {
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  dashboardUrl: string
}

// Get email configuration from environment variables
function getEmailConfig(): EmailConfig {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.EMAIL_PORT || '587')
  const user = process.env.EMAIL_USER
  const pass = process.env.EMAIL_PASS

  if (!user || !pass) {
    throw new Error('Email configuration missing: EMAIL_USER and EMAIL_PASS are required')
  }

  return {
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass
    }
  }
}

// Create nodemailer transporter
function createTransporter() {
  const config = getEmailConfig()
  return nodemailer.createTransport(config)
}

// Format currency for emails
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

// Format order number for emails
function formatOrderNumber(orderId: string): string {
  return `#${orderId.substring(0, 8).toUpperCase()}`
}

// Send order confirmation email to customer
export async function sendOrderConfirmationEmail(data: OrderConfirmationData): Promise<void> {
  try {
    const transporter = createTransporter()
    
    const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_USER
    const fromName = process.env.FROM_NAME || 'BibiGin - Gin delle Fasi Lunari'
    
    const orderNumber = formatOrderNumber(data.order.id)
    
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: data.customer.email,
      subject: `Conferma Ordine ${orderNumber} - BibiGin`,
      html: generateCustomerEmailTemplate(data),
      text: generateCustomerEmailText(data)
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Order confirmation email sent:', result.messageId)
  } catch (error) {
    console.error('Error sending order confirmation email:', error)
    throw new Error('Failed to send order confirmation email')
  }
}

// Send admin notification email
export async function sendAdminNotificationEmail(data: AdminNotificationData): Promise<void> {
  try {
    const transporter = createTransporter()
    
    const fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_USER
    const fromName = process.env.FROM_NAME || 'BibiGin - Sistema Ordini'
    const adminEmail = process.env.ADMIN_EMAIL
    
    if (!adminEmail) {
      throw new Error('ADMIN_EMAIL environment variable is required')
    }
    
    const orderNumber = formatOrderNumber(data.order.id)
    
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: adminEmail,
      subject: `🔔 Nuovo Ordine ${orderNumber} - ${data.customer.firstName} ${data.customer.lastName}`,
      html: generateAdminEmailTemplate(data),
      text: generateAdminEmailText(data)
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Admin notification email sent:', result.messageId)
  } catch (error) {
    console.error('Error sending admin notification email:', error)
    throw new Error('Failed to send admin notification email')
  }
}

// Generate HTML template for customer confirmation email  
function generateCustomerEmailTemplate(data: OrderConfirmationData): string {
  const orderNumber = formatOrderNumber(data.order.id)
  const orderDate = data.order.createdAt.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  })
  
  // Extract shipping address from order
  const shipping = {
    firstName: data.customer.firstName,
    lastName: data.customer.lastName,
    street: data.order.shippingAddress.street,
    city: data.order.shippingAddress.city,
    postalCode: data.order.shippingAddress.postalCode,
    country: data.order.shippingAddress.country
  }
  
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Conferma Ordine ${orderNumber}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #1B2951 0%, #2A3B6B 100%); color: #D4AF37; padding: 30px; text-align: center; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 30px; }
        .order-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .bank-details { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background-color: #1B2951; color: #D4AF37; }
        .total-row { font-weight: bold; background-color: #f8f9fa; }
        .footer { background-color: #1B2951; color: #D4AF37; padding: 20px; text-align: center; font-size: 14px; }
        .gold { color: #D4AF37; }
        .navy { color: #1B2951; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">BibiGin</div>
          <p>Gin delle Fasi Lunari</p>
        </div>
        
        <div class="content">
          <h2 class="navy">Grazie per il tuo ordine!</h2>
          <p>Caro/a <strong>${data.customer.firstName}</strong>,</p>
          <p>Il tuo ordine è stato ricevuto con successo. Di seguito trovi tutti i dettagli:</p>
          
          <div class="order-info">
            <h3 class="navy">Dettagli Ordine</h3>
            <p><strong>Numero Ordine:</strong> <span class="gold">${orderNumber}</span></p>
            <p><strong>Data:</strong> ${orderDate}</p>
            <p><strong>Email:</strong> ${data.customer.email}</p>
          </div>
          
          <h3 class="navy">Prodotti Ordinati</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Prodotto</th>
                <th>Quantità</th>
                <th>Prezzo</th>
                <th>Totale</th>
              </tr>
            </thead>
            <tbody>
              ${data.order.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
              <tr>
                <td colspan="3" style="text-align: right; padding-top: 10px;"><strong>Subtotale:</strong></td>
                <td style="padding-top: 10px;">${formatCurrency(data.order.subtotal || data.order.total)}</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right;"><strong>Spedizione:</strong></td>
                <td>${formatCurrency(data.order.shippingCost || 0)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" style="text-align: right;"><strong>TOTALE:</strong></td>
                <td><strong>${formatCurrency(data.order.total)}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <div class="bank-details">
            <h3 class="navy">💳 Dati per il Bonifico</h3>
            <p><strong>IBAN:</strong> ${data.bankDetails.iban}</p>
            <p><strong>Banca:</strong> ${data.bankDetails.bankName}</p>
            <p><strong>Beneficiario:</strong> ${data.bankDetails.beneficiary}</p>
            <p><strong>Causale:</strong> ${data.bankDetails.reference}</p>
            <p style="font-size: 14px; color: #666; margin-top: 15px;">
              ⚠️ <em>Importante: Includi sempre la causale per identificare il pagamento</em>
            </p>
          </div>
          
          <div class="order-info">
            <h3 class="navy">📦 Spedizione</h3>
            <p><strong>Indirizzo:</strong></p>
            <p>
              ${shipping.firstName} ${shipping.lastName}<br>
              ${shipping.street}<br>
              ${shipping.postalCode} ${shipping.city}<br>
              ${shipping.country}
            </p>
            <p><strong>Tempi di consegna:</strong> 5-7 giorni lavorativi dalla conferma del pagamento</p>
          </div>
          
          <p>Ti invieremo una conferma appena riceveremo il pagamento e provvederemo alla spedizione.</p>
          <p>Per qualsiasi domanda, non esitare a contattarci.</p>
          
          <p style="margin-top: 30px;">
            Cordiali saluti,<br>
            <strong class="gold">Il Team BibiGin</strong>
          </p>
        </div>
        
        <div class="footer">
          <p>&copy; 2024 BibiGin - Gin delle Fasi Lunari</p>
          <p>Email: info@bibiginlacorte.com | Telefono: +39 123 456 7890</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text version for customer email
function generateCustomerEmailText(data: OrderConfirmationData): string {
  const orderNumber = formatOrderNumber(data.order.id)
  const orderDate = data.order.createdAt.toLocaleDateString('it-IT')
  
  return `
BIBIGIN - CONFERMA ORDINE ${orderNumber}

Caro/a ${data.customer.firstName},

Il tuo ordine è stato ricevuto con successo!

DETTAGLI ORDINE:
- Numero: ${orderNumber}
- Data: ${orderDate}
- Email: ${data.customer.email}

PRODOTTI ORDINATI:
${data.order.items.map(item =>
  `- ${item.productName} x${item.quantity} = ${formatCurrency(item.total)}`
).join('\n')}

Subtotale: ${formatCurrency(data.order.subtotal || data.order.total)}
Spedizione: ${formatCurrency(data.order.shippingCost || 0)}
TOTALE: ${formatCurrency(data.order.total)}

DATI BONIFICO:
IBAN: ${data.bankDetails.iban}
Banca: ${data.bankDetails.bankName}
Beneficiario: ${data.bankDetails.beneficiary}
Causale: ${data.bankDetails.reference}

Tempi di consegna: 5-7 giorni lavorativi dalla conferma del pagamento.

Grazie per aver scelto BibiGin!

Il Team BibiGin
info@bibiginlacorte.com
  `
}

// Generate HTML template for admin notification email
function generateAdminEmailTemplate(data: AdminNotificationData): string {
  const orderNumber = formatOrderNumber(data.order.id)
  const orderDate = data.order.createdAt.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  // Extract shipping address
  const shipping = {
    street: data.order.shippingAddress.street,
    city: data.order.shippingAddress.city,
    postalCode: data.order.shippingAddress.postalCode,
    country: data.order.shippingAddress.country
  }
  
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuovo Ordine ${orderNumber}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .alert { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .customer-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background-color: #1B2951; color: #D4AF37; }
        .total-row { font-weight: bold; background-color: #f8f9fa; }
        .actions { background-color: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #1B2951; color: #D4AF37; text-decoration: none; border-radius: 5px; margin: 5px; }
        .footer { background-color: #1B2951; color: #D4AF37; padding: 20px; text-align: center; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 NUOVO ORDINE RICEVUTO</h1>
          <h2>${orderNumber}</h2>
        </div>
        
        <div class="content">
          <div class="alert">
            <strong>Nuovo ordine da processare!</strong><br>
            Ordine ricevuto il ${orderDate}
          </div>
          
          <div class="customer-info">
            <h3>👤 Informazioni Cliente</h3>
            <p><strong>Nome:</strong> ${data.customer.firstName} ${data.customer.lastName}</p>
            <p><strong>Email:</strong> ${data.customer.email}</p>
            ${data.customer.phone ? `<p><strong>Telefono:</strong> ${data.customer.phone}</p>` : ''}
            <p><strong>Indirizzo di spedizione:</strong></p>
            <p>
              ${shipping.street}<br>
              ${shipping.postalCode} ${shipping.city}<br>
              ${shipping.country}
            </p>
          </div>
          
          <h3>📦 Prodotti Ordinati</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Prodotto</th>
                <th>Quantità</th>
                <th>Prezzo</th>
                <th>Totale</th>
              </tr>
            </thead>
            <tbody>
              ${data.order.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
              <tr>
                <td colspan="3" style="text-align: right; padding-top: 10px;"><strong>Subtotale:</strong></td>
                <td style="padding-top: 10px;">${formatCurrency(data.order.subtotal || data.order.total)}</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right;"><strong>Spedizione:</strong></td>
                <td>${formatCurrency(data.order.shippingCost || 0)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" style="text-align: right;"><strong>TOTALE ORDINE:</strong></td>
                <td><strong>${formatCurrency(data.order.total)}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <div class="customer-info">
            <h3>💳 Dettagli Pagamento</h3>
            <p><strong>Metodo:</strong> ${data.order.paymentStatus === 'pending' ? 'Bonifico Bancario' : 'Pagato'}</p>
            <p><strong>Stato:</strong> ${data.order.paymentStatus}</p>
          </div>
          
          <div class="actions">
            <h3>🚀 Azioni Rapide</h3>
            <a href="${data.dashboardUrl}" class="btn">Visualizza nel Gestionale</a>
            <p style="font-size: 14px; margin-top: 15px;">
              Clicca il link sopra per gestire questo ordine nel dashboard amministrativo.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>Sistema Gestionale BibiGin</p>
          <p>Questo è un messaggio automatico - Non rispondere a questa email</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Generate plain text version for admin email
function generateAdminEmailText(data: AdminNotificationData): string {
  const orderNumber = formatOrderNumber(data.order.id)
  const orderDate = data.order.createdAt.toLocaleDateString('it-IT')
  
  return `
NUOVO ORDINE BIBIGIN - ${orderNumber}

Data: ${orderDate}

CLIENTE:
${data.customer.firstName} ${data.customer.lastName}
Email: ${data.customer.email}
${data.customer.phone ? `Telefono: ${data.customer.phone}` : ''}

PRODOTTI:
${data.order.items.map(item =>
  `- ${item.productName} x${item.quantity} = ${formatCurrency(item.total)}`
).join('\n')}

Subtotale: ${formatCurrency(data.order.subtotal || data.order.total)}
Spedizione: ${formatCurrency(data.order.shippingCost || 0)}
TOTALE: ${formatCurrency(data.order.total)}

PAGAMENTO: Bonifico Bancario
STATO: ${data.order.paymentStatus}

Gestionale: ${data.dashboardUrl}
  `
}

// Default bank details
export const defaultBankDetails = {
  iban: 'IT48 Q030 6943 4401 0000 0004 392',
  bankName: 'Banca Intesa Sanpaolo',
  beneficiary: 'BibiGin',
  reference: (orderId: string, customerName: string) => `Acquisto GIN - ${customerName}`
}
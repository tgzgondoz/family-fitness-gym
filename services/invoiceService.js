import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../config/supabase';

export const generateInvoice = async (saleId) => {
  try {
    // Fetch sale data
    const { data: sale } = await supabase
      .from('sales')
      .select(`
        *,
        client:users!sales_client_id_fkey(full_name, email, phone_number),
        staff:users!sales_staff_id_fkey(full_name),
        product:products(name)
      `)
      .eq('id', saleId)
      .single();

    if (!sale) throw new Error('Sale not found');

    // Generate HTML invoice
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: bold; color: #59cb01; }
          .title { font-size: 28px; margin: 20px 0; }
          .info-section { display: flex; justify-content: space-between; margin: 30px 0; }
          .info-box { flex: 1; }
          .table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .table th { background-color: #f8f9fa; }
          .total-section { text-align: right; margin-top: 30px; }
          .total { font-size: 20px; font-weight: bold; color: #59cb01; }
          .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Family Fitness Gym</div>
          <div class="title">INVOICE</div>
          <div>Invoice #: INV-${sale.id.slice(0, 8).toUpperCase()}</div>
          <div>Date: ${new Date(sale.created_at).toLocaleDateString()}</div>
        </div>
        
        <div class="info-section">
          <div class="info-box">
            <h3>Bill To:</h3>
            <p>${sale.client.full_name}</p>
            <p>${sale.client.email}</p>
            <p>${sale.client.phone_number}</p>
          </div>
          <div class="info-box">
            <h3>Sold By:</h3>
            <p>${sale.staff.full_name}</p>
            <p>Family Fitness Gym</p>
            <p>Join the Movement!</p>
          </div>
        </div>
        
        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${sale.product?.name || sale.sale_type === 'subscription' ? 'Gym Membership' : 'Supplement'}</td>
              <td>${sale.quantity}</td>
              <td>$${sale.amount / sale.quantity}</td>
              <td>$${sale.amount}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total">Total: $${sale.amount}</div>
          <div>Tax (15%): $${(sale.amount * 0.15).toFixed(2)}</div>
          <div class="total">Grand Total: $${(sale.amount * 1.15).toFixed(2)}</div>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Family Fitness Gym • Join the Movement • www.familyfitnessgym.com</p>
        </div>
      </body>
      </html>
    `;

    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html });
    
    // Upload to Supabase Storage
    const pdfName = `invoices/invoice-${sale.id}.pdf`;
    const pdfData = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { data, error } = await supabase.storage
      .from('invoices')
      .upload(pdfName, pdfData, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('invoices')
      .getPublicUrl(pdfName);

    // Save invoice record
    await supabase.from('invoices').insert([{
      invoice_number: `INV-${sale.id.slice(0, 8).toUpperCase()}`,
      user_id: sale.client_id,
      sale_id: sale.id,
      amount: sale.amount,
      tax_amount: sale.amount * 0.15,
      total_amount: sale.amount * 1.15,
      items: [{
        name: sale.product?.name || 'Gym Membership',
        quantity: sale.quantity,
        unit_price: sale.amount / sale.quantity,
      }],
      pdf_url: publicUrl,
    }]);

    return publicUrl;
  } catch (error) {
    console.error('Invoice generation error:', error);
    throw error;
  }
};
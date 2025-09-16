/*
 * Contact Form API Endpoint
 * Last Updated: 2025-09-16 09:19:50 IST
 *
 * Handles contact form submissions with:
 * - Email notifications
 * - File upload support
 * - Spam protection
 * - Rate limiting
 * - Form validation
 */

import type { APIRoute } from 'astro';

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Spam protection keywords
const spamKeywords = ['casino', 'viagra', 'porn', 'gambling', 'crypto mining'];

interface ContactFormData {
  service: string;
  timeline: string;
  company: string;
  projectSize: string;
  message: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  contactMethod: string;
  attachment?: File;
  website?: string; // Honeypot field
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Rate limiting check
    const clientIP = clientAddress || 'unknown';
    const now = Date.now();
    const rateLimit = rateLimitStore.get(clientIP) || { count: 0, resetTime: now + 3600000 };

    if (now > rateLimit.resetTime) {
      rateLimit.count = 0;
      rateLimit.resetTime = now + 3600000; // 1 hour
    }

    if (rateLimit.count >= 5) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Too many submissions. Please try again later.'
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse form data
    const formData = await request.formData();
    const data: ContactFormData = {
      service: formData.get('service') as string,
      timeline: formData.get('timeline') as string,
      company: formData.get('company') as string,
      projectSize: formData.get('projectSize') as string,
      message: formData.get('message') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      contactMethod: formData.get('contactMethod') as string,
      attachment: formData.get('attachment') as File,
      website: formData.get('website') as string, // Honeypot
    };

    // Honeypot spam protection
    if (data.website) {
      console.log('Spam detected via honeypot:', clientIP);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate required fields
    if (!data.service || !data.message || !data.firstName || !data.lastName || !data.email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid email address'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Spam keyword detection
    const contentToCheck = `${data.message} ${data.company || ''} ${data.firstName} ${data.lastName}`.toLowerCase();
    const containsSpam = spamKeywords.some(keyword => contentToCheck.includes(keyword));

    if (containsSpam) {
      console.log('Spam detected via keywords:', clientIP);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // File validation
    if (data.attachment && data.attachment.size > 0) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip'
      ];

      if (!allowedTypes.includes(data.attachment.type)) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, ZIP allowed.'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (data.attachment.size > 10 * 1024 * 1024) { // 10MB
        return new Response(JSON.stringify({
          success: false,
          error: 'File too large. Maximum size is 10MB.'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Update rate limit
    rateLimit.count++;
    rateLimitStore.set(clientIP, rateLimit);

    // Create email content
    const emailSubject = `New Contact Form Submission - ${data.service}`;
    const emailBody = `
New contact form submission received:

CONTACT INFORMATION:
- Name: ${data.firstName} ${data.lastName}
- Email: ${data.email}
- Phone: ${data.phone || 'Not provided'}
- Company: ${data.company || 'Not provided'}
- Preferred Contact: ${data.contactMethod}

PROJECT DETAILS:
- Service: ${data.service}
- Timeline: ${data.timeline || 'Not specified'}
- Project Size: ${data.projectSize || 'Not specified'}
- Message: ${data.message}

METADATA:
- Submission Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
- IP Address: ${clientIP}
- Has Attachment: ${data.attachment && data.attachment.size > 0 ? 'Yes' : 'No'}

---
This email was sent from the Ritesource & eExperts contact form.
    `.trim();

    // In production, integrate with your email service (SendGrid, AWS SES, etc.)
    // For now, we'll use a webhook approach that works with services like Zapier, Make.com, or n8n

    try {
      // Example webhook integration (replace with your actual webhook URL)
      const webhookUrl = process.env.CONTACT_FORM_WEBHOOK_URL;

      if (webhookUrl) {
        const webhookPayload = {
          subject: emailSubject,
          body: emailBody,
          data: data,
          timestamp: new Date().toISOString(),
          ip: clientIP
        };

        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        });

        if (!webhookResponse.ok) {
          console.error('Webhook failed:', webhookResponse.status);
        }
      } else {
        // Log to console for development
        console.log('=== NEW CONTACT FORM SUBMISSION ===');
        console.log(emailBody);
        console.log('=====================================');
      }

      // Send auto-reply email to customer
      const autoReplySubject = `Thank you for contacting Ritesource & eExperts`;
      const autoReplyBody = `
Dear ${data.firstName},

Thank you for your interest in our services! We've received your inquiry about ${data.service} and will get back to you within 24 hours during business hours.

Here's a summary of your submission:
- Service: ${data.service}
- Timeline: ${data.timeline || 'Not specified'}
- Project Size: ${data.projectSize || 'Not specified'}

In the meantime, feel free to:
- Browse our services: https://eexperts.info/services
- Contact us directly: +91 79 4895 5466
- Chat with us on WhatsApp: https://wa.me/917948955466

Best regards,
Ritesource & eExperts Team

---
Business Hours (IST):
Monday - Friday: 9:00 AM - 6:00 PM
Saturday: 9:00 AM - 1:00 PM
Sunday: Closed

Office Locations:
Ahmedabad: D-607 Ganesh Glory-11, Jagatpur road, off SG Highway
Valsad: 506, 5th floor, Millennium Empire, Near D-Mart
      `.trim();

      // In production, send actual auto-reply email here

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Your message has been sent successfully. We\'ll get back to you within 24 hours.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'An unexpected error occurred. Please try again or contact us directly.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
# EmailJS Setup Guide

This guide will help you set up EmailJS to enable email functionality for the support forms.

## Prerequisites

1. An EmailJS account (free tier available at https://www.emailjs.com/)
2. An email service (Gmail, Outlook, etc.)

## Step-by-Step Setup

### 1. Create an EmailJS Account

1. Go to https://www.emailjs.com/
2. Sign up for a free account
3. Verify your email address

### 2. Add an Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the instructions to connect your email account
5. Note down your **Service ID** (you'll need this later)

### 3. Create an Email Template

1. Go to **Email Templates** in your EmailJS dashboard
2. Click **Create New Template**
3. Use the following template variables in your email template:

```
Subject: Support Request from {{from_name}}

From: {{from_name}} ({{from_email}})
Phone: {{phone}}
Order Number: {{order_number}}

Message:
{{message}}
```

4. Save the template and note down your **Template ID**

### 4. Get Your Public Key

1. Go to **Account** > **General** in your EmailJS dashboard
2. Find your **Public Key** under API Keys
3. Copy this key

### 5. Configure Environment Variables

1. Create a `.env` file in the `frontend` directory (if it doesn't exist)
2. Add the following variables:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

3. Replace the placeholder values with your actual EmailJS credentials

### 6. Restart Your Development Server

After adding the environment variables, restart your Vite development server:

```bash
npm run dev
```

## Testing

1. Go to the Contact Support page (`/support`) or Help Center (`/help`)
2. Fill out the support form
3. Submit the form
4. Check your email inbox for the support request

## Troubleshooting

### Email not sending?

1. **Check your environment variables**: Make sure all three variables are set correctly in your `.env` file
2. **Verify EmailJS credentials**: Double-check your Service ID, Template ID, and Public Key
3. **Check browser console**: Look for any error messages in the browser console
4. **EmailJS dashboard**: Check the EmailJS dashboard for any error logs or quota limits

### Template variables not working?

Make sure your EmailJS template uses the exact variable names:
- `{{from_name}}`
- `{{from_email}}`
- `{{phone}}`
- `{{order_number}}`
- `{{message}}`

## Notes

- The free tier of EmailJS allows 200 emails per month
- For production use, consider upgrading to a paid plan
- Make sure to add `.env` to your `.gitignore` file to keep your credentials secure




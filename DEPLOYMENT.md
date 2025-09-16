# Deployment Guide for eExperts & Ritesource Website

*Last Updated: 2025-09-16 09:19:50 IST*

## 🚀 Pre-Deployment Checklist

### ✅ Completed Items
- [x] Build optimization and performance tuning
- [x] Contact form backend API implementation
- [x] Analytics and error tracking setup
- [x] Security headers configuration
- [x] SEO optimization with meta tags
- [x] Mobile responsiveness
- [x] Service worker for offline functionality
- [x] Favicon and Open Graph images (placeholders)
- [x] Environment variables template
- [x] 404 error page
- [x] Robots.txt and SEO configuration

### ❌ Critical Items Needed Before Production

#### 1. Environment Variables (Copy .env.example to .env)
```bash
# Required for deployment
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id

# Contact form (choose one)
CONTACT_FORM_WEBHOOK_URL=https://hooks.zapier.com/your_webhook
# OR
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@eexperts.info
SENDGRID_TO_EMAIL=contact@eexperts.info

# Business info
WHATSAPP_NUMBER=917948955466
CALENDLY_URL=https://calendly.com/your_username
```

#### 2. Replace Placeholder Assets
```bash
# Replace these placeholder files with real content:
public/favicon.png           # 32x32 PNG company favicon
public/apple-touch-icon.png  # 180x180 PNG for iOS devices
public/og-image.png          # 1200x630 PNG for social sharing

# Replace placeholder PDFs in public/downloads/ with real content:
- healthcare-qa-compliance-guide.pdf
- software-testing-methodologies.pdf
- geospatial-data-analysis-guide.pdf
- electronics-data-processing.pdf
- quality-assurance-checklist.pdf
- hipaa-compliance-handbook.pdf

# Add real images to public/images/:
- team/ (team member photos)
- testimonials/ (client photos/logos)
- case-studies/ (project screenshots)
- services/ (service illustrations)
```

#### 3. Content Updates
- Update testimonials with real client information
- Add actual case study content and results
- Replace Lorem ipsum text with real company content
- Update team member information and photos

---

## 🔧 Deployment Steps

### Step 1: Environment Setup
1. **Cloudflare Account Setup**
   - Create Cloudflare account if not exists
   - Get API token from Cloudflare dashboard
   - Note down Account ID

2. **GitHub Secrets Configuration**
   ```bash
   # Add these secrets to GitHub repository:
   CLOUDFLARE_API_TOKEN
   CLOUDFLARE_ACCOUNT_ID
   ```

### Step 2: Domain Configuration
1. **DNS Setup**
   - Point domain `eexperts.info` to Cloudflare
   - Configure DNS records as needed
   - Enable Cloudflare proxy (orange cloud)

2. **SSL Certificate**
   - Enable "Always Use HTTPS" in Cloudflare
   - Set SSL/TLS encryption mode to "Full (strict)"
   - Configure HTTP Strict Transport Security (HSTS)

### Step 3: Email Service Setup (Choose One)

#### Option A: SendGrid (Recommended for HIPAA)
```bash
1. Create SendGrid account
2. Generate API key
3. Set up domain authentication
4. Configure HIPAA compliance features
5. Add API key to environment variables
```

#### Option B: Web3Forms (Simpler Alternative)
```bash
1. Sign up at web3forms.com
2. Get access key
3. Update contact form to use Web3Forms endpoint
4. No server-side configuration needed
```

#### Option C: Zapier Webhook (No-code Solution)
```bash
1. Create Zapier account
2. Set up webhook trigger
3. Connect to email service (Gmail, Outlook, etc.)
4. Add webhook URL to environment variables
```

### Step 4: Analytics Setup
1. **Plausible Analytics**
   ```bash
   1. Create account at plausible.io
   2. Add domain: eexperts.info
   3. Verify domain ownership
   4. Configure goals in dashboard:
      - Form Submitted
      - Service Interest
      - Contact Method Used
      - Fast Page Load
      - High Engagement
      - Download
      - Quote Request
   ```

2. **Error Monitoring (Optional)**
   ```bash
   1. Sign up for Sentry.io
   2. Create new project
   3. Add DSN to environment variables
   4. Configure error alerts
   ```

### Step 5: Deploy to Cloudflare Pages
1. **Automatic Deployment (Recommended)**
   ```bash
   1. Push code to main branch
   2. GitHub Actions will automatically deploy
   3. Check GitHub Actions tab for deployment status
   4. Site will be live at: https://eexperts.info
   ```

2. **Manual Deployment (If needed)**
   ```bash
   # Build locally
   npm run build

   # Deploy using Wrangler CLI
   npx wrangler pages deploy dist --project-name eexperts-website
   ```

---

## 🔍 Post-Deployment Verification

### 1. Functionality Tests
- [ ] All pages load correctly
- [ ] Contact form submits successfully
- [ ] WhatsApp links work
- [ ] File downloads work
- [ ] Dark mode toggle functions
- [ ] Mobile responsiveness
- [ ] Service worker caching

### 2. Performance Tests
- [ ] Page load times < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals pass
- [ ] Images optimized and loading

### 3. SEO Verification
- [ ] All pages have proper titles and meta descriptions
- [ ] Open Graph images display correctly
- [ ] Sitemap.xml accessible
- [ ] Robots.txt configured
- [ ] Google Search Console setup

### 4. Security Verification
- [ ] HTTPS working correctly
- [ ] Security headers present
- [ ] No console errors
- [ ] CSP policies working
- [ ] Form spam protection active

### 5. Analytics Verification
- [ ] Plausible tracking working
- [ ] Custom events firing
- [ ] Goals tracking properly
- [ ] Error tracking functional

---

## 🚨 Emergency Procedures

### If Site Goes Down
1. Check Cloudflare status
2. Verify DNS configuration
3. Check GitHub Actions for deployment errors
4. Rollback to previous version if needed:
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main
   ```

### If Contact Form Fails
1. Check email service status
2. Verify webhook endpoint
3. Check environment variables
4. Test API endpoint directly
5. Fallback: Display direct contact information

### If Performance Issues
1. Check Cloudflare cache settings
2. Verify image optimization
3. Review JavaScript errors
4. Check third-party service status

---

## 📊 Monitoring & Maintenance

### Daily Checks
- [ ] Site accessibility
- [ ] Contact form functionality
- [ ] Analytics data collection

### Weekly Checks
- [ ] Performance metrics
- [ ] Error logs review
- [ ] User feedback review
- [ ] SEO ranking changes

### Monthly Tasks
- [ ] Security updates
- [ ] Content updates
- [ ] Analytics review
- [ ] Backup verification
- [ ] Performance optimization

---

## 📞 Support Contacts

**Technical Issues:**
- GitHub Issues: Create issue in repository
- Emergency: Contact development team

**Content Updates:**
- Content team: [contact@eexperts.info]
- Marketing team: [marketing@eexperts.info]

**Business Inquiries:**
- General: +91 79 4895 5466
- WhatsApp: +91 79 4895 5466

---

## 🔗 Important URLs

**Production Site:** https://eexperts.info
**Cloudflare Dashboard:** https://dash.cloudflare.com
**GitHub Repository:** https://github.com/your-username/eexperts-website
**Analytics Dashboard:** https://plausible.io/eexperts.info

---

*This deployment guide should be updated whenever significant changes are made to the deployment process or infrastructure.*
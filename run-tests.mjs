/*
 * Direct Playwright Test Runner
 * Last Updated: 2025-09-16 09:19:50 IST
 *
 * Comprehensive functionality testing using Playwright
 */

import { chromium } from 'playwright';

const baseUrl = 'http://localhost:4321';
const testResults = {
  pages: [],
  navigation: [],
  forms: [],
  interactive: [],
  mobile: [],
  performance: [],
  accessibility: [],
  links: [],
  errors: [],
  summary: { totalTests: 0, passed: 0, failed: 0, warnings: 0 }
};

function trackTest(category, test, status, details = '') {
  const result = { test, status, details, timestamp: new Date().toISOString() };

  if (testResults[category]) {
    testResults[category].push(result);
  }

  testResults.summary.totalTests++;
  if (status === 'PASS') testResults.summary.passed++;
  else if (status === 'FAIL') testResults.summary.failed++;
  else if (status === 'WARN') testResults.summary.warnings++;

  const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
  console.log(`  ${icon} ${test}: ${details}`);
}

async function runComprehensiveTests() {
  console.log('🔍 Starting Comprehensive Website Testing...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Page Loading and Navigation
    console.log('📄 Testing Page Loading and Navigation...');
    const pages = [
      { url: '/', title: 'Home | Ritesource & eExperts', expectedH1: 'Two Companies, One Vision' },
      { url: '/about', title: 'About Us | Ritesource & eExperts' },
      { url: '/services', title: 'Our Services | Ritesource & eExperts' },
      { url: '/contact', title: 'Contact Us | Ritesource & eExperts' },
      { url: '/resources', title: 'Resources | Ritesource & eExperts' },
      { url: '/services/healthcare-qa', title: 'Healthcare Documentation QA Services' },
      { url: '/offline', title: 'Offline | Ritesource & eExperts' },
      { url: '/404', title: 'Page Not Found | Ritesource & eExperts' }
    ];

    for (const pageInfo of pages) {
      try {
        const startTime = Date.now();
        await page.goto(baseUrl + pageInfo.url);
        const loadTime = Date.now() - startTime;

        const title = await page.title();
        const h1 = await page.locator('h1').first().textContent().catch(() => '');

        if (title.includes(pageInfo.title.split(' |')[0])) {
          trackTest('pages', `${pageInfo.url} loads correctly`, 'PASS',
            `Load time: ${loadTime}ms, Title: ${title}`);
        } else {
          trackTest('pages', `${pageInfo.url} title check`, 'FAIL',
            `Expected: ${pageInfo.title}, Got: ${title}`);
        }

        if (loadTime < 3000) {
          trackTest('performance', `${pageInfo.url} performance`, 'PASS', `${loadTime}ms`);
        } else {
          trackTest('performance', `${pageInfo.url} performance`, 'WARN', `${loadTime}ms (>3s)`);
        }

      } catch (error) {
        trackTest('pages', `${pageInfo.url} load error`, 'FAIL', error.message);
      }
    }

    // Test 2: Navigation Menu
    console.log('\n🧭 Testing Navigation Menu...');
    try {
      await page.goto(baseUrl);

      const navLinks = await page.locator('nav a').count();
      if (navLinks > 0) {
        trackTest('navigation', 'Navigation menu presence', 'PASS', `${navLinks} navigation links found`);

        // Test first few navigation links
        const links = await page.locator('nav a').all();
        for (let i = 0; i < Math.min(links.length, 5); i++) {
          const link = links[i];
          const href = await link.getAttribute('href');
          const text = await link.textContent();

          if (href && href.startsWith('/')) {
            await link.click();
            await page.waitForTimeout(1000);
            const currentUrl = page.url();

            if (currentUrl.includes(href) || currentUrl === baseUrl + href || currentUrl === baseUrl + href + '/') {
              trackTest('navigation', `Nav link: ${text?.trim()}`, 'PASS', `${href} navigation works`);
            } else {
              trackTest('navigation', `Nav link: ${text?.trim()}`, 'WARN', `Navigation may not work correctly`);
            }
          }
        }
      } else {
        trackTest('navigation', 'Navigation menu', 'FAIL', 'No navigation links found');
      }
    } catch (error) {
      trackTest('navigation', 'Navigation test', 'FAIL', error.message);
    }

    // Test 3: Contact Form
    console.log('\n📝 Testing Contact Form...');
    try {
      await page.goto(baseUrl + '/contact');

      const contactForm = await page.locator('#contact-form, form').first().isVisible();
      if (contactForm) {
        trackTest('forms', 'Contact form visibility', 'PASS', 'Contact form is visible');

        // Test form fields
        const formFields = ['#firstName', '#lastName', '#email', '#message', '#company'];
        let workingFields = 0;

        for (const field of formFields) {
          try {
            const fieldElement = page.locator(field);
            if (await fieldElement.isVisible()) {
              await fieldElement.fill('Test value');
              const value = await fieldElement.inputValue();
              if (value === 'Test value') {
                workingFields++;
              }
            }
          } catch (e) {
            // Field might not exist
          }
        }

        trackTest('forms', 'Form fields functionality', workingFields > 0 ? 'PASS' : 'WARN',
          `${workingFields}/${formFields.length} fields working`);

        // Test service selection
        const serviceOptions = await page.locator('input[name="service"]').count();
        if (serviceOptions > 0) {
          trackTest('forms', 'Service selection options', 'PASS', `${serviceOptions} service options available`);
        } else {
          trackTest('forms', 'Service selection', 'WARN', 'No service selection options found');
        }

      } else {
        trackTest('forms', 'Contact form', 'FAIL', 'Contact form not found');
      }
    } catch (error) {
      trackTest('forms', 'Contact form test', 'FAIL', error.message);
    }

    // Test 4: Interactive Components
    console.log('\n🎮 Testing Interactive Components...');
    try {
      await page.goto(baseUrl);

      // Test live chat widget
      const chatTrigger = await page.locator('#chat-trigger, .chat-trigger').isVisible();
      if (chatTrigger) {
        await page.locator('#chat-trigger, .chat-trigger').first().click();
        await page.waitForTimeout(1000);

        const chatPanel = await page.locator('#chat-panel, .chat-panel').isVisible();
        trackTest('interactive', 'Live chat widget', chatPanel ? 'PASS' : 'FAIL',
          'Chat widget ' + (chatPanel ? 'opens correctly' : 'does not open'));
      } else {
        trackTest('interactive', 'Live chat widget', 'WARN', 'Chat trigger not found');
      }

      // Test dark mode toggle
      const darkModeToggle = await page.locator('button[aria-label*="dark"], .dark-mode-toggle').isVisible();
      if (darkModeToggle) {
        await page.locator('button[aria-label*="dark"], .dark-mode-toggle').first().click();
        await page.waitForTimeout(500);

        const isDark = await page.evaluate(() => {
          return document.documentElement.classList.contains('dark') ||
                 document.documentElement.getAttribute('data-theme') === 'dark';
        });

        trackTest('interactive', 'Dark mode toggle', isDark ? 'PASS' : 'WARN',
          'Dark mode ' + (isDark ? 'activates' : 'may not work'));
      } else {
        trackTest('interactive', 'Dark mode toggle', 'WARN', 'Dark mode toggle not found');
      }

    } catch (error) {
      trackTest('interactive', 'Interactive components', 'FAIL', error.message);
    }

    // Test 5: Mobile Responsiveness
    console.log('\n📱 Testing Mobile Responsiveness...');
    try {
      const devices = [
        { name: 'Mobile Small', width: 320, height: 568 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1280, height: 720 }
      ];

      for (const device of devices) {
        await page.setViewportSize({ width: device.width, height: device.height });
        await page.goto(baseUrl);
        await page.waitForTimeout(1000);

        const body = await page.locator('body').boundingBox();
        if (body && body.width <= device.width + 20) {
          trackTest('mobile', `${device.name} layout`, 'PASS',
            `Content fits within ${device.width}px viewport`);
        } else {
          trackTest('mobile', `${device.name} layout`, 'WARN',
            'Content may overflow viewport');
        }

        // Check mobile menu on smaller screens
        if (device.width <= 768) {
          const mobileMenu = await page.locator('#mobile-menu-button, .mobile-menu-toggle').isVisible();
          trackTest('mobile', `${device.name} mobile menu`, mobileMenu ? 'PASS' : 'WARN',
            'Mobile menu ' + (mobileMenu ? 'available' : 'not found'));
        }
      }
    } catch (error) {
      trackTest('mobile', 'Mobile responsiveness', 'FAIL', error.message);
    }

    // Test 6: Performance Metrics
    console.log('\n⚡ Testing Performance...');
    try {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');

      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');

        return {
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
          loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
        };
      });

      if (performanceMetrics.domContentLoaded < 2000) {
        trackTest('performance', 'DOM Content Loaded', 'PASS', `${performanceMetrics.domContentLoaded}ms`);
      } else {
        trackTest('performance', 'DOM Content Loaded', 'WARN', `${performanceMetrics.domContentLoaded}ms (>2s)`);
      }

      if (performanceMetrics.firstContentfulPaint < 1800) {
        trackTest('performance', 'First Contentful Paint', 'PASS', `${Math.round(performanceMetrics.firstContentfulPaint)}ms`);
      } else {
        trackTest('performance', 'First Contentful Paint', 'WARN', `${Math.round(performanceMetrics.firstContentfulPaint)}ms (>1.8s)`);
      }

    } catch (error) {
      trackTest('performance', 'Performance metrics', 'FAIL', error.message);
    }

    // Test 7: Accessibility
    console.log('\n♿ Testing Accessibility...');
    try {
      await page.goto(baseUrl);

      const h1Count = await page.locator('h1').count();
      trackTest('accessibility', 'H1 heading structure', h1Count === 1 ? 'PASS' : 'WARN',
        `${h1Count} H1 elements found`);

      const images = await page.locator('img').count();
      const imagesWithAlt = await page.locator('img[alt]').count();

      if (images === 0) {
        trackTest('accessibility', 'Image alt attributes', 'PASS', 'No images found');
      } else if (imagesWithAlt === images) {
        trackTest('accessibility', 'Image alt attributes', 'PASS', `All ${images} images have alt text`);
      } else {
        trackTest('accessibility', 'Image alt attributes', 'WARN',
          `${imagesWithAlt}/${images} images have alt text`);
      }

      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      trackTest('accessibility', 'Keyboard navigation', focusedElement ? 'PASS' : 'WARN',
        `Tab navigation ${focusedElement ? 'works' : 'may not work'}`);

    } catch (error) {
      trackTest('accessibility', 'Accessibility test', 'FAIL', error.message);
    }

    // Test 8: Links and Downloads
    console.log('\n🔗 Testing Links and Downloads...');
    try {
      await page.goto(baseUrl);

      const whatsappLinks = await page.locator('a[href*="wa.me"]').count();
      trackTest('links', 'WhatsApp links', whatsappLinks > 0 ? 'PASS' : 'WARN',
        `${whatsappLinks} WhatsApp links found`);

      const emailLinks = await page.locator('a[href^="mailto:"]').count();
      trackTest('links', 'Email links', emailLinks > 0 ? 'PASS' : 'WARN',
        `${emailLinks} email links found`);

      const phoneLinks = await page.locator('a[href^="tel:"]').count();
      trackTest('links', 'Phone links', phoneLinks > 0 ? 'PASS' : 'WARN',
        `${phoneLinks} phone links found`);

      // Test downloads page
      await page.goto(baseUrl + '/resources');
      const downloadLinks = await page.locator('a[href*=".pdf"], a[download]').count();
      trackTest('links', 'Download links', downloadLinks > 0 ? 'PASS' : 'WARN',
        `${downloadLinks} download links found`);

    } catch (error) {
      trackTest('links', 'Links and downloads', 'FAIL', error.message);
    }

    // Test 9: Error Handling
    console.log('\n🚨 Testing Error Handling...');
    try {
      await page.goto(baseUrl + '/nonexistent-page');
      const pageTitle = await page.title();

      if (pageTitle.includes('404') || pageTitle.includes('Not Found')) {
        trackTest('errors', '404 page handling', 'PASS', '404 page displays correctly');
      } else {
        trackTest('errors', '404 page handling', 'FAIL', 'Custom 404 page not working');
      }

      // Test for JavaScript errors
      const jsErrors = [];
      page.on('pageerror', error => jsErrors.push(error.message));

      await page.goto(baseUrl);
      await page.waitForTimeout(2000);

      if (jsErrors.length === 0) {
        trackTest('errors', 'JavaScript errors', 'PASS', 'No JavaScript errors detected');
      } else {
        trackTest('errors', 'JavaScript errors', 'WARN', `${jsErrors.length} JS errors found`);
      }

    } catch (error) {
      trackTest('errors', 'Error handling', 'FAIL', error.message);
    }

  } catch (error) {
    console.error('❌ Critical test failure:', error.message);
    trackTest('errors', 'Critical test failure', 'FAIL', error.message);
  } finally {
    await browser.close();
  }

  // Generate final report
  generateFinalReport();
}

function generateFinalReport() {
  const passRate = (testResults.summary.passed / testResults.summary.totalTests * 100).toFixed(1);

  console.log('\n' + '='.repeat(80));
  console.log('🧪 COMPREHENSIVE FUNCTIONALITY TEST REPORT');
  console.log('='.repeat(80));
  console.log(`📊 Overall Results: ${testResults.summary.passed}/${testResults.summary.totalTests} tests passed (${passRate}%)`);
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log('='.repeat(80));

  // Category summaries
  const categories = ['pages', 'navigation', 'forms', 'interactive', 'mobile', 'performance', 'accessibility', 'links', 'errors'];

  categories.forEach(category => {
    if (testResults[category] && testResults[category].length > 0) {
      const categoryTests = testResults[category];
      const categoryPassed = categoryTests.filter(t => t.status === 'PASS').length;
      const categoryTotal = categoryTests.length;
      const categoryRate = ((categoryPassed / categoryTotal) * 100).toFixed(1);

      console.log(`\n📋 ${category.toUpperCase()}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`);

      // Show detailed results for failed tests
      categoryTests.forEach(result => {
        if (result.status === 'FAIL') {
          console.log(`  ❌ ${result.test}: ${result.details}`);
        }
      });
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('🎯 DEPLOYMENT READINESS ASSESSMENT:');

  if (parseFloat(passRate) >= 95) {
    console.log(`✅ EXCELLENT! Website functionality is outstanding (${passRate}%).`);
    console.log('🚀 Ready for immediate production deployment.');
  } else if (parseFloat(passRate) >= 85) {
    console.log(`👍 VERY GOOD! Website functionality is solid (${passRate}%).`);
    console.log('✅ Ready for production with minor optimizations.');
  } else if (parseFloat(passRate) >= 70) {
    console.log(`⚠️  GOOD! Website functionality is acceptable (${passRate}%).`);
    console.log('🔧 Address warnings before production deployment.');
  } else {
    console.log(`🚨 NEEDS WORK! Website functionality needs improvement (${passRate}%).`);
    console.log('❌ Significant fixes required before deployment.');
  }

  console.log('\n💡 KEY RECOMMENDATIONS:');

  // Critical issues
  const criticalIssues = [];
  categories.forEach(category => {
    if (testResults[category]) {
      testResults[category].filter(r => r.status === 'FAIL').forEach(failure => {
        criticalIssues.push(`${category}: ${failure.test}`);
      });
    }
  });

  if (criticalIssues.length > 0) {
    console.log('\n🔥 CRITICAL FIXES NEEDED:');
    criticalIssues.slice(0, 5).forEach(issue => {
      console.log(`  • ${issue}`);
    });
  }

  // Performance recommendations
  const slowPages = testResults.performance.filter(p => p.status === 'WARN' && p.test.includes('performance'));
  if (slowPages.length > 0) {
    console.log('\n⚡ PERFORMANCE IMPROVEMENTS:');
    slowPages.forEach(slow => {
      console.log(`  • ${slow.test}: ${slow.details}`);
    });
  }

  // Accessibility improvements
  const accessibilityIssues = testResults.accessibility.filter(a => a.status === 'WARN' || a.status === 'FAIL');
  if (accessibilityIssues.length > 0) {
    console.log('\n♿ ACCESSIBILITY IMPROVEMENTS:');
    accessibilityIssues.forEach(issue => {
      console.log(`  • ${issue.test}: ${issue.details}`);
    });
  }

  console.log('='.repeat(80));
  console.log(`📅 Test completed: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
  console.log('='.repeat(80));
}

// Run the tests
runComprehensiveTests().catch(console.error);
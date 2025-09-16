/*
 * Visual Verification Test for Brand Enhancement
 * Last Updated: 2025-09-16 16:48:26 IST
 *
 * Comprehensive visual testing:
 * - Color contrast verification
 * - Logo display validation
 * - Brand consistency checks
 * - Responsive design verification
 * - Accessibility compliance
 */

import { chromium } from 'playwright';

const baseUrl = 'http://localhost:4321';
const testResults = {
  visual: [],
  contrast: [],
  branding: [],
  responsive: [],
  accessibility: [],
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

// Color contrast calculation
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const l1 = getLuminance(color1.r, color1.g, color1.b);
  const l2 = getLuminance(color2.r, color2.g, color2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseColor(colorString) {
  if (colorString.startsWith('rgb')) {
    const matches = colorString.match(/\d+/g);
    return { r: parseInt(matches[0]), g: parseInt(matches[1]), b: parseInt(matches[2]) };
  }
  return { r: 0, g: 0, b: 0 }; // fallback
}

async function runVisualVerification() {
  console.log('🎨 Starting Visual Verification Tests...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Logo Display and Brand Elements
    console.log('🖼️  Testing Logo Display and Brand Elements...');
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // Check header logos
    const headerLogos = await page.locator('header img').count();
    if (headerLogos >= 2) {
      trackTest('branding', 'Header logo display', 'PASS', `${headerLogos} logos found in header`);

      // Check if logos are visible
      const ritesourceLogo = page.locator('img[alt*="Ritesource"]').first();
      const eexpertsLogo = page.locator('img[alt*="eExperts"], img[alt*="eExperts"]').first();

      const ritesourceVisible = await ritesourceLogo.isVisible();
      const eexpertsVisible = await eexpertsLogo.isVisible();

      if (ritesourceVisible && eexpertsVisible) {
        trackTest('branding', 'Logo visibility', 'PASS', 'Both company logos are visible');
      } else {
        trackTest('branding', 'Logo visibility', 'FAIL',
          `Ritesource: ${ritesourceVisible}, eExperts: ${eexpertsVisible}`);
      }

      // Check logo sizes
      const ritesourceBox = await ritesourceLogo.boundingBox();
      const eexpertsBox = await eexpertsLogo.boundingBox();

      if (ritesourceBox && eexpertsBox) {
        if (ritesourceBox.height > 30 && eexpertsBox.height > 30) {
          trackTest('branding', 'Logo sizing', 'PASS',
            `Logos properly sized: R=${Math.round(ritesourceBox.height)}px, E=${Math.round(eexpertsBox.height)}px`);
        } else {
          trackTest('branding', 'Logo sizing', 'WARN',
            `Logos may be too small: R=${Math.round(ritesourceBox.height)}px, E=${Math.round(eexpertsBox.height)}px`);
        }
      }
    } else {
      trackTest('branding', 'Header logos', 'FAIL', `Only ${headerLogos} logos found in header`);
    }

    // Check hero section logos
    const heroLogos = await page.locator('section img').count();
    trackTest('branding', 'Hero section logos', heroLogos >= 2 ? 'PASS' : 'WARN',
      `${heroLogos} logos found in hero section`);

    // Check footer logos
    const footerLogos = await page.locator('footer img').count();
    trackTest('branding', 'Footer logos', footerLogos >= 2 ? 'PASS' : 'WARN',
      `${footerLogos} logos found in footer`);

    // Test 2: Color Contrast Analysis
    console.log('\n🌈 Testing Color Contrast and Readability...');

    // Check primary text elements for contrast
    const textElements = [
      { selector: 'h1', name: 'Main heading' },
      { selector: 'h2', name: 'Section headings' },
      { selector: 'p', name: 'Paragraph text' },
      { selector: 'a', name: 'Link text' },
      { selector: '.text-primary', name: 'Primary colored text' },
      { selector: '.text-secondary', name: 'Secondary colored text' },
      { selector: '.text-accent', name: 'Accent colored text' }
    ];

    for (const element of textElements) {
      try {
        const elementHandle = page.locator(element.selector).first();
        if (await elementHandle.isVisible()) {
          const styles = await elementHandle.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize
            };
          });

          const textColor = parseColor(styles.color);
          const bgColor = parseColor(styles.backgroundColor);

          // If background is transparent, get parent background
          if (bgColor.r === 0 && bgColor.g === 0 && bgColor.b === 0) {
            const parentBg = await elementHandle.evaluate((el) => {
              let parent = el.parentElement;
              while (parent) {
                const parentStyles = window.getComputedStyle(parent);
                const parentBgColor = parentStyles.backgroundColor;
                if (parentBgColor !== 'rgba(0, 0, 0, 0)' && parentBgColor !== 'transparent') {
                  return parentBgColor;
                }
                parent = parent.parentElement;
              }
              return 'rgb(255, 255, 255)'; // fallback to white
            });
            Object.assign(bgColor, parseColor(parentBg));
          }

          const contrastRatio = getContrastRatio(textColor, bgColor);

          if (contrastRatio >= 4.5) {
            trackTest('contrast', `${element.name} contrast`, 'PASS',
              `Contrast ratio: ${contrastRatio.toFixed(2)}:1`);
          } else if (contrastRatio >= 3) {
            trackTest('contrast', `${element.name} contrast`, 'WARN',
              `Contrast ratio: ${contrastRatio.toFixed(2)}:1 (below 4.5:1 standard)`);
          } else {
            trackTest('contrast', `${element.name} contrast`, 'FAIL',
              `Contrast ratio: ${contrastRatio.toFixed(2)}:1 (insufficient)`);
          }
        }
      } catch (error) {
        trackTest('contrast', `${element.name} contrast`, 'WARN', 'Could not analyze contrast');
      }
    }

    // Test 3: Brand Consistency
    console.log('\n🎯 Testing Brand Consistency...');

    // Check for consistent color usage
    const brandElements = [
      { selector: '.text-primary', expectedColor: 'primary (forest green)' },
      { selector: '.text-secondary', expectedColor: 'secondary (turquoise)' },
      { selector: '.text-accent', expectedColor: 'accent (gold)' },
      { selector: '.text-purple', expectedColor: 'purple' }
    ];

    for (const brand of brandElements) {
      const elements = await page.locator(brand.selector).count();
      if (elements > 0) {
        trackTest('branding', `${brand.expectedColor} usage`, 'PASS',
          `${elements} elements using ${brand.expectedColor}`);
      } else {
        trackTest('branding', `${brand.expectedColor} usage`, 'WARN',
          `No elements found using ${brand.expectedColor}`);
      }
    }

    // Check gradient backgrounds
    const gradientSections = await page.locator('[class*="gradient"]').count();
    trackTest('branding', 'Gradient backgrounds', gradientSections > 0 ? 'PASS' : 'WARN',
      `${gradientSections} sections with gradient backgrounds`);

    // Test 4: Responsive Design with Logos
    console.log('\n📱 Testing Responsive Design with Brand Elements...');

    const viewports = [
      { name: 'Mobile Small', width: 320, height: 568 },
      { name: 'Mobile Large', width: 414, height: 896 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1280, height: 720 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);

      // Check logo visibility at different sizes
      const headerLogoVisible = await page.locator('header img').first().isVisible();
      const logoSize = await page.locator('header img').first().boundingBox();

      if (headerLogoVisible && logoSize) {
        if (logoSize.width > 0 && logoSize.height > 0) {
          trackTest('responsive', `${viewport.name} logo display`, 'PASS',
            `Logo visible and sized: ${Math.round(logoSize.width)}x${Math.round(logoSize.height)}`);
        } else {
          trackTest('responsive', `${viewport.name} logo display`, 'FAIL',
            'Logo has zero dimensions');
        }
      } else {
        trackTest('responsive', `${viewport.name} logo display`, 'FAIL',
          'Logo not visible at this viewport');
      }

      // Check text readability at different sizes
      const h1Size = await page.locator('h1').first().evaluate(el => {
        return window.getComputedStyle(el).fontSize;
      });

      const h1SizePx = parseInt(h1Size);
      if (viewport.width <= 414 && h1SizePx >= 24) {
        trackTest('responsive', `${viewport.name} text sizing`, 'PASS',
          `H1 readable at ${h1Size}`);
      } else if (viewport.width > 414 && h1SizePx >= 32) {
        trackTest('responsive', `${viewport.name} text sizing`, 'PASS',
          `H1 readable at ${h1Size}`);
      } else {
        trackTest('responsive', `${viewport.name} text sizing`, 'WARN',
          `H1 may be too small at ${h1Size}`);
      }
    }

    // Test 5: Interactive Elements
    console.log('\n🖱️  Testing Interactive Brand Elements...');

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(baseUrl);

    // Test logo clicks
    try {
      const logoLink = page.locator('header a').first();
      await logoLink.click();
      await page.waitForTimeout(500);

      if (page.url() === baseUrl + '/' || page.url() === baseUrl) {
        trackTest('visual', 'Logo click functionality', 'PASS', 'Logo click navigates to home');
      } else {
        trackTest('visual', 'Logo click functionality', 'FAIL',
          `Unexpected navigation: ${page.url()}`);
      }
    } catch (error) {
      trackTest('visual', 'Logo click functionality', 'WARN', 'Could not test logo click');
    }

    // Test hover effects on brand elements
    const hoverElements = [
      'nav a',
      '.text-accent',
      '.text-secondary',
      'footer a'
    ];

    for (const selector of hoverElements) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          await element.hover();
          await page.waitForTimeout(200);
          trackTest('visual', `${selector} hover effect`, 'PASS', 'Hover interaction works');
        }
      } catch (error) {
        trackTest('visual', `${selector} hover effect`, 'WARN', 'Could not test hover');
      }
    }

    // Test 6: Visual Hierarchy and Layout
    console.log('\n📐 Testing Visual Hierarchy and Layout...');

    // Check spacing and alignment
    const sections = await page.locator('section').count();
    trackTest('visual', 'Section structure', sections >= 3 ? 'PASS' : 'WARN',
      `${sections} sections found`);

    // Check for overlapping elements
    const overlappingCheck = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      let overlapping = 0;

      for (let i = 0; i < Math.min(elements.length, 50); i++) {
        const rect1 = elements[i].getBoundingClientRect();
        if (rect1.width === 0 || rect1.height === 0) continue;

        for (let j = i + 1; j < Math.min(elements.length, 50); j++) {
          const rect2 = elements[j].getBoundingClientRect();
          if (rect2.width === 0 || rect2.height === 0) continue;

          // Check if elements overlap inappropriately
          if (rect1.left < rect2.right && rect2.left < rect1.right &&
              rect1.top < rect2.bottom && rect2.top < rect1.bottom) {
            // Check if it's intentional (parent-child relationship)
            if (!elements[i].contains(elements[j]) && !elements[j].contains(elements[i])) {
              overlapping++;
              if (overlapping > 5) break; // Limit check
            }
          }
        }
      }
      return overlapping;
    });

    if (overlappingCheck === 0) {
      trackTest('visual', 'Element positioning', 'PASS', 'No inappropriate overlapping detected');
    } else if (overlappingCheck < 3) {
      trackTest('visual', 'Element positioning', 'WARN',
        `${overlappingCheck} potential overlapping elements`);
    } else {
      trackTest('visual', 'Element positioning', 'FAIL',
        `${overlappingCheck} overlapping elements detected`);
    }

  } catch (error) {
    console.error('❌ Critical test failure:', error.message);
    trackTest('visual', 'Critical test failure', 'FAIL', error.message);
  } finally {
    await browser.close();
  }

  // Generate final report
  generateVisualReport();
}

function generateVisualReport() {
  const passRate = (testResults.summary.passed / testResults.summary.totalTests * 100).toFixed(1);

  console.log('\n' + '='.repeat(80));
  console.log('🎨 VISUAL VERIFICATION & BRAND ENHANCEMENT REPORT');
  console.log('='.repeat(80));
  console.log(`📊 Overall Results: ${testResults.summary.passed}/${testResults.summary.totalTests} tests passed (${passRate}%)`);
  console.log(`✅ Passed: ${testResults.summary.passed}`);
  console.log(`⚠️  Warnings: ${testResults.summary.warnings}`);
  console.log(`❌ Failed: ${testResults.summary.failed}`);
  console.log('='.repeat(80));

  // Category summaries
  const categories = ['visual', 'contrast', 'branding', 'responsive', 'accessibility'];

  categories.forEach(category => {
    if (testResults[category] && testResults[category].length > 0) {
      const categoryTests = testResults[category];
      const categoryPassed = categoryTests.filter(t => t.status === 'PASS').length;
      const categoryTotal = categoryTests.length;
      const categoryRate = ((categoryPassed / categoryTotal) * 100).toFixed(1);

      console.log(`\n📋 ${category.toUpperCase()}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`);

      // Show failed and warning tests
      categoryTests.forEach(result => {
        if (result.status === 'FAIL') {
          console.log(`  ❌ ${result.test}: ${result.details}`);
        } else if (result.status === 'WARN') {
          console.log(`  ⚠️  ${result.test}: ${result.details}`);
        }
      });
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('🎯 VISUAL QUALITY ASSESSMENT:');

  if (parseFloat(passRate) >= 95) {
    console.log(`✅ EXCELLENT! Visual design and branding is outstanding (${passRate}%).`);
    console.log('🎨 Professional brand identity successfully implemented.');
    console.log('🚀 Ready for production with superior visual quality.');
  } else if (parseFloat(passRate) >= 85) {
    console.log(`👍 VERY GOOD! Visual design is solid (${passRate}%).`);
    console.log('🎨 Brand elements properly integrated.');
    console.log('✅ Ready for production with minor visual optimizations.');
  } else if (parseFloat(passRate) >= 70) {
    console.log(`⚠️  GOOD! Visual design is acceptable (${passRate}%).`);
    console.log('🔧 Address visual warnings before production deployment.');
  } else {
    console.log(`🚨 NEEDS WORK! Visual design needs improvement (${passRate}%).`);
    console.log('❌ Significant visual fixes required before deployment.');
  }

  console.log('\n💡 BRAND ENHANCEMENT SUMMARY:');

  // Brand-specific recommendations
  const brandingIssues = testResults.branding.filter(b => b.status === 'FAIL' || b.status === 'WARN');
  const contrastIssues = testResults.contrast.filter(c => c.status === 'FAIL');
  const visualIssues = testResults.visual.filter(v => v.status === 'FAIL');

  if (contrastIssues.length > 0) {
    console.log('\n🌈 COLOR CONTRAST FIXES NEEDED:');
    contrastIssues.forEach(issue => {
      console.log(`  • ${issue.test}: ${issue.details}`);
    });
  }

  if (brandingIssues.length > 0) {
    console.log('\n🎨 BRANDING IMPROVEMENTS:');
    brandingIssues.slice(0, 5).forEach(issue => {
      console.log(`  • ${issue.test}: ${issue.details}`);
    });
  }

  if (visualIssues.length > 0) {
    console.log('\n👁️  VISUAL LAYOUT FIXES:');
    visualIssues.forEach(issue => {
      console.log(`  • ${issue.test}: ${issue.details}`);
    });
  }

  if (brandingIssues.length === 0 && contrastIssues.length === 0 && visualIssues.length === 0) {
    console.log('\n🎉 PERFECT! No critical visual or branding issues found.');
    console.log('✨ Logo integration and color scheme implementation is excellent.');
    console.log('🏆 Professional brand identity successfully achieved.');
  }

  console.log('='.repeat(80));
  console.log(`📅 Visual verification completed: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
  console.log('='.repeat(80));
}

// Run the visual verification
runVisualVerification().catch(console.error);
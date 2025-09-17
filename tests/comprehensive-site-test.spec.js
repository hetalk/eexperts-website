// Comprehensive Website Functional Test
// Last Updated: 2025-09-17 10:00:00 IST

import { test, expect } from '@playwright/test';
import axe from 'axe-core';

test.describe('eExperts Website Comprehensive Functional Test', () => {
  // Test all pages to be checked
  const pages = [
    '/',
    '/services',
    '/contact',
    '/about'
  ];

  // Accessibility and visual consistency checks for each page
  pages.forEach(page => {
    test(`Page ${page}: Visual and Accessibility Check`, async ({ page: browserPage }) => {
      await browserPage.goto(page);

      // Visual Regression Check
      expect(await browserPage.screenshot()).toMatchSnapshot(`${page}-page.png`);

      // Accessibility Testing with Axe
      const accessibilityResults = await browserPage.evaluate(() => {
        return new Promise((resolve) => {
          axe.run((err, results) => {
            if (err) resolve({ violations: [] });
            resolve(results);
          });
        });
      });

      expect(accessibilityResults.violations.length).toBe(0,
        `Accessibility violations found on ${page}: ${JSON.stringify(accessibilityResults.violations, null, 2)}`
      );
    });
  });

  // Header Navigation Test
  test('Header Navigation Functionality', async ({ page }) => {
    await page.goto('/');
    const navLinks = await page.locator('header nav a');
    const linkCount = await navLinks.count();

    expect(linkCount).toBeGreaterThan(0, 'Header should have navigation links');

    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');

      await link.click();
      await page.waitForURL('**' + href);

      expect(page.url()).toContain(href);
      await page.goBack();
    }
  });

  // Dark Mode Toggle Test
  test('Dark Mode Toggle', async ({ page }) => {
    await page.goto('/');
    const darkModeToggle = await page.locator('[data-testid="dark-mode-toggle"]');

    expect(darkModeToggle).toBeTruthy('Dark mode toggle should exist');

    // Toggle dark mode and verify body class changes
    await darkModeToggle.click();
    const bodyClass = await page.locator('body').getAttribute('class');
    expect(bodyClass).toContain('dark', 'Body should have dark class after toggle');

    await darkModeToggle.click();
    const lightBodyClass = await page.locator('body').getAttribute('class');
    expect(lightBodyClass).not.toContain('dark', 'Body should not have dark class in light mode');
  });

  // Contact Form Test
  test('Contact Form Submission', async ({ page }) => {
    await page.goto('/contact');

    // Fill out contact form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('textarea[name="message"]', 'Test contact form submission');

    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.click();

    // Verify form submission success message
    const successMessage = await page.locator('.form-success');
    expect(await successMessage.isVisible()).toBeTruthy('Form submission success message should be visible');
  });

  // Responsive Design Test
  test('Responsive Design Check', async ({ page }) => {
    const viewports = [
      { width: 375, height: 812 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1280, height: 800 },  // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');

      // Check critical elements are visible and properly sized
      const header = await page.locator('header');
      const footer = await page.locator('footer');

      expect(await header.isVisible()).toBeTruthy(`Header should be visible at ${viewport.width}px`);
      expect(await footer.isVisible()).toBeTruthy(`Footer should be visible at ${viewport.width}px`);
    }
  });

  // Performance and Loading Test
  test('Page Performance Check', async ({ page }) => {
    await page.goto('/');

    const metrics = await page.evaluate(() => {
      const performance = window.performance;
      const timing = performance.timing;

      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        firstContentfulPaint: performance.getEntriesByType('paint')
          .find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
      };
    });

    // Performance budgets
    expect(metrics.loadTime).toBeLessThan(3000, 'Total load time should be under 3 seconds');
    expect(metrics.domInteractive).toBeLessThan(1500, 'DOM interactive time should be under 1.5 seconds');
    expect(metrics.firstContentfulPaint).toBeLessThan(1000, 'First contentful paint should be under 1 second');
  });
});
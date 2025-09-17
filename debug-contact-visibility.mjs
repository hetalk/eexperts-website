import { chromium } from 'playwright';

async function debugContactVisibility() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:4321/contact');
    await page.waitForLoadState('networkidle');

    console.log('🔍 Debugging Contact Page Text Visibility...\n');

    function parseColor(colorStr) {
      const match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        return {
          r: parseInt(match[1]),
          g: parseInt(match[2]),
          b: parseInt(match[3])
        };
      }
      return { r: 0, g: 0, b: 0 };
    }

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

    // Check various text elements on contact page
    const textSelectors = [
      'h1', 'h2', 'h3', 'h4', 'p', 'label', 'input', 'textarea', 'button', 'span', 'div'
    ];

    console.log('📊 Analyzing text elements for visibility issues:\n');

    for (const selector of textSelectors) {
      const elements = await page.locator(selector).all();

      for (let i = 0; i < Math.min(elements.length, 15); i++) {
        const el = elements[i];

        if (await el.isVisible()) {
          const text = await el.textContent();
          if (!text || text.trim().length === 0) continue;

          const shortText = text.slice(0, 60).replace(/\n/g, ' ').trim();
          if (shortText.length === 0) continue;

          const styles = await el.evaluate((element) => {
            const computed = window.getComputedStyle(element);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize,
              opacity: computed.opacity
            };
          });

          const textColor = parseColor(styles.color);
          let bgColor = parseColor(styles.backgroundColor);

          // If background is transparent, get parent background
          if (bgColor.r === 0 && bgColor.g === 0 && bgColor.b === 0) {
            const parentBg = await el.evaluate((element) => {
              let parent = element.parentElement;
              while (parent) {
                const parentStyles = window.getComputedStyle(parent);
                const parentBgColor = parentStyles.backgroundColor;
                if (parentBgColor !== 'rgba(0, 0, 0, 0)' && parentBgColor !== 'transparent') {
                  return parentBgColor;
                }
                parent = parent.parentElement;
              }
              return 'rgb(255, 255, 255)';
            });
            bgColor = parseColor(parentBg);
          }

          const contrastRatio = getContrastRatio(textColor, bgColor);
          const opacity = parseFloat(styles.opacity);

          // Flag low visibility issues
          if (contrastRatio < 4.5 || opacity < 0.8) {
            console.log(`❌ LOW VISIBILITY: "${shortText}"`);
            console.log(`   Selector: ${selector}`);
            console.log(`   Text Color: rgb(${textColor.r}, ${textColor.g}, ${textColor.b})`);
            console.log(`   BG Color: rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`);
            console.log(`   Contrast: ${contrastRatio.toFixed(2)}:1`);
            console.log(`   Opacity: ${opacity}`);
            console.log(`   Font Size: ${styles.fontSize}`);

            const elementInfo = await el.evaluate((element) => {
              return {
                tagName: element.tagName,
                className: element.className,
                id: element.id
              };
            });

            console.log(`   Element: <${elementInfo.tagName} class="${elementInfo.className}" id="${elementInfo.id}">`);
            console.log('');
          }
        }
      }
    }

    console.log('✅ Visibility analysis completed\n');

  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await browser.close();
  }
}

debugContactVisibility();
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function screenshot() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Capture console
  page.on('console', msg => console.log(`[BROWSER ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.message}`));

  console.log('Navigating to localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for React to render + API calls
  await page.waitForTimeout(8000);

  // Check if page has content
  const bodyHTML = await page.evaluate(() => document.body.innerHTML.length);
  console.log(`Body HTML length: ${bodyHTML}`);

  const bgColor = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log(`Body background: ${bgColor}`);

  // Full page
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'full-page.png'), fullPage: true });
  console.log('Saved: full-page.png');

  // Hero
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'hero.png') });
  console.log('Saved: hero.png');

  // Search
  await page.evaluate(() => document.getElementById('search')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'search.png') });
  console.log('Saved: search.png');

  // Levels
  await page.evaluate(() => document.getElementById('levels')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'levels.png') });
  console.log('Saved: levels.png');

  // Leaderboard
  await page.evaluate(() => document.getElementById('leaderboards')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'leaderboard.png') });
  console.log('Saved: leaderboard.png');

  // Tools
  await page.evaluate(() => document.getElementById('tools')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'tools.png') });
  console.log('Saved: tools.png');

  await browser.close();
  console.log('All screenshots saved to ./screenshots/');
}

screenshot().catch(console.error);

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

  // iPhone 14 Pro viewport
  const page = await browser.newPage({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  page.on('console', msg => console.log(`[BROWSER ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.log(`[PAGE ERROR] ${err.message}`));

  console.log('Loading mobile view...');
  await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);

  // Hero
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-hero.png') });
  console.log('Saved: mobile-hero.png');

  // Scroll through sections
  await page.evaluate(() => document.getElementById('search')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-search.png') });
  console.log('Saved: mobile-search.png');

  await page.evaluate(() => document.getElementById('levels')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-levels.png') });
  console.log('Saved: mobile-levels.png');

  await page.evaluate(() => document.getElementById('leaderboards')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-leaderboard.png') });
  console.log('Saved: mobile-leaderboard.png');

  await page.evaluate(() => document.getElementById('tools')?.scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-tools.png') });
  console.log('Saved: mobile-tools.png');

  // Full page
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-full.png'), fullPage: true });
  console.log('Saved: mobile-full.png');

  await browser.close();
  console.log('All mobile screenshots saved!');
}

screenshot().catch(console.error);

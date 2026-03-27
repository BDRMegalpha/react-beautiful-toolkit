import { chromium } from 'playwright';
import path from 'path';
import os from 'os';

const USER_DATA_DIR = path.join(os.homedir(), '.gd-dash-browser-session');

async function launch(url = 'http://localhost:5173') {
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    channel: 'chromium',
    viewport: { width: 1440, height: 900 },
    args: [
      '--disable-blink-features=AutomationControlled',
      '--start-maximized',
    ],
  });

  const page = context.pages()[0] || await context.newPage();
  await page.goto(url);
  console.log(`Browser launched at ${url} — session persisted to ${USER_DATA_DIR}`);
  return { context, page };
}

launch().catch(console.error);

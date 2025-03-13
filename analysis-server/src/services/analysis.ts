import { Stagehand } from "@browserbasehq/stagehand";
import { Browserbase } from "@browserbasehq/sdk";
import { AnalysisResult } from "../models/types.js";
import { z } from "zod";
import { writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join } from "path";
import { URL } from "url";
import sharp from "sharp";

// Initialize Browserbase client
const browserbase = new Browserbase({
  apiKey: process.env.BROWSERBASE_API_KEY!,
});

// Ensure screenshots directory exists
const screenshotsDir = join(process.cwd(), "screenshots");
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true });
}

// Run page analysis
export async function runPageAnalysis(url: string, pageGroup: string): Promise<string> {
  console.log(`[${new Date().toISOString()}] 📦 Analyzing ${url}...`);

  const existingScreenshot = findLatestScreenshot(url, pageGroup);
  if (existingScreenshot) {
    console.log(
      `[${new Date().toISOString()}] 📸 Found existing screenshot: ${existingScreenshot}`
    );
    return existingScreenshot;
  }

  let stagehand: Stagehand | null = null;
  let screenshotPath: string = "";

  try {
    stagehand = await initializeStagehand();
    const page = stagehand.page;
    const sessionId = await validateSession(stagehand);
    await setupLiveView(sessionId);

    await handlePageNavigation(page, url);

    if (pageGroup === "PDP") {
      console.log(`[${new Date().toISOString()}] 📦 Analyzing product detail page...`);
      await page.waitForSelector("body");
      await new Promise((resolve) => setTimeout(resolve, 10000));

      await navigateToProduct(page);
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const screenshotData = await takeScreenshot(page);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const websiteDir = getWebsiteDir(url);
      screenshotPath = await processScreenshot(screenshotData, pageGroup, websiteDir, timestamp);
    }

    await stagehand.close();
    return screenshotPath;
  } catch (error) {
    console.log(`[${new Date().toISOString()}] 🔥 Error during analysis: ${error}`);
    throw error;
  } finally {
    if (stagehand) {
      try {
        await stagehand.close();
      } catch (closeError) {
        console.log(
          `[${new Date().toISOString()}] ⚠️ Error closing browser session: ${closeError}`
        );
      }
    }
  }
}

async function navigateToProduct(page: Stagehand["page"]): Promise<void> {
  await handleModals(page);
  await handleMainNavigation(page);
  await selectProductCategory(page);
  await handleModals(page);
  await navigateSubcategories(page);
  await handleModals(page);
  await selectProduct(page);
  await handleModals(page);
}

// Modal handling functions
async function handleModals(page: Stagehand["page"]): Promise<void> {
  await page.act({
    action: `Look for and close any popups, modals, or banners that might be blocking the view. This includes:
      1. Cookie consent banners - look for 'accept', 'agree', 'got it', or similar buttons
      2. Newsletter signup modals - look for close buttons or 'no thanks' options
      3. Country/region selection popups - if present, select the default or first option
      4. Age verification modals - if present, confirm being of age
      5. App download prompts - look for 'continue to website' or close options
      6. Chat widgets - minimize if they're blocking content
      7. Survey invites - decline or close them
      
      Close these in order of what's most prominent or blocking.`,
    useVision: true,
  });
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for animations
}

async function handleMainNavigation(page: Stagehand["page"]): Promise<void> {
  await page.act({
    action: `Look for a main navigation menu or hamburger menu. If the main navigation is collapsed or hidden:
      1. Look for and click a hamburger menu icon (usually three lines)
      2. Or look for a "Menu" button
      3. Or look for a "Shop" or "Categories" button
      Wait for the menu to fully expand before proceeding.`,
    useVision: true,
  });
}

async function selectProductCategory(page: Stagehand["page"]): Promise<void> {
  await page.act({
    action: `Look for and click a main product category. Try these in order:
      1. Look for major categories like "Men", "Women", "Electronics", "Home", etc.
      2. If those aren't visible, look for a "Shop All" or "All Categories" option
      3. If you see a mega menu or dropdown, look for the most prominent category
      4. Prioritize categories that clearly lead to products rather than content/info pages
      5. If you are already on a product category page, do not click any other links on the page.
      
      Click the most prominent product category you can find.`,
    useVision: true,
  });
}

async function navigateSubcategories(page: Stagehand["page"]): Promise<void> {
  await page.act({
    action: `If you're now seeing subcategories or a category drilldown:
      1. Look for specific product subcategories (like "Shirts", "Phones", "Furniture")
      2. Choose the first clear product subcategory you see
      3. If there are multiple levels, keep selecting the first clear option
      4. If you see a "View All" option for a category, prefer that
      5. If you are already on a product category page, do not click any other links on the page.
      
      The goal is to reach a page that shows actual products.`,
    useVision: true,
  });
}

async function selectProduct(page: Stagehand["page"]): Promise<void> {
  await page.act({
    action: `Look for and click on a product:
      1. Look for product cards or tiles with images and titles
      2. Choose the first clearly visible product
      3. Make sure it's an actual product and not a category or banner
      4. If you see a grid of products, pick one from the first row
      5. Avoid any "Sold Out" or "Out of Stock" products if possible
      
      Click on the product to go to its detail page.`,
    useVision: true,
  });
}

// Helper function to process and split screenshot
async function processScreenshot(
  data: string,
  pageGroup: string,
  websiteDir: string,
  timestamp: string
): Promise<string> {
  // Save original screenshot
  const filename = `${pageGroup}_${timestamp}.jpg`;
  const filepath = join(websiteDir, filename);
  const screenshotBuffer = Buffer.from(data, "base64");
  writeFileSync(filepath, screenshotBuffer);
  console.log(`[${new Date().toISOString()}] 💾 Screenshot saved to: ${filepath}`);

  // Split the screenshot into three parts
  console.log(`[${new Date().toISOString()}] ✂️ Splitting screenshot into three parts...`);
  const image = sharp(screenshotBuffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    console.log(`[${new Date().toISOString()}] ⚠️ Could not get image dimensions`);
    return filepath;
  }

  // Calculate heights ensuring they are valid integers
  const totalHeight = metadata.height;
  const partHeight = Math.floor(totalHeight / 3);

  try {
    // Create three new Sharp instances from the same buffer for parallel processing
    const parts = [
      {
        name: "part1",
        top: 0,
        height: partHeight,
      },
      {
        name: "part2",
        top: partHeight,
        height: partHeight,
      },
      {
        name: "part3",
        top: partHeight * 2,
        height: totalHeight - partHeight * 2, // Use remaining height for last part
      },
    ];

    // Process all parts in parallel
    await Promise.all(
      parts.map((part) =>
        sharp(screenshotBuffer)
          .extract({
            left: 0,
            top: part.top,
            width: metadata.width as number, // Type assertion since we've already checked for undefined
            height: part.height,
          })
          .jpeg({ quality: 90 })
          .toFile(join(websiteDir, `${pageGroup}_${timestamp}_${part.name}.jpg`))
      )
    );

    console.log(`[${new Date().toISOString()}] ✅ Screenshot split into three parts`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 🔥 Error splitting image:`, error);
    // Return original filepath even if splitting fails
    return filepath;
  }

  return filepath;
}

// Helper function to get website directory name
function getWebsiteDir(url: string): string {
  const parsedUrl = new URL(url);
  const hostname = parsedUrl.hostname.replace(/^www\./, "");
  const websiteDir = join(screenshotsDir, hostname);
  if (!existsSync(websiteDir)) {
    mkdirSync(websiteDir, { recursive: true });
  }
  return websiteDir;
}

// Helper function to check if screenshot exists
function findLatestScreenshot(url: string, pageGroup: string): string | null {
  try {
    const websiteDir = getWebsiteDir(url);
    if (!existsSync(websiteDir)) {
      return null;
    }

    // Get all files in the directory that match the pattern
    const files = readdirSync(websiteDir).filter(
      (file: string) =>
        file.startsWith(`${pageGroup}_`) && file.endsWith(".jpg") && !file.includes("_part")
    );

    if (files.length === 0) {
      return null;
    }

    // Sort files by timestamp (newest first)
    files.sort().reverse();

    // Return the path of the most recent screenshot
    return join(websiteDir, files[0]);
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] ⚠️ Error checking for existing screenshot:`,
      error
    );
    return null;
  }
}

async function takeScreenshot(page: Stagehand["page"]): Promise<string> {
  console.log(`[${new Date().toISOString()}] 📸 Taking screenshot of the product page...`);
  const client = await page.context().newCDPSession(page);
  const { data } = await client.send("Page.captureScreenshot", {
    format: "jpeg",
    quality: 90,
    fromSurface: true,
    captureBeyondViewport: true,
  });
  return data;
}

async function handlePageNavigation(page: Stagehand["page"], url: string): Promise<void> {
  try {
    await Promise.race([
      page.goto(url, { waitUntil: "networkidle" }),
      new Promise((resolve) => setTimeout(resolve, 10000)),
    ]);
  } catch (error) {
    console.log(
      `[${new Date().toISOString()}] ⚠️ Navigation timeout or error, continuing anyway:`,
      error
    );
  }

  if (!page.url().includes(url)) {
    await page.goto(url, { waitUntil: "commit", timeout: 30000 });
  }
}

async function initializeStagehand(): Promise<Stagehand> {
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: process.env.BROWSERBASE_API_KEY,
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    verbose: 1,
    modelName: "gpt-4o",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    browserbaseSessionCreateParams: {
      projectId: process.env.BROWSERBASE_PROJECT_ID!,
      timeout: 600,
      region: "us-east-1",
      browserSettings: {
        recordSession: true,
        solveCaptchas: true,
        viewport: {
          width: 1920,
          height: 3400,
        },
      },
    },
  });

  await stagehand.init();
  return stagehand;
}

async function validateSession(stagehand: Stagehand): Promise<string> {
  const sessionId = stagehand.browserbaseSessionID;
  if (!sessionId) {
    throw new Error("Failed to get Browserbase session ID");
  }
  return sessionId;
}

async function setupLiveView(sessionId: string): Promise<void> {
  const liveViewLinks = await browserbase.sessions.debug(sessionId);
  const liveViewUrl = liveViewLinks.debuggerFullscreenUrl;
  console.log(`[${new Date().toISOString()}] 🔗 Live view is now available at: ${liveViewUrl}`);
}

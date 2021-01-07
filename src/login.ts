import puppeteer from "puppeteer";
import { writeFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();
const user = process.env.USER || "";
const pass = process.env.PASS || "";

(async () => {
  const browser = await puppeteer.launch({
    // headless: false,
    // args: ["--window-size=1400,969"],
  });
  const page = await browser.newPage();

  await page.setViewport({
    width: 1400,
    height: 969,
    deviceScaleFactor: 1,
  });

  await page.goto(`${process.env.URL_SANDBOX}/`);

  await page.waitForSelector("#okta-signin-username");
  await page.type("#okta-signin-username", user);

  await page.waitForSelector("#okta-signin-password");
  await page.type("#okta-signin-password", pass);

  await page.waitForSelector("#input7");
  await page.click("#input7");

  await page.waitForSelector("#okta-signin-submit");
  await page.click("#okta-signin-submit");

  await page.waitForSelector("[data-testid='section-contentCreation']");

  // esto lo puse por si acaso, probar sin esto
  await page.waitFor(3000);

  const cookies = await page.cookies();
  await writeFileSync(
    "./cookies/cookies.json",
    JSON.stringify(cookies, null, 2)
  );

  await browser.close();
})();

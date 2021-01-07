import puppeteer from "puppeteer";
import { writeFileSync, readFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

const ENV: "sandbox" | "production" | string = process.argv[2];

const ENV_URL: string =
  (ENV === "sandbox" ? process.env.URL_SANDBOX : process.env.URL_PROD) || "";

const DEPLOY_VERSION = process.argv[3];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const genFeaturesList = async (page: puppeteer.Page) => {
  const data = await page.evaluate(
    async ({ ENV_URL, DEPLOY_VERSION }) => {
      const response = await fetch(
        `${ENV_URL}/pf/api/v3/configs/features/?d=${DEPLOY_VERSION}`
      );
      const data = await response.json();
      return data.map(({ id, label }: any) => ({
        id,
        label,
      }));
    },
    { ENV_URL, DEPLOY_VERSION }
  );

  writeFileSync(`data/${ENV}/featuresList.json`, JSON.stringify(data, null, 2));
  console.log("featuresList generado");
};

const genPagesInfo = async (page: puppeteer.Page) => {
  const pagesInfo: any[] = [];

  const data: any[] = await page.evaluate(
    async ({ ENV_URL }) => {
      const response = await fetch(`${ENV_URL}/pf/admin/api/page`);
      return await response.json();
    },
    { ENV_URL }
  );

  console.log("obteniendo paginas .....");

  await Promise.all(
    data.map(async ({ id, name, uri, sites, versions, published }: any, i) => {
      await wait(2000 * i);

      const layoutLatestVersion =
        versions[published] && versions[published].stage;

      if (layoutLatestVersion) {
        const data = await page.evaluate(
          async ({ ENV_URL, layoutLatestVersion }) => {
            const response = await fetch(
              `${ENV_URL}/pf/admin/api/rendering/${layoutLatestVersion}`
            );
            return await response.json();
          },
          { ENV_URL, layoutLatestVersion }
        );

        const featuresList: any[] = [];
        if (data.layoutItems) {
          data.layoutItems.forEach(({ renderableItems }: any) => {
            if (renderableItems) {
              renderableItems.forEach(
                ({ featureConfig, chainConfig, features = [] }: any) => {
                  if (featureConfig) {
                    featuresList.push(featureConfig);
                  }
                  if (chainConfig) {
                    featuresList.push(`chains/${chainConfig}`);
                    features.forEach(({ featureConfig }: any) => {
                      featuresList.push(featureConfig);
                    });
                  }
                }
              );
            }
          });
        }
        pagesInfo.push({ id, name, uri, sites, featuresList });
      } else {
        pagesInfo.push({ id, name, uri, sites, featuresList: [] });
      }
      console.log(`${i + 1} de ${data.length}`);
    })
  );

  console.log("pagesInfo generado ....");
  writeFileSync(
    `data/${ENV}/pagesInfo.json`,
    JSON.stringify(pagesInfo, null, 2)
  );
};

const genTemplatesInfo = async (page: puppeteer.Page) => {
  const pagesInfo: any[] = [];

  const data: any[] = await page.evaluate(
    async ({ ENV_URL }) => {
      const response = await fetch(`${ENV_URL}/pf/admin/api/template`);
      return await response.json();
    },
    { ENV_URL }
  );

  console.log("obteniendo templates .....");

  await Promise.all(
    data.map(async ({ id, name, versions, published }: any, i) => {
      await wait(2000 * i);

      const layoutLatestVersion =
        versions[published] && versions[published].stage;

      if (layoutLatestVersion) {
        const data = await page.evaluate(
          async ({ ENV_URL, layoutLatestVersion }) => {
            const response = await fetch(
              `${ENV_URL}/pf/admin/api/rendering/${layoutLatestVersion}`
            );
            return await response.json();
          },
          { ENV_URL, layoutLatestVersion }
        );

        const featuresList: any[] = [];
        if (data.layoutItems) {
          data.layoutItems.forEach(({ renderableItems }: any) => {
            if (renderableItems) {
              renderableItems.forEach(
                ({ featureConfig, chainConfig, features = [] }: any) => {
                  if (featureConfig) {
                    featuresList.push(featureConfig);
                  }
                  if (chainConfig) {
                    featuresList.push(`chains/${chainConfig}`);
                    features.forEach(({ featureConfig }: any) => {
                      featuresList.push(featureConfig);
                    });
                  }
                }
              );
            }
          });
        }
        pagesInfo.push({ id, name, featuresList });
      } else {
        pagesInfo.push({ id, name, featuresList: [] });
      }
      console.log(`${i + 1} de ${data.length}`);
    })
  );

  console.log("templatesInfo generado ....");
  writeFileSync(
    `data/${ENV}/templatesInfo.json`,
    JSON.stringify(pagesInfo, null, 2)
  );
};

(async () => {
  const browser = await puppeteer.launch({
    // headless: false,
    // args: ["--window-size=1400,969"],
  });
  const page = await browser.newPage();

  const cookiesString = readFileSync(`cookies/cookies.json`, "utf8");
  const cookies = JSON.parse(cookiesString);
  await page.setCookie(...cookies);

  await page.setViewport({
    width: 1400,
    height: 969,
    deviceScaleFactor: 1,
  });
  await page.goto(`${ENV_URL}/home/`);

  await page.waitForSelector("[data-testid='section-contentCreation']");

  await genFeaturesList(page);

  await genPagesInfo(page);

  await genTemplatesInfo(page);

  await browser.close();
})();

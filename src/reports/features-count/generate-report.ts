import { promises, writeFile } from "fs";

async function getContent(filePath: string) {
  if (!filePath) {
    throw new Error("filePath required");
  }
  return promises.readFile(filePath, { encoding: "utf-8" });
}

const env: "sandbox" | "production" | string = process.argv[2];

const generateFile = async (outputFileName: string) => {
  const featuresListFile = await getContent(`./data/${env}/featuresList.json`);
  const featuresList = JSON.parse(featuresListFile);

  const pagesInfoFile = await getContent(`./data/${env}/pagesInfo.json`);
  const pageInfo = JSON.parse(pagesInfoFile);

  const templatesInfoFile = await getContent(
    `./data/${env}/templatesInfo.json`
  );
  const templatesInfo = JSON.parse(templatesInfoFile);

  let featuresInAllPages: any[] = [];
  pageInfo.forEach(({ featuresList }: any) => {
    if (featuresList !== "No publicado") {
      featuresInAllPages = featuresInAllPages.concat(featuresList);
    }
  });
  templatesInfo.forEach(({ featuresList }: any) => {
    if (featuresList !== "No publicado") {
      featuresInAllPages = featuresInAllPages.concat(featuresList);
    }
  });
  const counts: any = {};
  featuresInAllPages.forEach((x) => {
    counts[x] = (counts[x] || 0) + 1;
  });

  const featuresWhitCounts = featuresList.map((feature: any) => ({
    count: counts[feature.id],
    ...feature,
  }));

  writeFile(
    outputFileName,
    JSON.stringify(featuresWhitCounts, null, 2),
    "utf8",
    (err) => {
      if (err) throw err;
      console.log(`Archivo "${outputFileName}" generado`);
    }
  );
};

generateFile(`./src/reports/features-count/output/featuresUsage-${env}.json`);

const featuresList = ["separators/stories"];

///////////////////////////////////////////////////////////////////////////////////

import { promises, writeFile } from "fs";

const ENV: "sandbox" | "production" | string = process.argv[2];

async function getContent(filePath: string) {
  if (!filePath) {
    throw new Error("filePath required");
  }
  return promises.readFile(filePath, { encoding: "utf-8" });
}

const generateFile = async (infoFilePath: string, outputFileName: string) => {
  const pagesInfoFile = await getContent(infoFilePath);

  const pagesInfo = JSON.parse(pagesInfoFile);

  const pagesWhereFeatureIsUsed = featuresList.map((feature) => {
    const result: any = { feature, pagesList: [] };

    pagesInfo.forEach(({ name, featuresList }: any) => {
      if (featuresList !== "No publicado" && featuresList.includes(feature)) {
        result.pagesList.push(name);
      }
    });

    return result;
  });
  writeFile(
    outputFileName,
    JSON.stringify(pagesWhereFeatureIsUsed, null, 2),
    "utf8",
    (err: any) => {
      if (err) throw err;
      console.log(`Archivo "${outputFileName}" generado`);
    }
  );
};

generateFile(
  `./data/${ENV}/pagesInfo.json`,
  `./src/reports/features-usage/output/features-pages-${ENV}.json`
);
generateFile(
  `./data/${ENV}/templatesInfo.json`,
  `./src/reports/features-usage/output/features-templates-${ENV}.json`
);

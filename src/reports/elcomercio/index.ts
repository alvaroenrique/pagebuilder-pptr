import { promises, writeFile } from "fs";
import { Feature, Page, Template } from "../../types/data";

const env = "production";

async function getContent(filePath: string) {
  if (!filePath) {
    throw new Error("filePath required");
  }
  return promises.readFile(filePath, { encoding: "utf-8" });
}

function writeJson(jsonObject: Object, outputFileName: string) {
  writeFile(
    outputFileName,
    JSON.stringify(jsonObject, null, 2),
    "utf8",
    (err: any) => {
      if (err) throw err;
      console.log(`Archivo "${outputFileName}" generado`);
    }
  );
}

(async () => {
  const featuresListFile = await getContent(`./data/${env}/featuresList.json`);
  const pagesInfoFile = await getContent(`./data/${env}/pagesInfo.json`);
  const templatesInfoFile = await getContent(
    `./data/${env}/templatesInfo.json`
  );

  const featuresList: Feature[] = JSON.parse(featuresListFile);
  const featureListInKeys: {
    [x: string]: string;
  } = {};
  featuresList.forEach(({ id, label }) => {
    featureListInKeys[id] = label || id;
  });

  const pageInfo: Page[] = JSON.parse(pagesInfoFile);
  const templatesInfo: Template[] = JSON.parse(templatesInfoFile);

  const pageDataFormated = pageInfo
    .filter(({ sites }) => sites.includes("elcomercio"))
    .map((data) => ({
      ...data,
      featuresList: [...new Set(data.featuresList)].map(
        (item) => featureListInKeys[item] || item
      ),
      sites: data.sites.join(","),
    }));

  const templateDataFormated = templatesInfo
    .filter(({ name }) => name.includes("elcomercio") && !name.includes("mag"))
    .map((data) => ({
      ...data,
      featuresList: [...new Set(data.featuresList)].map(
        (item) => featureListInKeys[item] || item
      ),
    }));

  writeJson(pageDataFormated, "pagina.json");
  writeJson(templateDataFormated, "template.json");
  console.log(pageDataFormated);
})();

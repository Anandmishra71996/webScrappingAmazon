const express = require("express");
const puppeteer = require("puppeteer-core");
const cors = require("cors");
const app = express();
app.use(cors);
const port = process.env["Port"] || 5000;

app.get("/scrapeDeals", async (req, res) => {
  const SBR_WS_ENDPOINT =
    "wss://brd-customer-hl_2e9e49a9-zone-scraping_browser:n2fgkz3mdg98@brd.superproxy.io:9222";
  const browser = await puppeteer.connect({
    browserWSEndpoint: SBR_WS_ENDPOINT,
  });
  try {
    const page = await browser.newPage();

    console.log("Connected! Navigating to https://www.amazon.de/deals...");
    await page.goto(
      "https://www.amazon.in/events/greatindianfestival?ref_=nav_cs_gb"
    );
    console.log("reacted page");
    const dealsGrid = await page.waitForSelector(
      ".Grid-module__gridDisplayGrid_2X7cDTY7pjoTwwvSRQbt9Y"
    );

    const products = await dealsGrid.evaluate((dg) => {
      // data scraping...
      console.log("inside evaluate");
      const titleSelector =
        ".DealContent-module__truncate_sWbxETx42ZPStTc9jwySW";
      const linkSelector =
        ".a-link-normal.DealLink-module__dealLink_3v4tPYOP4qJj9bdiy0xAT.a-color-base.a-text-normal";
      const imgSelector =
        ".DealImage-module__imageObjectFit_1G4pEkUEzo9WEnA3Wl0XFv";

      const productElements = dg.querySelectorAll(
        ".DealGridItem-module__dealItemDisplayGrid_e7RQVFWSOrwXBX4i24Tqg.DealGridItem-module__withBorders_2jNNLI6U1oDls7Ten3Dttl.DealGridItem-module__withoutActionButton_2OI8DAanWNRCagYDL2iIqN"
      );
      const productData = [];

      productElements.forEach((element) => {
        const title = element.querySelector(titleSelector)?.innerText;
        if (title) {
          const link = element.querySelector(linkSelector)?.href;
          const img = element.querySelector(imgSelector)?.src;
          productData.push({ title, link, img });
        }
      });
      return productData;
    });
    res.json({ products });
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
  //
});
app.listen(port, () => {
  console.log("listening on " + port);
});

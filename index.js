const puppeteer = require("puppeteer");
const userAgent = require("user-agents");
require("dotenv").config();

// module.exports.run = async (event, context) => {
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(userAgent.random().toString());
  await page.goto("https://www.premierleague.com/");
  await page.click("#onetrust-accept-btn-handler");
  await page.waitForSelector("#advertClose");
  await page.$eval("#advertClose", (element) => element.click());
  await page.waitForSelector(
    "#mainContent > div.tabLinks.homeTabs > div > ul > li:nth-child(2)"
  );
  await page.$eval(
    "#mainContent > div.tabLinks.homeTabs > div > ul > li:nth-child(2)",
    (element) => element.click()
  );
  await page.waitForSelector(
    "#mainContent > div.wrapper.hasFixedSidebar > div > nav > div.fixtures-abridged.calendar > div.fixtures-abridged__list.js-match-list-container > div:nth-child(1) > time"
  );
  const date = await page.$eval(
    "#mainContent > div.wrapper.hasFixedSidebar > div > nav > div.fixtures-abridged.calendar > div.fixtures-abridged__list.js-match-list-container > div:nth-child(1) > time",
    (element) => element.innerHTML
  );
  await page.waitForSelector(
    "#mainContent > div.wrapper.hasFixedSidebar > div > nav > div.fixtures-abridged.calendar > div.fixtures-abridged__list.js-match-list-container > div:nth-child(1) > a:nth-child(3) > time"
  );
  const time = await page.$eval(
    "#mainContent > div.wrapper.hasFixedSidebar > div > nav > div.fixtures-abridged.calendar > div.fixtures-abridged__list.js-match-list-container > div:nth-child(1) > a:nth-child(3) > time",
    (element) => element.innerHTML
  );

  console.log(
    new Date(
      date + time + new Date(Date.now()).getFullYear()
    ).toLocaleString() - new Date(Date.now()).toLocaleString()
  );

  // await browser.close();
})();

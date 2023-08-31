const puppeteer = require("puppeteer");
require("dotenv").config();

// module.exports.run = async (event, context) => {
(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 20,
    args: ["--disable-notifications"],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
  );
  await page.setViewport({ width: 1000, height: 600 });
  await page.setDefaultNavigationTimeout(1000000);
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
    "#mainContent > div.wrapper.hasFixedSidebar > div > nav > div.fixtures-abridged.calendar > div.fixtures-abridged__list.js-match-list-container > div:nth-child(1) > a:nth-child(2) > time"
  );
  const time = await page.$eval(
    "#mainContent > div.wrapper.hasFixedSidebar > div > nav > div.fixtures-abridged.calendar > div.fixtures-abridged__list.js-match-list-container > div:nth-child(1) > a:nth-child(2) > time",
    (element) => element.innerHTML
  );
  const timeDiffmS =
    new Date(date + time + new Date(Date.now()).getFullYear()) -
    new Date(Date.now());
  const timeDiffS = timeDiffmS / 1000;
  const hours = Math.abs(Math.round(timeDiffS / (60 * 60)));

  if (hours < 24) {
    const deadline = new Date(
      new Date(date + time + new Date(Date.now()).getFullYear()) - 5400000
    );
    const deadlineDate = deadline.toDateString("en-AU", {
      timeZone: "Australia/Perth",
    });
    const deadlineTime = deadline.toLocaleTimeString("en-AU", {
      timeZone: "Australia/Perth",
      hour: "2-digit",
      minute: "2-digit",
    });
    await page.goto("https://www.facebook.com/");
    await page.waitForSelector("#email");
    await page.type("#email", process.env.FB_EMAIL);
    await page.type("#pass", process.env.FB_PASSWORD);
    await page.click(`[type="submit"]`);
    await page.waitForSelector(`[aria-label="Messenger"]`);
    await page.click(`[aria-label="Messenger"]`);
    await page.waitForSelector(`[aria-current="false"]`);
    await page.click(`[aria-current="false"]`);
    await page.waitForSelector(`[aria-label="Message"]`);
    await page.type(
      `[aria-label="Message"]`,
      `A friendly reminder that the Fantasy Premier League deadline for the upcoming matchweek is ${deadlineDate} at ${deadlineTime}. Please make any changes to your Fantasy Teams before this deadline.`
    );
    await page.click(`[aria-label="Press Enter to send"]`);
    await browser.close();
  }
  await browser.close();
})();

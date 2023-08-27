const puppeteer = require("puppeteer");
const userAgent = require("user-agents");
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
    "#mainContent > div.wrapper.hasFixedSidebar > div > nav > div.fixtures-abridged.calendar > div.fixtures-abridged__list.js-match-list-container > div:nth-child(2) > time"
  );
  const date = await page.$eval(
    "#mainContent > div.wrapper.hasFixedSidebar > div > nav > div.fixtures-abridged.calendar > div.fixtures-abridged__list.js-match-list-container > div:nth-child(2) > time",
    (element) => element.innerHTML
  );
  await page.waitForSelector(
    "#mainContent > div.wrapper.hasFixedSidebar > div > nav > div.fixtures-abridged.calendar > div.fixtures-abridged__list.js-match-list-container > div:nth-child(2) > a:nth-child(3) > time"
  );
  const time = await page.$eval(
    "#mainContent > div.wrapper.hasFixedSidebar > div > nav > div.fixtures-abridged.calendar > div.fixtures-abridged__list.js-match-list-container > div:nth-child(2) > a:nth-child(3) > time",
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
    ).toLocaleString("en-AU", { timeZone: "Australia/Perth" });
    console.log(deadline);
    // await page.goto("https://www.facebook.com/");
    // await page.waitForSelector("#email");
    // await page.type("#email", process.env.FB_EMAIL);
    // await page.type("#pass", process.env.FB_PASSWORD);
    // await page.click(`[type="submit"]`);
    // await page.waitForSelector(`[aria-label="Messenger"]`);
    // await page.click(`[aria-label="Messenger"]`);
    // await page.waitForSelector(`[aria-current="false"]`);
    // await page.click(`[aria-current="false"]`);
    // await page.waitForSelector(`[aria-label="Message"]`);
    // await page.type(
    //   `[aria-label="Message"]`,
    //   "Hello, my name is Frank Russell, a friendly Fantasy Premier League Reminder Bot developed by Nisarg. My account name couldn't be called Fantasy Premier League Reminder as Facebook wouldn't let me do that for a user account and so my name is Frank Russell. I'm going to try to remind you guys to do your Fantasy Premier League teams every week before the deadline. Hopefully, I don't get banned by Zuckerberg and Nisarg doesn't get a massive bill by the cloud provider I'm deployed on. I'm still in the development/testing stage at the moment but stay tuned."
    // );
    // await page.click(`[aria-label="Press Enter to send"]`);
    // await browser.close();
  }
  await browser.close();
})();

const puppeteer = require("puppeteer");
require("dotenv").config();

// module.exports is a special object in Node.js.
// The module is a variable that represents the current module, and exports is an object that will be exposed as a module.
// So, whatever you assign to module.exports will be exposed as a module.
module.exports.run = async (event, context) => {
  // disable browser notifications
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
  // Changes default navigation timeout from 30 seconds.
  await page.setDefaultNavigationTimeout(1000000);
  await page.goto("https://www.premierleague.com/");
  await page.click("#onetrust-accept-btn-handler");
  await page.waitForSelector("#advertClose");
  await page.$eval("#advertClose", (element) => element.click());
  // Waits for the selectors before scrapping the date and time of the first game of the matchweek.
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

  // Calculate the difference in milliseconds between the date and time of the first game of the matchweek and the time that this function is run.
  // Convert the difference to hours.
  const timeDiffmS =
    new Date(date + time + new Date(Date.now()).getFullYear()) -
    new Date(Date.now());
  const timeDiffS = timeDiffmS / 1000;
  const hours = Math.abs(Math.round(timeDiffS / (60 * 60)));
  console.log("Difference in hours: ", hours);

  // If the difference in hours is less than or equal to 24.
  if (hours <= 24) {
    // Calculate the deadline time and date which is 90 minutes before the first game.
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
    console.log(
      `Deadline date: ${deadlineDate} and deadline time: ${deadlineTime}`
    );
    // Sign into Facebook and send the group a reminder message regarding the deadline.
    // ARIA is a set of attributes you can add to HTML elements to increase their accessibility. These attributes communicate role, state, and property to assistive technologies via accessibility APIs found in modern browsers.
    // This communication happens through the accessibility tree.
    await page.goto("https://www.facebook.com/");
    await page.waitForSelector("#email");
    await page.type("#email", process.env.FB_EMAIL);
    await page.type("#pass", process.env.FB_PASSWORD);
    await page.click(`[type="submit"]`);
    // aria-label attribute can be used to define a string that labels the interactive element on which it is set.
    // Useful when an interactive element has no accessible name
    // Using an attribute selector hence the square bracket
    await page.waitForSelector(`[aria-label="Messenger"]`);
    await page.click(`[aria-label="Messenger"]`);
    // aria current indicates that this element is the current item
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
};

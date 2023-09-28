const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
require("dotenv").config();

// module.exports is a special object in Node.js.
// The module is a variable that represents the current module, and exports is an object that will be exposed as a module.
// So, whatever you assign to module.exports will be exposed as a module.
module.exports.run = async (event, context) => {
  // Optional: If you'd like to use the legacy headless mode. "new" is the default.
  chromium.setHeadlessMode = true;

  // Optional: If you'd like to disable webgl, true is the default.
  chromium.setGraphicsMode = false;
  // Launching a browser using the Chromium binary for AWS lambda with its default configurations.
  // Puppeteer automatically downloads a recent version of Chrome and saves it in the $HOME/.cache/puppeteer folder by default.
  // This becomes difficult when deploying to external service.
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
  );
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
  console.log("Matches tab clicked");
  await page.waitForSelector(
    "#mainContent > div.wrapper.hasFixedSidebar > div > nav > div.fixtures-abridged.calendar"
  );
  const scrapedDatesAndTime = await page.evaluate(() =>
    Array.from(document.querySelectorAll("div time")).map((ele) => ({
      data: ele.innerHTML,
    }))
  );
  console.log("Scraped Dates and Time: " + scrapedDatesAndTime);
  const daysStartingLetter = ["S", "M", "T", "W", "F"];
  const datesArr = scrapedDatesAndTime.filter((item) =>
    daysStartingLetter.includes(item.data[0])
  );
  console.log("Dates Array: ", datesArr);
  const timesArr = scrapedDatesAndTime.filter(
    (item) => !daysStartingLetter.includes(item.data[0])
  );
  console.log("Times Array: ", timesArr);
  if (timesArr.length >= 10) {
    const date = datesArr[0].data;
    const timeSplit = timesArr[0].data.split(":");
    let hourInWST = parseInt(timeSplit[0]) + 8;
    switch (hourInWST) {
      case 24:
        hourInWST = "00";
        break;
      case 25:
        hourInWST = "01";
        break;
      case 26:
        hourInWST = "02";
        break;
      case 27:
        hourInWST = "03";
        break;
      case 28:
        hourInWST = "04";
        break;
      case 29:
        hourInWST = "05";
        break;
      case 30:
        hourInWST = "06";
        break;
      default:
        hourInWST = hourInWST.toString();
    }
    const time = hourInWST + ":" + timeSplit[1];

    console.log(`Date: ${JSON.stringify(date)}`);
    console.log(`Time: ${JSON.stringify(time)}`);

    // Calculate the difference in milliseconds between the date and time of the first game of the matchweek and the time that this function is run.
    // Convert the difference to hours. Added extra space in order to create valid date and subtracted 8 hours at the end to account for UTC time.
    const timeDiffmS =
      new Date(date + time + " " + new Date(Date.now()).getFullYear()) -
      new Date(Date.now());
    const timeDiffS = timeDiffmS / 1000;
    const hours = Math.abs(Math.round(timeDiffS / (60 * 60))) - 8;
    console.log(`Difference in hours: ${JSON.stringify(hours)}`);

    // If the difference in hours is less than or equal to 24.
    if (hours <= 24) {
      // Calculate the deadline time and date which is 90 minutes before the first game.
      const deadline = new Date(
        new Date(date + time + " " + new Date(Date.now()).getFullYear()) -
          5400000
      );
      const deadlineDate = deadline.toDateString();
      const deadlineTime = deadline.toLocaleTimeString({
        hour: "2-digit",
        minute: "2-digit",
      });
      console.log(
        `Deadline date: ${deadlineDate} and deadline time: ${deadlineTime}`
      );
      // Sign into Facebook and send the group a reminder message regarding the deadline.
      // ARIA is a set of attributes you can add to HTML elements to increase their accessibility. These attributes communicate role, state, and property to assistive technologies via accessibility APIs found in modern browsers.
      // This communication happens through the accessibility tree.

      //  Wait for there to be no network activity for at least 500ms.
      await page.goto("https://www.facebook.com/", {
        waitUntil: "networkidle0",
      });
      await page.waitForSelector("#email");
      await page.type("#email", process.env.FB_EMAIL);
      await page.type("#pass", process.env.FB_PASSWORD);
      await page.click(`[type="submit"]`);

      await page.waitForNavigation({
        waitUntil: "networkidle0",
      });
      // aria-label attribute can be used to define a string that labels the interactive element on which it is set.
      // Useful when an interactive element has no accessible name
      // Using an attribute selector hence the square bracket
      await page.waitForSelector(`[aria-label="Messenger"]`, { visible: true });
      const screenshotOne = await page.screenshot({ encoding: "base64" });
      console.log("Base64 encoded screenshot 1: ", screenshotOne);
      await page.click(`[aria-label="Messenger"]`);
      // aria current indicates that this element is the current item
      await page.waitForSelector(`[aria-current="false"]`, { visible: true });
      await page.click(`[aria-current="false"]`);
      await page.waitForSelector(`[aria-label="Message"]`, { visible: true });
      await page.type(
        `[aria-label="Message"]`,
        `A friendly reminder that the Fantasy Premier League deadline for the upcoming matchweek is ${deadlineDate} at ${deadlineTime}. Please make any changes to your Fantasy Teams before this deadline.`
      );
      console.log(
        `Message Sent: A friendly reminder that the Fantasy Premier League deadline for the upcoming matchweek is ${deadlineDate} at ${deadlineTime}. Please make any changes to your Fantasy Teams before this deadline.`
      );
      await page.waitForSelector(`[aria-label="Press Enter to send"]`, {
        visible: true,
      });
      await page.click(`[aria-label="Press Enter to send"]`);
      const screenshotTwo = await page.screenshot({ encoding: "base64" });
      console.log("Base64 encoded screenshot 2: ", screenshotTwo);
      await page.waitForSelector(`[aria-label="Close chat"]`, {
        visible: true,
      });
      await page.click(`[aria-label="Close chat"]`);
      await browser.close();
    }
    await browser.close();
  } else {
    console.log("Less than 10 games.");
  }
};

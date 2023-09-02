const { join } = require("path");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer.
  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};

// Puppeteer stores browsers in ~/.cache/puppeteer to globally cache browsers between installation.
// This can cause problems if puppeteer is packed during some build step and moved to a fresh location.

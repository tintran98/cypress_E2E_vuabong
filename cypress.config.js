const { defineConfig } = require("cypress");

module.exports = defineConfig({
  chromeWebSecurity: true,
  pageLoadTimeout: 60000,
  defaultCommandTimeout: 10000,
  requestTimeout: 15000,
  responseTimeout: 30000,
  viewportWidth: 1440,
  viewportHeight: 900,
  video: true,
  videosFolder: 'results/videos',
  screenshot: true,
  screenshotsFolder: 'results/screenshots',
  e2e: {
    specPattern: '**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    excludeSpecPattern: '*.md',
    experimentalRunAllSpecs: true,
    testIsolation: false, // keep browser context
    setupNodeEvents: (on, config) => {

    },
  }
});

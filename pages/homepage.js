// Inlcude playwright module
const { expect } = require('@playwright/test')

// create class
exports.HomePage = class HomePage {
  constructor(page) {
    this.page = page;
  }

  async verifyHomePage() {
  await expect(this.page.locator("//h3[text()='Ninza-HRM']"))
  .toHaveText('Ninza-HRM', { 
    timeout: 2000,
    message: 'Home page did not load correctly, expected header Ninza-HRM' 
  });
  }
}

// Inlcude playwright module
const { expect } = require('@playwright/test')

// create class
exports.LoginPage = class LoginPage {

    /**
     * @param {import ('@playwright/test').Page} page 
     */
    constructor(page) {
        this.page = page;

    }

    async goto() {
        await this.page.setViewportSize({ width: 1366, height: 728 })
        await console.log(process.env.URL);
        
        await this.page.goto(process.env.URL);
    }

    async login(username, password) { 
        await this.page.locator("//input[@name='username']").isEditable(); 
        await this.page.locator("//input[@name='username']").fill(username); 
        await this.page.locator("//input[@name='password']").isEditable(); 
        await this.page.locator("//input[@name='password']").fill(password);
        await this.page.locator("//button[@type='submit']").isEnabled(); 
        await this.page.locator("//button[@type='submit']").click();
        }
}
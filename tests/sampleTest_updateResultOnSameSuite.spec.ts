import { test } from '@playwright/test';
import axios from 'axios';
import fs from 'fs';
import { LoginPage } from '../pages/loginpage';
import { HomePage } from '../pages/homepage';
import testData from '../test-data/credentials.json';
import { Console } from 'console';


// ------------------- Test Cases -------------------

test.describe.configure({ mode: 'parallel' });
test.describe('Sample test cases', () => {

  test('Login with valid credentials', async ({ page }) => {
    console.log("First Testcase passed");
    console.log("test results");
    
    // const loginpage = new LoginPage(page);
    // await loginpage.goto();
    // await loginpage.login(process.env.USER_NAME!, process.env.PASSWORD!);
    // const homepage = new HomePage(page);
    // await homepage.verifyHomePage();
  });

  test('Login with Invalid Username', async ({ page }) => {
    test.fail();
   console.log("Login with Invalid Username")
  });

  test('Login with invalid Password', async ({ page }) => {
    console.log("Login with Invalid Password")
  });

  test('Login with Invalid credentials', async ({ page }) => {
    // test.fail();
    console.log("Login with Invalid credentials")
  });

});

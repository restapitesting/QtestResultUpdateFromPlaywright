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
    console.log("test results back to Qtest");
     console.log("test results back to Qtest");
     console.log("test results back to Qtest");
    
    // const loginpage = new LoginPage(page);
    // await loginpage.goto();
    // await loginpage.login(process.env.USER_NAME!, process.env.PASSWORD!);
    // const homepage = new HomePage(page);
    // await homepage.verifyHomePage();  
     console.log("test")
       console.log("test2")
        console.log("test3")
         console.log("test4")
          console.log("test5")

  });

  test('Login with Invalid Username', async ({ page }) => {
    //test.fail();
   console.log("Login with Invalid Username")
   console.log("test5")
  });

  test('Login with invalid Password', async ({ page }) => {
    console.log("Login with Invalid Password")
     console.log("test6")
  });

  test('Login with Invalid credentials', async ({ page }) => {
    // test.fail();
    console.log("Login with Invalid credentials")
     console.log("test7")
  });

});

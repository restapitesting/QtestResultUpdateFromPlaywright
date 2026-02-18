import { test } from '@playwright/test';
import axios from 'axios';
import  {LoginPage}  from '../pages/loginpage';
import  {HomePage}  from '../pages/homepage';
import testData from '../test-data/credentials.json';

const QTEST_BASE_URL = process.env.QTEST_URL!;
const TOKEN = process.env.QTEST_TOKEN!;
const PROJECT_NAME = process.env.QTEST_PROJECT_NAME!;
const RELEASE_NAME = process.env.QTEST_RELEASE_NAME!;
const MODULE_NAME = process.env.MODULE_NAME!;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

function mapStatus(status?: string): number {
  switch (status) {
    case 'passed': return 601;
    case 'failed': return 602;
    case 'skipped': return 605;
    case 'timedOut': return 604;
    default: return 602;
  }
}

function getAustraliaTimeISO() {
  const now = new Date();
  const auDate = now.toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    hour12: false,
  });

  const [datePart, timePart] = auDate.split(', ');
  const [day, month, year] = datePart.split('/');
  return `${year}-${month}-${day}T${timePart}`;
}

let PROJECT_ID: number;
let RELEASE_ID: number;
let cycleId: number;
let suiteId: number;
let runId: number;
let moduleId: number;
let testCaseMap: Map<string, number> = new Map();



async function fetchProjectId(): Promise<number> {
  const res = await axios.get(
    `${QTEST_BASE_URL}/api/v3/projects`,
    { headers }
  );

  const projects = res.data;

  const project = projects.find((p: any) => p.name === PROJECT_NAME);

  if (!project) {
    throw new Error(`Project '${PROJECT_NAME}' not found`);
  }

  return project.id;
}

async function fetchReleaseId(projectId: number): Promise<number> {
  const res = await axios.get(
    `${QTEST_BASE_URL}/api/v3/projects/${projectId}/releases`,
    { headers }
  );

  const releases = res.data;

  const release = releases.find((r: any) => r.name === RELEASE_NAME);

  if (!release) {
    throw new Error(`Release '${RELEASE_NAME}' not found`);
  }

  return release.id;
}



async function fetchModuleId(): Promise<number> {
  const res = await axios.get(
    `${QTEST_BASE_URL}/api/v3/projects/${PROJECT_ID}/modules`,
    { headers }
  );

  const modules = res.data;

  const module = modules.find((m: any) => m.name === MODULE_NAME);

  if (!module) {
    throw new Error(`Module '${MODULE_NAME}' not found`);
  }

  return module.id;
}

async function fetchTestCases(moduleId: number) {
  const res = await axios.get(
    `${QTEST_BASE_URL}/api/v3/projects/${PROJECT_ID}/test-cases?parentId=${moduleId}&expandSteps=true`,
    { headers }
  );

  const testCases = res.data;

  testCases.forEach((tc: any) => {
    testCaseMap.set(tc.name, tc.id);
  });

  console.log(`Loaded ${testCaseMap.size} test cases from module`);
}



async function createTestCycle() {
  const date = getAustraliaTimeISO();
  const res = await axios.post(
    `${QTEST_BASE_URL}/api/v3/projects/${PROJECT_ID}/test-cycles?parentId=${RELEASE_ID}&parentType=release`,
    { name: `Auto Cycle - ${date}` },
    { headers }
  );
  return res.data.id;
}

async function createTestSuite(cycleId: number) {
   const date = getAustraliaTimeISO();
  const res = await axios.post(
    `${QTEST_BASE_URL}/api/v3/projects/${PROJECT_ID}/test-suites?parentId=${cycleId}&parentType=test-cycle`,
    { name: `Auto Suite - ${date}` },
    { headers }
  );
  return res.data.id;
}

async function createTestRun(suiteId: number, testCaseId: number, title: string) {
  const res = await axios.post(
    `${QTEST_BASE_URL}/api/v3/projects/${PROJECT_ID}/test-runs?parentId=${suiteId}&parentType=test-suite`,
    {
      name: `Playwright Run - ${title}`,
      test_case: { id: testCaseId }
    },
    { headers }
  );
  return res.data.id;
}

async function createTestLog(runId: number, status: number, note = '') {
  const exeStart = getAustraliaTimeISO();
  const exeEnd = getAustraliaTimeISO();
  await axios.post(
    `${QTEST_BASE_URL}/api/v3/projects/${PROJECT_ID}/test-runs/${runId}/test-logs`,
    {
      exe_start_date: exeStart,
      exe_end_date: exeEnd,
      status: { id: status },
      note
    },
    { headers }
  );
}

test.beforeAll(async () => {

  PROJECT_ID = await fetchProjectId();
  console.log(`Resolved Project ID: ${PROJECT_ID}`);

  RELEASE_ID = await fetchReleaseId(PROJECT_ID);
  console.log(`Resolved Release ID: ${RELEASE_ID}`);

  moduleId = await fetchModuleId();

  await fetchTestCases(moduleId);

  if (cycleId && suiteId) {
    console.log('Using existing cycle and suite.');
  } else {
    cycleId = await createTestCycle();
    suiteId = await createTestSuite(cycleId);
    console.log('Created new cycle and suite.');
  }

  console.log('Cycle, Suite & Test Case Map Ready');
});


test.beforeEach(async ({}, testInfo) => {

  const testCaseId = testCaseMap.get(testInfo.title);

  if (!testCaseId) {
    throw new Error(`Test case not found in qTest module: ${testInfo.title}`);
  }

  runId = await createTestRun(suiteId, testCaseId, testInfo.title);

  console.log(`Run created for TC ID: ${testCaseId}`);
});

test.afterEach(async ({}, testInfo) => {

  const mappedStatus = mapStatus(testInfo.status);
  console.log("This is the mapped Status ==>"+mappedStatus);
  

  await createTestLog(
    runId,
    mappedStatus,
    testInfo.error?.message || 'Executed via Playwright'
  );

  console.log(`Result pushed for ${testInfo.title}`);
});

test.describe.configure({ mode: 'parallel' });
test.describe('Sample test cases', () => {

  test('Login with valid credentials', async ({ page }) => {
    const loginpage = new LoginPage(page);
    await loginpage.goto();
    await loginpage.login(process.env.USER_NAME,process.env.PASSWORD);
    const homepage = new HomePage(page);
    await homepage.verifyHomePage()
  });

  test('Login with Invalid Username', async ({ page }) => {
    const loginpage = new LoginPage(page);
    await loginpage.goto();
    const username=testData.credentials[0].invalidUsername
    await loginpage.login(username,process.env.PASSWORD);
    const homepage = new HomePage(page);
    await homepage.verifyHomePage()
  });

  test('Login with invalid Password', async ({ page }) => {
    const loginpage = new LoginPage(page);
    await loginpage.goto();
    const password= testData.credentials[1].invalidPassword
    await loginpage.login(process.env.USER_NAME,password);
    const homepage = new HomePage(page);
    await homepage.verifyHomePage()
  });

  test('Login with Invalid credentials', async ({ page }) => {
    const loginpage = new LoginPage(page);
    await loginpage.goto();
    const username= testData.credentials[2].invalid?.username
    const password= testData.credentials[2].invalid?.password;
    await loginpage.login(username,password);
    const homepage = new HomePage(page);
    await homepage.verifyHomePage()
  });

});

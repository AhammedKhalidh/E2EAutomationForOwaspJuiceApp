import { test, expect } from '@playwright/test';
import exp from 'constants';

test('Check home page dsplays all items in Owasp Juice App ', async ({ page,context }) => {
  await page.goto('https://juice-shop.herokuapp.com/#/');
  await page.waitForLoadState("domcontentloaded");

  const closeButton = page.locator('[aria-label="Close Welcome Banner"]');
  await closeButton.waitFor({ state: 'visible' });
  await closeButton.click();
  await expect(closeButton).toBeHidden();
  
  const { width, height } = await page.evaluate(() => ({
    width: window.innerWidth-100,
    height: window.innerHeight-300
  }));

  await page.mouse.wheel(0, height); 
  await page.setViewportSize({ width, height });
  
  await page.waitForTimeout(3000);
  const fruitCookiesButton = page.locator('a[aria-label="dismiss cookie message"]').first();
  await fruitCookiesButton.click();

  // Scroll to the bottom of the page
  const itemsPerPageDropdown = await page.locator('#mat-select-value-1');
  itemsPerPageDropdown.scrollIntoViewIfNeeded();
  let isDropdownVisible = false;
  while (!isDropdownVisible) {
    // Scroll down by a certain amount
    await page.mouse.wheel(0, 100); 

    // Check if the dropdown is visible in the viewport
    isDropdownVisible = await itemsPerPageDropdown.isVisible();
  }


  // Change items per page to the maximum number
  

  await itemsPerPageDropdown.scrollIntoViewIfNeeded(); 
  await expect(itemsPerPageDropdown).toBeVisible();
  itemsPerPageDropdown.click();
  await page.getByRole('option', { name: '48' }).click();
  await expect(page.getByRole('group')).toContainText('1 – 37 of 37');

})


test('Click Apple Juice Product and check the review ', async ({ page,context }) => {
  await page.goto('https://juice-shop.herokuapp.com/#/');
  await page.waitForLoadState("domcontentloaded");

  const WelcomeBannercloseButton = page.locator('[aria-label="Close Welcome Banner"]');
  await WelcomeBannercloseButton.waitFor({ state: 'visible' });
  await WelcomeBannercloseButton.click();
  await expect(WelcomeBannercloseButton).toBeHidden();

  
  const firstProduct = page.getByRole('button', { name: 'Apple Juice (1000ml)' });
  await firstProduct.scrollIntoViewIfNeeded(); 
  await firstProduct.click();

  const popup = page.locator('#mat-dialog-1');
  await expect(popup).toBeVisible();

  const productImage = popup.locator('img');
  await expect(productImage).toBeVisible();

  const reviewSection = popup.locator('mat-expansion-panel');
  const isReviewSectionVisible = await reviewSection.isVisible();

  if (isReviewSectionVisible) {
    await reviewSection.click();  // Click to expand the review section
  }

  await page.waitForTimeout(2000);  // Wait for 2 seconds (optional)

  // Step 8: Close the product popup form
  await expect(page.getByLabel('Close Dialog')).toBeVisible();
  await page.getByLabel('Close Dialog').click();
})


test('Register and Login to OWASP Juice Shop', async ({ page,context }) => {

  const email = `testuser${Date.now()}@example.com`; // Unique email
  const password = 'Test@1234'; // Secure password


  await page.goto('https://juice-shop.herokuapp.com/#/register');
  await page.waitForLoadState("domcontentloaded");

  const WelcomeBannercloseButton = page.locator('[aria-label="Close Welcome Banner"]');
  await WelcomeBannercloseButton.waitFor({ state: 'visible' });
  await WelcomeBannercloseButton.click();
  await expect(WelcomeBannercloseButton).toBeHidden();
  
  const inputFields = await page.locator('form input');
  for (let i = 0; i < (await inputFields.count()); i++) {
    const field = inputFields.nth(i);
    await field.click(); // Focus on the field
    await field.blur(); // Trigger validation without entering any value
    const validationMessage = await field.locator('..').locator('.mat-error');
    await expect(validationMessage).toBeVisible(); // Assert that validation message is visible
  }


 await page.getByLabel('Email address field').fill( email);
  await page.getByLabel('Field for the password').fill(password);
  await page.getByLabel('Field to confirm the password').fill(password);
  await page.getByLabel('Selection list for the').locator('span').click();
  await page.getByText('Mother\'s maiden name?').click();
  await page.locator('div').filter({ hasText: /^Answer \*$/ }).nth(2).click();
  await page.getByPlaceholder('Answer to your security').fill('Ana');


  const showPasswordAdviceButton = page.locator('.mat-slide-toggle-bar');
 expect( showPasswordAdviceButton).toBeVisible();
  await showPasswordAdviceButton.click();


  await expect(page.locator('#registration-form mat-card')).toBeVisible();
  await expect(page.locator('mat-card-content')).toContainText('contains at least one lower character');
  await expect(page.locator('mat-card-content')).toContainText('contains at least one upper character');
  await expect(page.locator('mat-card-content')).toContainText('contains at least one digit');
  await expect(page.locator('mat-card-content')).toContainText('contains at least one special character');
  await expect(page.locator('mat-card-content')).toContainText('contains at least 8 characters');
  await page.locator('.mat-slide-toggle-thumb').click();



  const registerButton = page.getByLabel('Button to complete the');
  await registerButton.click();

  const successMessage = page.locator('.mat-snack-bar-container');
  await expect(successMessage).toHaveText('Registration completed successfully. You can now log in.X'); 

  await page.waitForURL('**/login');

  await page.getByLabel('Text field for the login email').fill(email); 
  await page.getByLabel('Text field for the login password').fill(password); 
  const loginButton =  page.getByLabel('Login', { exact: true })
  await loginButton.click();


  const homePageElement = page.locator('mat-card:has-text("Apple Juice")'); 
  await expect(homePageElement).toBeVisible(); 

})


function generateRandomCardNumber(): string {
  let cardNumber = '';
  for (let i = 0; i < 16; i++) {
    cardNumber += Math.floor(Math.random() * 10).toString();  // Generate a random digit (0-9)
  }
  return cardNumber;
}
test('Login, Add Products to Basket, Checkout, and Add Credit Card', async ({ page,context }) => {


  const email = `testuser${Date.now()}@example.com`;;
  const password = 'Test@123';

  

  await page.goto('https://juice-shop.herokuapp.com/#/register');
  await page.waitForLoadState("domcontentloaded");

  const WelcomeBannercloseButton = page.locator('[aria-label="Close Welcome Banner"]');
  await WelcomeBannercloseButton.waitFor({ state: 'visible' });
  await WelcomeBannercloseButton.click();
  await expect(WelcomeBannercloseButton).toBeHidden();
  
  const inputFields = await page.locator('form input');
  for (let i = 0; i < (await inputFields.count()); i++) {
    const field = inputFields.nth(i);
    await field.click(); // Focus on the field
    await field.blur(); // Trigger validation without entering any value
    const validationMessage = await field.locator('..').locator('.mat-error');
    await expect(validationMessage).toBeVisible(); // Assert that validation message is visible
  }


 await page.getByLabel('Email address field').fill( email);
  await page.getByLabel('Field for the password').fill(password);
  await page.getByLabel('Field to confirm the password').fill(password);
  await page.getByLabel('Selection list for the').locator('span').click();
  await page.getByText('Mother\'s maiden name?').click();
  await page.locator('div').filter({ hasText: /^Answer \*$/ }).nth(2).click();
  await page.getByPlaceholder('Answer to your security').fill('Ana');

  const registerButton = page.getByLabel('Button to complete the');
  await registerButton.click();

  await page.waitForURL('**/login');

  /*await page.goto('https://juice-shop.herokuapp.com/#/login');
  await page.waitForLoadState("domcontentloaded");

  const WelcomeBannercloseButton = page.locator('[aria-label="Close Welcome Banner"]');
  await WelcomeBannercloseButton.waitFor({ state: 'visible' });
  await WelcomeBannercloseButton.click();
  await expect(WelcomeBannercloseButton).toBeHidden();*/
  
 //Login 

// await page.goto('https://juice-shop.herokuapp.com/#/login');

 await page.getByLabel('Text field for the login email').fill(email); 
 await page.getByLabel('Text field for the login password').fill(password); 
 const loginButton =  page.getByLabel('Login', { exact: true })
 await loginButton.click();
 const homePageElement = page.locator('mat-card:has-text("Apple Juice")');
 await expect(homePageElement).toBeVisible();


 //Add Products to Basket
 const productSelectors = [
  'mat-card:has-text("Apple Juice")', 
  'mat-card:has-text("Banana Juice")',
  'mat-card:has-text("Carrot Juice")',
  'mat-card:has-text("Fruit Press")',
  'mat-card:has-text("Lemon Juice")'
];
let cart = page.getByLabel('Show the shopping cart');

let cartCount = 0; 
for (const selector of productSelectors) {
  const product = page.locator(selector);
  await product.getByLabel('Add to Basket').click();  // Click the product to add to the cart
  /*const successMessage = page.locator('.mat-snack-bar-container');
  await expect(successMessage).toHaveText('Product added to basket');*/
  cart = page.getByLabel('Show the shopping cart');
  cartCount = cartCount + 1;
  await expect(cart).toContainText(String(cartCount));  // Cart count should increment to 1 each time

}
await cart.click();

//Price Change
await page.getByRole('row', { name: 'Banana Juice (1000ml) Banana' }).getByRole('button').nth(1).click();  // Increase Item
await expect(page.locator('#price')).toContainText('Total Price: 101.93999999999998¤');
await page.getByRole('row', { name: 'Banana Juice (1000ml) Banana' }).getByRole('button').nth(2).click();  // Delete Item
await expect(page.locator('#price')).toContainText('Total Price: 97.96¤');

  // Checkout process
  await page.getByRole('button', { name: 'Checkout' }).click();

  //Add address information
  await page.getByLabel('Add a new address').click();
  await page.getByPlaceholder('Please provide a country.').fill('India');
  await page.getByPlaceholder('Please provide a name.').fill('Tester');
  await page.getByPlaceholder('Please provide a mobile').fill('10000000');
  await page.getByPlaceholder('Please provide a ZIP code.').fill('123');
  await page.getByPlaceholder('Please provide an address.').fill('Tamilnadu');
  await page.getByPlaceholder('Please provide a city.').fill('Thanjavur');
  await page.getByPlaceholder('Please provide a state.').fill('Tamilandu');
  await page.getByRole('button', { name: 'send Submit' }).click();
  page.waitForLoadState('load');
  await page.getByRole('cell').first().click();
 
 

  //Proceed to Payment Screen
  await page.getByLabel('Proceed to payment selection').click();
  await page.getByRole('row', { name: 'Standard Delivery 0.00¤ 5 Days' }).getByRole('cell').first().click();
  await WelcomeBannercloseButton.waitFor({ state: 'visible' });
  await WelcomeBannercloseButton.click();
  await expect(WelcomeBannercloseButton).toBeHidden();
  await expect(page.getByLabel('Proceed to delivery method')).toBeEnabled();
  await page.getByLabel('Proceed to delivery method').click();


  //Add credit card information
  await page.getByRole('button', { name: 'Add new card Add a credit or' }).click();
  await page.getByLabel('Name *').fill('Tester');
  await page.getByLabel('Card Number *').fill(generateRandomCardNumber());
  await page.getByLabel('Expiry Month *').selectOption('4');
  await page.getByLabel('Expiry Year *').selectOption('2087');
  await page.getByRole('button', { name: 'send Submit' }).click();

  await page.getByRole('row', { name: '************0000 Tester 6/' }).locator('label').click();
  await page.locator('app-payment').click({
    button: 'right'
  });
//Assert purchase confirmation
await expect(page.getByLabel('Proceed to review')).toBeEnabled();
await page.getByLabel('Proceed to review').click();
  await page.getByLabel('Complete your purchase').click();
  await expect(page.getByRole('heading')).toContainText('Thank you for your purchase!');

})
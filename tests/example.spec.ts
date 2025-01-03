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
  const itemsPerPageDropdown = await page.locator('select[aria-label="items-per-page"]');
  let isDropdownVisible = false;
  while (!isDropdownVisible) {
    // Scroll down by a certain amount
    await page.mouse.wheel(0, 100); 

    // Check if the dropdown is visible in the viewport
    isDropdownVisible = await itemsPerPageDropdown.isVisible();
  }

  // Wait for a brief moment to ensure the page is fully loaded after scroll
  await page.waitForTimeout(1000);

  const paginationText = await page.locator('.mat-paginator-range-label').innerText();
  const paginationDetails = paginationText.split(' ');
  const lastItemIndex = paginationDetails.at(2);
  const totalItemsCount = paginationDetails.at(4);


  // Change items per page to the maximum number
  

  await itemsPerPageDropdown.scrollIntoViewIfNeeded(); 
  await expect(itemsPerPageDropdown).toBeVisible();
  const options = await itemsPerPageDropdown.locator('option').allTextContents();
   const lastOptionValue = options[options.length - 1];
   await itemsPerPageDropdown.selectOption({ label: lastOptionValue });

  // Wait for the page to refresh with new settings
  await page.waitForLoadState( 'domcontentloaded',  { timeout: 2000 } )
  expect(lastItemIndex).toEqual(totalItemsCount);

  // Assert that all items are displayed
  const items = await page.locator('.mat-grid-tile');
  const itemCount = await items.count();
  expect(itemCount).toEqual(totalItemsCount);

})


test('Click Apple Juice Product and check the review ', async ({ page,context }) => {
  await page.goto('https://juice-shop.herokuapp.com/#/');
  await page.waitForLoadState("domcontentloaded");

  const WelcomeBannercloseButton = page.locator('[aria-label="Close Welcome Banner"]');
  await WelcomeBannercloseButton.waitFor({ state: 'visible' });
  await WelcomeBannercloseButton.click();
  await expect(WelcomeBannercloseButton).toBeHidden();
  
  const firstProduct = page.locator('div.mat-card:has-text("Apple Juice")').first();
  await firstProduct.scrollIntoViewIfNeeded(); 
  await firstProduct.click();

  const popup = page.locator('div.mat-dialog-container');
  await expect(popup).toBeVisible();

  const productImage = popup.locator('img');
  await expect(productImage).toBeVisible();

  const reviewSection = popup.locator('mat-expansion-panel');
  const isReviewSectionVisible = await reviewSection.isVisible();

  if (isReviewSectionVisible) {
    const expandReviewButton = reviewSection.locator('button[aria-label="Expand"]');
    await expandReviewButton.click();  // Click to expand the review section
  }

  await page.waitForTimeout(2000);  // Wait for 2 seconds (optional)

  // Step 8: Close the product popup form
  const closeButton = popup.locator('button[aria-label="Close"]');
  await closeButton.click();
})


test('Register and Login to OWASP Juice Shop', async ({ page,context }) => {

  const email = `testuser${Date.now()}@example.com`; // Unique email
  const username = `testuser${Date.now()}`; // Unique username
  const password = 'Test@1234'; // Secure password
  const firstName = 'Test';
  const lastName = 'User';

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

  await page.fill('input[name="firstName"]', firstName);
  await page.fill('input[name="lastName"]', lastName);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="repeatPassword"]', password);


  const showPasswordAdviceButton = page.locator('button:has-text("Show password advice")');
  await showPasswordAdviceButton.click();


  const registerButton = page.locator('button[type="submit"]');
  await registerButton.click();

  const successMessage = page.locator('.mat-snack-bar-container');
  await expect(successMessage).toHaveText('Your account has been created!'); 

  await page.waitForURL('**/login');

  await page.fill('input[name="email"]', email); 
  await page.fill('input[name="password"]', password); 
  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();


  const homePageElement = page.locator('mat-card:has-text("Apple Juice")'); 
  await expect(homePageElement).toBeVisible(); 

})



test('Login, Add Products to Basket, Checkout, and Add Credit Card', async ({ page,context }) => {


  const email = `testuser${Date.now()}@example.com`;
  const password = 'Test@1234';

  const generateRandomCardInfo = () => {
    return {
      cardNumber: `41111111111211231`, // Valid test card number
      expirationDate: '12/25',
      cvv: '123'
    };
  };

  await page.goto('https://juice-shop.herokuapp.com/#/login');
  await page.waitForLoadState("domcontentloaded");

  const WelcomeBannercloseButton = page.locator('[aria-label="Close Welcome Banner"]');
  await WelcomeBannercloseButton.waitFor({ state: 'visible' });
  await WelcomeBannercloseButton.click();
  await expect(WelcomeBannercloseButton).toBeHidden();
  
 //Login 

 await page.goto('https://juice-shop.herokuapp.com/#/login');
 await page.fill('input[name="email"]', email);
 await page.fill('input[name="password"]', password);
 await page.click('button[type="submit"]');
 const homePageElement = page.locator('mat-card:has-text("Apple Juice")');
 await expect(homePageElement).toBeVisible();

 //Add Products to Basket
 const productSelectors = [
  'mat-card:has-text("Apple Juice")', 
  'mat-card:has-text("Banana Smoothie")',
  'mat-card:has-text("Carrot Juice")',
  'mat-card:has-text("Fruit Cookies")',
  'mat-card:has-text("Lemonade")'
];

for (const selector of productSelectors) {
  const product = page.locator(selector);
  await product.click();  // Click the product to add to the cart
  const successMessage = page.locator('.mat-snack-bar-container');
  await expect(successMessage).toHaveText('Product added to basket');
  const cartCount = page.locator('.mat-badge-content');
  await expect(cartCount).toHaveText('1');  // Cart count should increment to 1 each time
}

await page.click('a[aria-label="Basket"]');

//Price Change
const productInBasket = page.locator('mat-card:has-text("Apple Juice")'); // Select a product in the basket
const intialTotalPrice = page.locator('.total-price').textContent(); 
 const increaseQuantityButton = productInBasket.locator('.mat-stepper-increment'); // Find the button to increase quantity
  await increaseQuantityButton.click();  // Increase quantity
  const totalPriceAfterIncreaseQty = page.locator('.total-price').textContent;
  await expect(totalPriceAfterIncreaseQty).not.toEqual(intialTotalPrice);
  const deleteButton = productInBasket.locator('.mat-icon:has-text("delete")');
  await deleteButton.click();  // Delete the product
  const totalPriceAfterDecreaseQty = page.locator('.total-price').textContent();
  await expect(totalPriceAfterDecreaseQty).not.toEqual({totalPriceAfterIncreaseQty}); 


  // Checkout process
  await page.click('button:has-text("Checkout")');

  //Add address information
  await page.fill('input[name="address"]', '1234 New Street');
  await page.fill('input[name="city"]', 'Chennai');
  await page.fill('input[name="postalCode"]', '54321');
  await page.fill('input[name="country"]', 'India');

  //Select Delivery Method
  const deliveryMethod = page.locator('input[type="radio"][name="delivery"]');
  await deliveryMethod.first().click();

  //Proceed to Payment Screen
  await page.click('button:has-text("Continue to Payment")');

  //Assert that the wallet has no money and add credit card information
  const walletMessage = page.locator('mat-card:has-text("Your wallet is empty")');
  await expect(walletMessage).toBeVisible();  // Assert the wallet is empty message

  const creditCardInfo = generateRandomCardInfo();

  //Add credit card information
  await page.fill('input[name="cardNumber"]', creditCardInfo.cardNumber);
  await page.fill('input[name="expirationDate"]', creditCardInfo.expirationDate);
  await page.fill('input[name="cvv"]', creditCardInfo.cvv);

//Complete the purchase
await page.click('button:has-text("Continue purchase")');

//Assert purchase confirmation
const purchaseConfirmation = page.locator('.mat-snack-bar-container');
await expect(purchaseConfirmation).toHaveText('Purchase completed');

})
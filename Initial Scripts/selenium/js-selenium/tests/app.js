const {Builder, By, Key, until}= require("selenium-webdriver");
const mongoose = require('mongoose');

const Tesseract = require('tesseract.js');


const chrome = require('selenium-webdriver/chrome');

const imageSchema = new mongoose.Schema({
  productName: String,
  imageUrls: [String],
  category:String
});

mongoose.connect('mongodb+srv://utkarsh:utkarsh@atlascluster.vdrhcf6.mongodb.net/NutriVista', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

const Image = mongoose.model('Scraped_Product_Images', imageSchema);


async function example(){
    let chromeOptions = new chrome.Options();
    chromeOptions.headless(); // Enable headless mode

    let driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(chromeOptions)
    .build();


    await driver.get("https://www.amazon.in/")
    
    const searchInputList=[
      // "Peanut butter",
      // "Bread",

      // "Cheese",

      // "Whey Protein",
      // "Creatine",
      // "Oats",
      // "Muesli",
      // "Protein bar",
      // "Biscuits",
      // "Cookies",
      "Chips",
      "Brownie",
      "Namkeen",
      "Granola",
      "Granola Bars",
      "Cake",
      "Chocolates",
      "Kaju Dry Fruits",
      "Almond Dry Fruits",
      "Chocos Cereals",
      "Cornflakes Cereals",
      "Snack bar",
      "Wheat Grains",
      "Rice Grains",
      "Millet Grains",
      "Moong Dal",
      "Masoor Dal",
      "Choco chips",
      "Pie",
      "Olive Oil",
      "Refined Oil",
      "Mustard Oil",
      "Yogurt",
      "Quinoa",
      "Chia Raw Seeds",
      "Pumpkin Raw Seeds",
      "Honey",
      "Syrup",
      "Jam",
      "Sauce",
      "Spread",
      "Pasta",
      "Macaroni",
      "Milk",
      "Curd",
      "Paneer",
      "Tofu",
      "Energy Drink",
      "Frozen Foods"
  ];
  const maxCategoriesPerSession = 2;
  let categoriesProcessed = 0;
    for(const searchInput of searchInputList)
    {
          if (categoriesProcessed >= maxCategoriesPerSession) {
            // Quit the current WebDriver session
            await driver.quit();
            // Create a new instance of the WebDriver
            driver = await new Builder().forBrowser('chrome').setChromeOptions(chromeOptions).build();
            await driver.get("https://www.amazon.in/")
            categoriesProcessed = 0;
          }
          try {
            const searchBox = await driver.findElement(By.id('twotabsearchtextbox'));
            randomDelay();

            await searchBox.clear();
            randomDelay();

            await searchBox.sendKeys(searchInput, Key.RETURN);
            randomDelay();

            console.log('Entered search input:', searchInput);
            categoriesProcessed=categoriesProcessed+1;

          } catch (error) {
                console.error('Error entering search input:', error.message);
                
                try{
                  
                  await findElement(driver, By.id('twotabsearchtextbox'));
                  randomDelay();

                  const searchBox = await driver.findElement(By.id('twotabsearchtextbox'));
                  randomDelay();

                  await searchBox.sendKeys(searchInput, Key.RETURN);
                  randomDelay();

                  await driver.wait(until.titleContains('Amazon'), 5000);
                  randomDelay();

                  console.log('Entered search input:', searchInput);
                  categoriesProcessed=categoriesProcessed+1;
                }
                catch (error) {
                  console.error('Error entering search input:', error.message);
                }
          }

          

          try {
            const resultLinks = await driver.findElements(By.css('h2 a')); // Assuming result links are inside h2 elements
            const numResultsToOpen = Math.min(resultLinks.length, 10);
        
            for (let i = 0; i < numResultsToOpen; i++) {
                const link = resultLinks[i];
                const linkText = await link.getText();
                console.log('Opening result:', linkText);
                randomDelay();

                
                // Open link in a new tab
                await driver.actions().keyDown(Key.CONTROL).click(link).keyUp(Key.CONTROL).perform();
                randomDelay();

          
                // Switch to the new tab
                const handles = await driver.getAllWindowHandles();
                randomDelay();

                await driver.switchTo().window(handles[handles.length - 1]);
                const imageObject=await scrapeImageUrls(linkText);
                randomDelay();


                if(imageObject){

                    const image = new Image({
                      productName: imageObject.productTitle,
                      imageUrls: imageObject.imageUrls,
                      category:searchInput
                    });
                    await image.save();
                }

                await driver.close();
                randomDelay();



                await driver.switchTo().window(handles[0]);
            }
          } catch (error) {
            console.error('Error opening search results:', error.message);
          }
    }
      
      
      
        async function scrapeImageUrls(productTitle) {
            try {
                const specificImageList=[];
                
                // Assuming images have a common class, update the selector accordingly
                const mainImageElement = await driver.findElements(By.className('chromeful-container'));
                randomDelay();

                await driver.actions().click(mainImageElement[0]).perform();
                randomDelay();


                await driver.manage().setTimeouts({ implicit: 2000 });
                randomDelay();

                
                var number;
                for(number=0;number<=10;number++){
                  try{

                    var string="ivImage_"+number;
                    const thumbImageElement = await driver.findElement(By.id(string));
                    randomDelay();

                    await driver.actions().click(thumbImageElement).perform();
                    await delay(2000);




                    const specificImageElement = await driver.wait(
                      until.elementLocated(By.css('#ivLargeImage img')),
                      10000 // Adjust the timeout as needed
                    );

                    randomDelay();

                    const imageUrl = await specificImageElement.getAttribute('src');
                    specificImageList.push(imageUrl);
                    randomDelay();

                    
                  }
                  catch(error){
                    console.error('Error scraping thumb image URLs:', error.message);  
                  }

                }
                const returnObject={'productTitle':productTitle, 'imageUrls':specificImageList};
                console.log(returnObject);
                return returnObject;


            }catch (error) {
                console.error('Error scraping image URLs:', error.message);
                return {};
            }
        }
    
        async function findElement(driver, locator) {
            try {
                // Check if the element is found
                await driver.findElement(locator);
                randomDelay();

            } catch (error) {
                // If element not found, refresh the page and try again recursively
                console.log('Element not found, refreshing the page...');
                randomDelay();
                await new Promise(resolve => setTimeout(resolve, 2000));

                await driver.navigate().refresh();
                await new Promise(resolve => setTimeout(resolve, 2000));
                await findElement(driver, locator); // Recursive call
            }
      }
      function randomDelay() {
          var delay = Math.random() * (5000 - 1000) + 1000; // Random delay between 1000 and 5000 milliseconds
          setTimeout(function() {
              // Code to execute after the random delay
              // This could be your next action or function call
              console.log("Action after random delay");
          }, delay);
    }
    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }

   
}

example()   
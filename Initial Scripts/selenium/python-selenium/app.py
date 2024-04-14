from selenium import webdriver
import undetected_chromedriver as uc
import pickle
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from itertools import cycle

import pymongo
import time
import random

# MongoDB connection
client = pymongo.MongoClient("mongodb+srv://utkarsh:utkarsh@atlascluster.vdrhcf6.mongodb.net/")
db = client.NutriVista
collection = db.source_images

def random_delay():
    delay = random.uniform(1, 5)  # Random delay between 1 and 5 seconds
    time.sleep(delay)

def scrape_image_urls(product_title):
    specific_image_list = []
    try:
        main_image_element = driver.find_element(By.CLASS_NAME, 'chromeful-container')
        ActionChains(driver).click(main_image_element).perform()
        driver.implicitly_wait(2)

        for number in range(10):
            try:
                thumb_image_element = driver.find_element(By.ID, f'ivImage_{number}')
                ActionChains(driver).click(thumb_image_element).perform()
                time.sleep(2)

                specific_image_element = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, '#ivLargeImage img'))
                )
                specific_image_url = specific_image_element.get_attribute('src')
                specific_image_list.append(specific_image_url)
            except Exception as e:
                print(f'Error scraping thumb image URLs: {e}')

        return {'productTitle': product_title, 'imageUrls': specific_image_list}

    except Exception as e:
        print(f'Error scraping image URLs: {e}')
        return {}

def example():
    chrome_options = uc.ChromeOptions()
    chrome_options.headless = True
    # chrome_options.add_argument('--no-first-run --no-service-autorun --password-store=basic')
    chrome_options.add_argument('proxy-server=http://142.93.239.211:8080')
    # chrome_options.add_argument("--disable-blink-features=AutomationControlled") 
 
    # # Exclude the collection of enable-automation switches 
    # chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"]) 
    
    # Turn-off userAutomationExtension 
    # chrome_options.add_experimental_option("useAutomationExtension", False) 

    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    # chrome_options.add_argument('window-size=1280,800')
    # chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36')
    global driver

    try:
        cookies = pickle.load(open("cookies.pkl", "rb"))
        for cookie in cookies:
            driver.add_cookie(cookie)
    except FileNotFoundError:
        print("Cookies file not found. Logging in manually...")
        driver = uc.Chrome(options=chrome_options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})") 

    try:
        driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
            "source": """
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            })
            """
        })
        proxies = [
        'http://103.216.82.33:8080',
        'http://45.32.122.211:3128',
        'http://138.68.60.8:8080',
        'http://51.158.99.51:8811',
        ]

        proxy_pool = cycle(proxies)

        driver.get("https://www.amazon.in/")

        search_input_list = [
            "Strawberry Jam",
            # "Chips",
            # "Brownie",
            # "Namkeen",
            # "Granola",
            # "Granola Bars",
            # "Cake",
            # "Chocolates",
            # "Kaju Dry Fruits",
            # "Almond Dry Fruits",
            # "Chocos Cereals",
            # "Cornflakes Cereals",
            # "Snack bar",
            # "Wheat Flour",
            # "Rice Grains",
            # "Millet Grains",
            # "Moong Dal",
        #     "Masoor Dal",
        #     "Choco chips",
        #     "Pie",
        #     "Olive Oil",
            #  "Refined Oil",
            # "Mustard Oil",
            # "Yogurt",
            # "Quinoa",
            # "Chia Raw Seeds",
            # "Pumpkin Raw Seeds",
            # "Honey",
            # "Syrup",
            # "Jam",
            # "Sauce",
            # "Spread",
            # "Pasta",
            # "Macaroni",
            # "Milk",
            # "Curd",
            # "Paneer",
            # "Tofu",
            # "Energy Drink",
            # "Frozen Foods"
        ]

        max_categories_per_session = 10
        categories_processed = 0

        for search_input in search_input_list:
            if categories_processed >= max_categories_per_session:
                # next_proxy = next(proxy_pool)
                # chrome_options.add_argument(f'--proxy-server={next_proxy}')
                driver.quit()
                driver = webdriver.Chrome(options=chrome_options)
                driver.get("https://www.amazon.in/")
                pickle.dump(driver.get_cookies(), open("cookies.pkl", "wb"))
                categories_processed = 0

            try:
                search_box = driver.find_element(By.ID, 'twotabsearchtextbox')
                search_box.clear()
                search_box.send_keys(search_input, Keys.RETURN)
                print('Entered search input:', search_input)
                categories_processed += 1
            except Exception as e:
                print(f'Error entering search input: {e}')
                continue

            try:
                result_links = driver.find_elements(By.CSS_SELECTOR, 'h2 a')
                num_results_to_open = min(len(result_links), 10)

                for i in range(num_results_to_open):
                    link = result_links[i]
                    link_text = link.text
                    print('Opening result:', link_text)

                    ActionChains(driver).key_down(Keys.CONTROL).click(link).key_up(Keys.CONTROL).perform()
                    time.sleep(2)

                    driver.switch_to.window(driver.window_handles[-1])

                    image_object = scrape_image_urls(link_text)

                    if image_object:
                        collection.insert_one({
                            'productName': image_object['productTitle'],
                            'imageUrls': image_object['imageUrls'],
                            'category': search_input
                        })

                    driver.close()
                    driver.switch_to.window(driver.window_handles[0])
            except Exception as e:
                print(f'Error opening search results: {e}')
                continue

    finally:
        driver.quit()

if __name__ == "__main__":
    example()

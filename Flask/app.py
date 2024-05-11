from flask import Flask, request, redirect, url_for, jsonify
from selenium import webdriver
import pickle
from selenium.webdriver.common.by import By
import undetected_chromedriver as uc
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from llm_nutri import call_llm

import google.generativeai as genai
from IPython.display import Markdown
import PIL.Image

import requests
from PIL import Image

import pymongo
import time
import random

client = pymongo.MongoClient("mongodb+srv://utkarsh:utkarsh@atlascluster.vdrhcf6.mongodb.net/")
db = client.NutriVista
source_images = db.source_images

app = Flask(__name__)


@app.route("/api/llm", methods=["POST"])
def home():
    data = request.json.get("nutrition")
    return call_llm(data)



@app.route('/run_selenium_script', methods=['POST'])
def run_selenium_script():
    # Receive any parameters needed for your Selenium script
    # For example, you might receive a URL to scrape
    url = request.json.get('url')
    category = request.json.get('category')

    chrome_options = uc.ChromeOptions()
    chrome_options.headless = True

    chrome_options.add_argument('proxy-server=http://142.93.239.211:8080')
     

    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')

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
        # driver.implicitly_wait(2)
        # product_title_element = driver.find_element(By.CSS_SELECTOR, '#productTitle')
        # product_title = product_title_element.text

        driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
            "source": """
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            })
            """
         })

        driver.get(url)
        print("visiting url: "+url)

        specific_image_list = []
        main_image_element = driver.find_element(By.CLASS_NAME, 'chromeful-container')
        ActionChains(driver).click(main_image_element).perform()
        
        driver.implicitly_wait(3)

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

        # source_images.insert_one({
        #     'productName': product_title,
        #     'imageUrls': specific_image_element,
        #     'category': category
        # }) 
        print(specific_image_list)
        return jsonify({"Status":"OK", "Result":specific_image_list}) 


    except Exception as e:
        print(f'Error scraping image URLs: {e}')
        str=f'Error extracting data from webpage: {e}'
        return jsonify({"Status":str})
    finally:
        # Close the WebDriver session
        driver.quit()


raw_text=db.raw_texts
genai.configure(api_key='AIzaSyAEeSwB5xbBSPzqWjJocns0yC8XUci-HXE')
model = genai.GenerativeModel('gemini-pro-vision')

@app.route('/extract_text', methods=['POST'])
async def extract_text():
    image_urls=request.json.get("imageUrls")

    processed_image_paths = await process_images(image_urls)
    if not processed_image_paths:
        return jsonify({"Status":"Error processing images", "Nutrional Array":[], "Ingredients Array":[]})
    print("Images downloaded")  
    
    loaded_images=await load_into_array(processed_image_paths)
    if not loaded_images:
        return jsonify({"Status":"Error loading images", "Nutrional Array":[], "Ingredients Array":[]})
    print("Images loaded")  
    
    nutritional_data, ingredients=await gemini_extraction(loaded_images, "Peanut Butter")
    print("Images Text Extracted")  
    
    await delete_png_files(processed_image_paths)
    print("Images deleted")  
    return jsonify({"Status":"OK", "Nutritional Array":nutritional_data, "Ingredients Array":ingredients}) 


async def download_image(url, destination):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            with open(destination, 'wb') as f:
                f.write(response.content)
            return True
        else:
            print(f"Failed to download image from {url}")
            return False
    except Exception as e:
        print(f"Error downloading image from {url}: {e}")
        return False

import os

async def process_images(image_urls):
    processed_image_paths = []
    for url in image_urls:
        filename = url.split('/')[-1]
        destination = os.path.join("images", filename)  # Save images in 'images' folder
        if await download_image(url, destination):
            # Process the image (e.g., convert to PNG)
            try:
                # Example: Convert to PNG
                img = Image.open(destination)
                
                
                if img.format == "GIF":
                    print(f"Deleting GIF file: {destination}")
                    try:
                        os.remove(destination)
                        continue  # Skip processing further if it's a GIF
                    except PermissionError:
                        print(f"PermissionError: {destination} is being used by another process")
                    
                png_filename = os.path.splitext(destination)[0] + ".png"
                img.save(png_filename, "PNG")
                processed_image_paths.append(png_filename)
            except Exception as e:
                print(f"Error processing image {filename}: {e}")

            # Delete the downloaded image
            os.remove(destination)
        else:
            print(f"Skipping image {filename} due to download failure")
    
    
    return processed_image_paths


async def delete_png_files(png_file_paths):
    for png_file_path in png_file_paths:
        try:
            os.remove(png_file_path)
            # print(f"Deleted {png_file_path}")
        except Exception as e:
            print(f"Error deleting {png_file_path}: {e}")



async def load_into_array(processed_image_paths):
    loaded_images=[]
    for image_path in processed_image_paths:
        try:
            with PIL.Image.open(image_path) as img:
                loaded_images.append(img.copy())
        except Exception as e:
            print(f"Error loading image: {e}")
            continue
    return loaded_images




async def gemini_extraction(loaded_images, productName):
    
    nutritional_data=[]
    ingredients=[]
    for image_parts in loaded_images:
        try:
            response1 = model.generate_content(["Extract nutritional data from the image if available if not available just respond with '-',give output in this format stricyly \n [{Nutrient: protein, per/x:' ', per/y:' ', %RDA:' ',...},...] where x and y can be 30g, 100g or serve etc. which depends on the what is shown on the image. some might contain only one number(only x), some might contain both. Nutrional data should be of product "+productName+" and no other product", image_parts], stream=True, )
            
            response1.resolve()
            print(response1.text)
            nutritional_data.append(response1.text)

            time.sleep(1)
            response2 = model.generate_content([f"Extract ingredients list from the image if available, if not available just respond with '-'", image_parts], stream=True)
            response2.resolve()
            print(response2.text)
            ingredients.append(response2.text)
        except Exception as e:
            print(f"Error extracting text from image: {e}")
            continue
    return nutritional_data,ingredients





model2 = genai.GenerativeModel('gemini-pro')
@app.route('/parse_text', methods=['POST'])
async def parse_text():
    nutritional_array= request.json.get("Nutritional Array")
    ingredients_array= request.json.get("Ingredients Array")
    nutritional_string = '\n'.join(nutritional_array)
    ingredients_string = '\n'.join(ingredients_array)
    
    prompt2="Detect the ingredients of the product in the given input and creturn a single in this format: [<Ingredient1>,<Ingredient2>,...]. Assume certain data and if ingredients not present just return '-'. Keep one ingredient value only once in the output and make sure to mention all the ingredients present."
    prompt1="Detect the nutrition table in the given input and convert it in this format:[{Nutrient:<NutrientName>, per/x:' ', per/y:' ', %RDA:' '}, {Nutrient:<NutrientName>, per/x:' ', per/y:' ', %RDA:' '}, ...]. The variables x and y will be given in the raw text for example 30g, 32g, serve etc. Some might contain only one value(only x), some might contain both and return the final values in the format given. Assume certain data and if certain values not present just return it with '-'. Mention one nutrient only once  "
    
    response1 = model2.generate_content([prompt1,nutritional_string], stream=True,)
    response1.resolve()
    print(response1.text)
    nutritional_response=response1.text
    time.sleep(1)


    response2 = model2.generate_content([prompt2,ingredients_string], stream=True,)
    response2.resolve()
    print(response2.text)
    ingredients_response=response2.text
    time.sleep(1)

    return jsonify({"Status":"OK", "Nutritional Array":nutritional_response, "Ingredients Array":ingredients_response}) 
 

if __name__ == '__main__':
    app.run(debug=True) 
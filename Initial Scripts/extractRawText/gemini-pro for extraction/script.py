import google.generativeai as genai
from IPython import display
from IPython.display import Markdown
import PIL.Image
import aiohttp
from io import BytesIO
import time
from google.generativeai.types import HarmCategory, HarmBlockThreshold


def to_markdown(text):
  text = text.replace('•', '  *')
  return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))

import pymongo
import requests
from PIL import Image
import io
import asyncio
import google.ai.generativelanguage as glm

genai.configure(api_key='AIzaSyAEeSwB5xbBSPzqWjJocns0yC8XUci-HXE')

client = pymongo.MongoClient("mongodb+srv://utkarsh:utkarsh@atlascluster.vdrhcf6.mongodb.net/NutriVista")
db = client.get_database("NutriVista")
source_images = db.source_images
raw_text=db.raw_texts

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
        with PIL.Image.open(image_path) as img:
            loaded_images.append(img.copy())
    return loaded_images

async def extract_text(loaded_images, productName):
    model = genai.GenerativeModel('gemini-pro-vision')
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
            print(f"Error processing image: {e}")
            continue
    return nutritional_data,ingredients



async def main():
    data = source_images.find({})
    excluded_products = [
    "AS-IT-IS Nutrition Pure Creatine Monohydrate for Muscle Building (150 gm) | USA Labdoor Certified for Accuracy & Purity |",
    "UNIBIC Fruit & Nut Cookies, 500 g",
    "Unibic Cake - Royal Vanilla 140gm",
    "Hurricane Energy Drink 250Ml Pack of 6",
    # "Open Secret 100% Natural Premium Whole Cashews 200 g Value Pack | Whole Crunchy Cashew | Premium Kaju Nuts | Nutritious & Delicious | Healhy Dry Fruits Snacks | Gluten Free & High Protein",
    # "Fortune Sunlite Refined Sunflower Oil, 1L",
    # "Dhara Refined Sunflower Oil Pouch, 1L",
    # "Fortune Sunlite Refined Sunflower Oil, 5L Jar",
    # "Gold Winner Refined Sunflower Oil, 1L",
    # "Fortune Premium Kachi Ghani Pure Mustard Oil, 1 ltr pouch",
    # "Fortune Premium Kachi Ghani Pure Mustard Oil, 1Litre PET Bottle",
    # "Patanjali Fortified Mustard Oil, 1L",
    # "Refined Mustard Oil, Vitamins A & D2",
    # "Dabur Cold Pressed Mustard Oil 1L | Healthy Cooking Oil | Goodness of Omega 3 & 6 | Perfect blend of Health, Taste & Aroma",
    # "Dalda Kachi Ghani Mustard Oil -1 L (Pet Bottle )",
    # "Fortune Premium Kachi Ghani Pure Mustard Oil, 5 Ltr Jar",
    # "Dhara Kachi Ghani Oil, Mustard, 1L Bottle"
    # "Neuherbs Organic Raw & Unroasted Pumpkin Seeds | Immunity Booster and Fiber Rich Superfood | Rich Source of Omega 3 | Highly Nutritious Snack | Rich in Protein, Dietary Fibre, Zinc & Magnesium - 200 G",
    # "Tata Simply Better Pure & Unrefined Cold Pressed Mustard Oil,Naturally Cholesterol Free, 1L, Rich Aroma & Flavour of Real Mustard Seeds, A1 Grade Mustard Seeds"
    
    ]

    
    for images in data:
        existing_doc = raw_text.find_one({"productName": images["productName"]})
        
        if images["productName"] in excluded_products:            
            continue
        
        
        if not existing_doc:

            image_urls = images["imageUrls"]
            print("Processing: "+images["productName"])
            productName=images["productName"]
            category=images["category"]
            processed_image_paths = await process_images(image_urls)

            print("Processed image paths:", processed_image_paths)
                
            loaded_images=await load_into_array(processed_image_paths)

            nutritional_data, ingredients=await extract_text(loaded_images, images.get("productName"))

            new_document = {
                "productName": productName,
                "imageUrls": image_urls,
                "nutritionalData": nutritional_data,
                "ingredientsList":ingredients,
                "category":category
            }
            raw_text.insert_one(new_document)
            # Delete PNG files after printing responses
            await delete_png_files(processed_image_paths)
            

if __name__ == "__main__":
    asyncio.run(main())
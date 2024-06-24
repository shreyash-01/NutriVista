

"""
At the command line, only need to run once to install the package via pip:

$ pip install google-generativeai
"""

import google.generativeai as genai
from dotenv import load_dotenv
import os


load_dotenv()


def call_llm(nutritional_values: str)-> str:
  API = os.getenv('API_KEY')
  genai.configure(api_key=API)

  # Set up the model
  generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 0,
    "max_output_tokens": 8192,
  }

  safety_settings = [
    {
      "category": "HARM_CATEGORY_HARASSMENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_HATE_SPEECH",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    },
  ]
  model = genai.GenerativeModel(model_name="gemini-1.5-pro-latest",
                                generation_config=generation_config,
                                safety_settings=safety_settings)

  convo = model.start_chat(history=[
  ])
  message = """below is the nutritional data of a food act like a nutritionist tell the good details and the bad and finally give suggestion(write the suggestion in a paragraph like a doctor would and do not write anything like consult a registered dietitian or professional). Give me a detailed explanation for this. lastly score the product out of 10 in your opinion""" + nutritional_values
  convo.send_message(message)
  return convo.last.text









# nutritional_values="""[{Nutrient: Energy, per/30g: '204 kCal', per/100g: '639 kCal', %RDA: '10.2%'},
# {Nutrient: Protein, per/30g: '10 g', per/100g: '30 g', %RDA: '16%'},
# {Nutrient: Total Carbohydrate, per/30g: '6 g', per/100g: '18 g', %RDA: '-'},
# {Nutrient: Dietary Fibre, per/30g: '1 g', per/100g: '3 g', %RDA: '9.6%'},
# {Nutrient: Total Sugars, per/30g: '0 g', per/100g: '0 g', %RDA: '0%'},
# {Nutrient: Added Sugars, per/30g: '0 g', per/100g: '0 g', %RDA: '-'},
# {Nutrient: Total Fat, per/30g: '16 g', per/100g: '49 g', %RDA: '23.4%'},
# {Nutrient: Saturated Fat, per/30g: '2 g', per/100g: '7 g', %RDA: '10.2%'},
# {Nutrient: Trans Fat, per/30g: '0 g', per/100g: '0 g', %RDA: '-'},
# {Nutrient: MUFA, per/30g: '5 g', per/100g: '15 g', %RDA: '-'},
# {Nutrient: PUFA, per/30g: '8 g', per/100g: '24 g', %RDA: '-'},
# {Nutrient: Omega-6, per/30g: '-', per/100g: '21 g', %RDA: '-'},
# {Nutrient: Cholesterol, per/30g: '0 mg', per/100g: '0 mg', %RDA: '-'},
# {Nutrient: Sodium, per/30g: '6 mg', per/100g: '19 mg', %RDA: '0.3%'},
# {Nutrient: Added Salt, per/30g: '0 g', per/100g: '0 g', %RDA: '-'}]"""



import {config} from "dotenv";
import mongoose from 'mongoose';
config();
import { GoogleGenerativeAI,HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

// import { TextServiceClient } from "@google-ai/generativelanguage";

// import { GoogleAuth } from "google-auth-library";


// const MODEL_NAME = "models/embedding-gecko-001";

// const API_KEY = process.env.API_KEY;

// const client = new TextServiceClient({
//   authClient: new GoogleAuth().fromAPIKey(API_KEY),
// });
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category:HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold:HarmBlockThreshold.BLOCK_NONE,
  },
];
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const generationConfig={temperature: 0.4, topP: 1, topK: 32, maxOutputTokens: 4096};

  mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

  const intermediate_schema = new mongoose.Schema({
    productName:String,
    imageUrls:[String],
    nutritionalData:[mongoose.Schema.Types.Mixed],
    ingredientsList:[mongoose.Schema.Types.Mixed],
    category:String,
    

  },{ collection: 'intermediate_data' });

  const intermediate_model = mongoose.model('intermediate_data', intermediate_schema);

  const raw_text_schema=new mongoose.Schema({
    productName:String,
    imageUrls:[String],
    nutritionalData:[String],
    ingredientsList:[String],
    category:String,
  },{ collection: 'raw_texts' })
 

  const raw_text=mongoose.model('raw_text', raw_text_schema);


  const ocr_raw_text_schema=new mongoose.Schema({
    productName:String,
    rawText:String,
    category:String,
  },{ collection: 'ocr_raw_texts' })
 

  const ocr_raw_text=mongoose.model('ocr_raw_texts', ocr_raw_text_schema);


  
  

async function run() {
  const tableData = await raw_text.find();

  
  const prompt2="Detect the ingredients of the product in the given input and creturn a single in this format: [<Ingredient1>,<Ingredient2>,...]. Assume certain data and if ingredients not present just return '-'. Keep one ingredient value only once in the output and make sure to mention all the ingredients present."
  const prompt1="Detect the nutrition table in the given input and convert it in this format:[{Nutrient:<NutrientName>, per/x:' ', per/y:' ', %RDA:' '}, {Nutrient:<NutrientName>, per/x:' ', per/y:' ', %RDA:' '}, ...]. The variables x and y will be given in the raw text for example 30g, 32g, serve etc. Some might contain only one value(only x), some might contain both and return the final values in the format given. Assume certain data and if certain values not present just return it with '-'. Mention one nutrient only once  "
  
  
  
  const model=genAI.getGenerativeModel({model:"gemini-pro", safetySettings});
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello, I have 2 dogs in my house." }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
        
      },
      
    ],
    generationConfig: {
      maxOutputTokens: 10000000,
    },
  });

  const chat2 = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello, I have 2 dogs in my house." }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
        
      }
      
    ],
    generationConfig: {
      maxOutputTokens: 10000000,
    },
  });

  for(const data of tableData){
    const existingDoc = await intermediate_model.findOne({ productName: data.productName });
    if(!existingDoc){

        const productName=data.productName;
        const category=data.category;
        const nutrition=data.nutritionalData;
        const ingredients=data.ingredientsList;
        const imageUrls=data.imageUrls;
        let raw_text='';
        const ocr_raw_text_data=await ocr_raw_text.findOne({productName:productName});
       if(ocr_raw_text_data){
          raw_text=ocr_raw_text_data.rawText;
       }
        nutrition.push(raw_text);

        ingredients.push(raw_text);
        // console.log(nutrition);
        // console.log(ingredients);
        
  


        const result1 = await model.generateContent(prompt1+nutrition);
        const response1 = await result1.response;
        const nutritionResult = response1.text();
        // console.log("Nutritional data of "+productName+": \n"+nutritionResult);


        const result2 = await model.generateContent(prompt2+ingredients);
        const response2 = await result2.response;
        const ingredientsResult = response2.text();
        // console.log("Nutritional data of "+productName+": \n"+ingredientsResult);
       
        



    
        const doc=new intermediate_model({productName:productName,imageUrls:imageUrls, nutritionalData:nutritionResult, ingredientsList:ingredientsResult, category:category})
        console.log(doc);
        doc.save()
        .then(savedRawText => {
          console.log("Raw text saved successfully:", savedRawText);
        })
        .catch(error => {
          console.error("Error saving raw text:", error);
        });
    }

  }

 




  
}

run();
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
const genAI = new GoogleGenerativeAI('AIzaSyAEeSwB5xbBSPzqWjJocns0yC8XUci-HXE');
const generationConfig={temperature: 0.4, topP: 1, topK: 32, maxOutputTokens: 4096};

  mongoose.connect('mongodb+srv://utkarsh:utkarsh@atlascluster.vdrhcf6.mongodb.net/NutriVista', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

  const final_schema = new mongoose.Schema({
    productName:String,
    imageUrls:[String],
    nutritionalData:[mongoose.Schema.Types.Mixed],
    ingredientsList:[mongoose.Schema.Types.Mixed],
    category:String,
    

  },{ collection: 'final_data' });

  const final_model = mongoose.model('final_data', final_schema);

  const intermediate_schema = new mongoose.Schema({
    productName:String,
    imageUrls:[String],
    nutritionalData:[mongoose.Schema.Types.Mixed],
    ingredientsList:[mongoose.Schema.Types.Mixed],
    category:String,
    

  },{ collection: 'intermediate_data' });

  const intermediate_model = mongoose.model('intermediate_data', intermediate_schema);

 


  
  

async function run() {
  const tableData = await intermediate_model.find();

  
  const prompt2="Detect the ingredients of the product in the given input and creturn a single in this format: ['<Ingredient1>','<Ingredient2>',...]. Assume certain data and if ingredients not present just return '-'. Keep one ingredient value only once in the output and make sure to mention all the ingredients present."
  const prompt1="Detect the nutrition table in the given input and convert it in this format:[{'Nutrient':'<NutrientName>', 'per/x':' ', 'per/y':' ', '%RDA':' '}, {'Nutrient':'<NutrientName>', 'per/x':' ', 'per/y':' ', '%RDA':' '}, ...]. The variables x and y will be given in the raw text for example 30g, 32g, serve etc. Some might contain only one value(only x), some might contain both and return the final values in the format given. Assume certain data. Mention one nutrient only once. The data will be uneven, some will have nutritional data in a format and some will have in the form of raw text clumped together. Prioritise the values of the structured data and if there is certain data not available, assume certain data using calculations. Return only a single array of the objects and MAKE SURE EACH KEY AND VALUE should be under ' ' as string(example: [ {'Nutrient': 'energy', 'per/30g':'619 kCal', 'per/100g':'186 kCal', '%RDA':'9.3%'},{'Nutrient': 'protein', 'per/30g':'26.0 g', 'per/100g':'7.8 g', '%RDA':'14.4%'}...])"
  
  
  
  const model=genAI.getGenerativeModel({model:"gemini-pro", safetySettings});
  

  for(const data of tableData){
    const existingDoc = await final_model.findOne({ productName: data.productName });
    if(!existingDoc){

        const productName=data.productName;
        const category=data.category;
        const nutrition=data.nutritionalData;
        const ingredients=data.ingredientsList;
        const imageUrls=data.imageUrls;
        
        
  


        const result1 = await model.generateContent(prompt1+nutrition);
        const response1 = await result1.response;
        const nutritionResult = response1.text();
        console.log("Nutritional data of "+productName+": \n"+nutritionResult);


        const result2 = await model.generateContent(prompt2+ingredients);
        const response2 = await result2.response;
        const ingredientsResult = response2.text();
        // console.log("Nutritional data of "+productName+": \n"+ingredientsResult);


       
        



    
        // const doc=new final_model({productName:productName,imageUrls:imageUrls, nutritionalData:nutritionResult, ingredientsList:ingredientsResult, category:category})
        // console.log(doc);
        // doc.save()
        // .then(savedRawText => {
        //   console.log("Raw text saved successfully:", savedRawText);
        // })
        // .catch(error => {
        //   console.error("Error saving raw text:", error);
        // });
    }

  }

 




  
}

run();
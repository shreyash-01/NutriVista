const axios = require('axios');
const vision = require('@google-cloud/vision');
const mongoose = require('mongoose');

// const schema = new mongoose.Schema({
//   productName: String,
//   imageUrls: [String],
//   category: String
// }, { collection: 'second_image' });

const sourceschema = new mongoose.Schema({
  productName: String,
  imageUrls: [String],
  category: String
}, { collection: 'source_images' });

const raw_text_schema=new mongoose.Schema({
  productName:String,
  rawText:String,
  imageUrls:[String],
  category:String,
},{ collection: 'ocr_raw_texts' });

const SourceModel = mongoose.model('source_images', sourceschema);

const raw_text=mongoose.model('ocr_raw_texts',raw_text_schema);

async function detectTextFromImages(imageUrls) {
  const client = new vision.ImageAnnotatorClient();
  let allTexts  = [];

  try {
    for (const imageUrl of imageUrls) {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageContent = Buffer.from(response.data, 'binary');
      const [result] = await client.textDetection(imageContent);
      const detections = result.textAnnotations;
      if (detections && detections.length > 0) {
          const sortedTexts = detections.slice(1).sort((a, b) => {
            const aY = Math.min(...a.boundingPoly.vertices.map(v => v.y));
            const bY = Math.min(...b.boundingPoly.vertices.map(v => v.y));

            if (aY !== bY) {
              return aY - bY; // Sort by y-coordinate first
            }

            const aX = Math.min(...a.boundingPoly.vertices.map(v => v.x));
            const bX = Math.min(...b.boundingPoly.vertices.map(v => v.x));

            return aX - bX; // If y-coordinates are equal, sort by x-coordinate
          });
          const sortedText = sortedTexts.map(annotation => annotation.description).join(' ');
          console.log("From:",imageUrl);
          console.log(sortedText);
          allTexts.push(sortedText); // Add sorted text for this image to the array


      }
    }
    
  

    return allTexts.join(' '); // Combine sorted text from all images into a single string

    
  } catch (error) {
    console.error('Error processing image:', error.message);
  }

  return texts.join(' '); // Combine all texts into a single string
}

async function processFoodProducts() {
  try {
    // const foodProducts1 = await SourceModel1.find();
    const foodProducts2= await SourceModel.find({});
    // console.log(foodProducts1);
    console.log(foodProducts2.length);
    // for (const foodProduct of foodProducts1) {
    //   const existingDoc = await raw_text.findOne({ productName: foodProduct.productName });
    //   if (!existingDoc) {
    //       const imageUrls = foodProduct.imageUrls;
    //       if (Array.isArray(imageUrls) && imageUrls.length > 0) {
    //         const combinedText = await detectTextFromImages(imageUrls);
    //         console.log(`Combined text for product ${foodProduct.productName}:`, combinedText);
    //         const newRawText=new raw_text({
    //           productName:foodProduct.productName,
    //           rawText:combinedText,
    //           imageUrls:foodProduct.imageUrls,
    //           category:foodProduct.category
    //         })
    //         newRawText.save()
    //         .then(savedRawText => {
    //           console.log("Raw text saved successfully:", savedRawText);
    //         })
    //         .catch(error => {
    //           console.error("Error saving raw text:", error);
    //         });
    //       }
    //   }
    // }
    for (const foodProduct of foodProducts2) {
      const existingDoc = await raw_text.findOne({ productName: foodProduct.productName });
      if (!existingDoc) {
        const imageUrls = foodProduct.imageUrls;
        if (Array.isArray(imageUrls) && imageUrls.length > 0) {
          const combinedText = await detectTextFromImages(imageUrls);
          console.log(`Combined text for product ${foodProduct.productName}:`, combinedText);
          const newRawText=new raw_text({
            productName:foodProduct.productName,
            rawText:combinedText,
            imageUrls:foodProduct.imageUrls,
            category:foodProduct.category
          })
          newRawText.save()
          .then(savedRawText => {
            console.log("Raw text saved successfully:", savedRawText);
          })
          .catch(error => {
            console.error("Error saving raw text:", error);
          });
        }
      }
    }
  } catch (error) {
    console.error('Error processing food products:', error);
  }
}

async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://utkarsh:utkarsh@atlascluster.vdrhcf6.mongodb.net/NutriVista');
    console.log('Connected to MongoDB');

    // Process food products
    await processFoodProducts();

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();

const axios = require('axios');
const vision = require('@google-cloud/vision');
const mongoose = require('mongoose');

const scraped_product_images_schema = new mongoose.Schema({
  productName: String,
  imageUrls: [String], // Assuming 'images' is an array of image URLs
  category: String,
});
const raw_text_schema=new mongoose.Schema({
  productName:String,
  rawText:String,
  category:String,
});

const scraped_product_images = mongoose.model('scraped_product_images', scraped_product_images_schema);
const raw_text=mongoose.model('raw_text',raw_text_schema);

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
        allTexts.push(...detections.slice(1)); // Append all text annotations except the first one (full image annotation)
      }
    }
    
    // Sort all text annotations based on their bounding box coordinates
    const sortedTexts = allTexts.sort((a, b) => {
      const aY = Math.min(...a.boundingPoly.vertices.map(v => v.y));
      const bY = Math.min(...b.boundingPoly.vertices.map(v => v.y));
      
      if (aY !== bY) {
        return aY - bY; // Sort by y-coordinate first
      }

      const aX = Math.min(...a.boundingPoly.vertices.map(v => v.x));
      const bX = Math.min(...b.boundingPoly.vertices.map(v => v.x));

      return aX - bX; // If y-coordinates are equal, sort by x-coordinate
    });

    // Combine sorted text annotations into a single string
    const sortedText = sortedTexts.map(annotation => annotation.description).join(' ');

    return sortedText;
    
  } catch (error) {
    console.error('Error processing image:', error.message);
  }

  return texts.join(' '); // Combine all texts into a single string
}

async function processFoodProducts() {
  try {
    const foodProducts = await scraped_product_images.find();
    for (const foodProduct of foodProducts) {
      const imageUrls = foodProduct.imageUrls;
      if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        const combinedText = await detectTextFromImages(imageUrls);
        console.log(`Combined text for product ${foodProduct.productName}:`, combinedText);
        const newRawText=new raw_text({
          productName:foodProduct.productName,
          rawText:combinedText,
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

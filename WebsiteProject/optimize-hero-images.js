// Script to generate mobile-optimized hero images
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const HERO_IMAGES = ['hero01.jpg', 'hero02.jpg', 'hero03.jpg', 'hero04.jpg', 'hero05.jpg'];
const INPUT_DIR = './public/photos';
const OUTPUT_DIR = './public/photos';
const MOBILE_WIDTH = 800; // Mobile screens typically max 768px, so 800px is good for retina
const QUALITY = 80; // Good balance between quality and file size

async function optimizeImage(filename) {
  const inputPath = path.join(INPUT_DIR, filename);
  const outputFilename = filename.replace('.jpg', '-mobile.jpg');
  const outputPath = path.join(OUTPUT_DIR, outputFilename);

  try {
    const metadata = await sharp(inputPath).metadata();
    console.log(`Processing ${filename} (${metadata.width}x${metadata.height}, ${(metadata.size / 1024).toFixed(0)}KB)`);

    await sharp(inputPath)
      .resize(MOBILE_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .jpeg({ quality: QUALITY, progressive: true })
      .toFile(outputPath);

    const outputStats = await fs.stat(outputPath);
    const savings = ((1 - outputStats.size / metadata.size) * 100).toFixed(0);
    
    console.log(`✓ Created ${outputFilename} (${(outputStats.size / 1024).toFixed(0)}KB, ${savings}% smaller)\n`);
  } catch (error) {
    console.error(`✗ Error processing ${filename}:`, error.message);
  }
}

async function main() {
  console.log('Generating mobile-optimized hero images...\n');
  
  for (const filename of HERO_IMAGES) {
    await optimizeImage(filename);
  }
  
  console.log('Done! Mobile hero images created.');
}

main().catch(console.error);

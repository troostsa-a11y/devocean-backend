import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const photosDir = './public/photos';

async function convertToWebP() {
  console.log('Converting hero images to WebP format...\n');

  const files = await readdir(photosDir);
  const heroFiles = files.filter(f => /^hero\d+\.jpg$/.test(f));

  for (const file of heroFiles) {
    const inputPath = join(photosDir, file);
    const outputPath = join(photosDir, file.replace('.jpg', '.webp'));

    const inputStats = await sharp(inputPath).metadata();
    
    await sharp(inputPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(outputPath);

    const outputStats = await sharp(outputPath).metadata();
    const inputSize = (await sharp(inputPath).toBuffer()).length;
    const outputSize = (await sharp(outputPath).toBuffer()).length;
    
    const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);
    
    console.log(`✓ ${file} → ${file.replace('.jpg', '.webp')}`);
    console.log(`  ${(inputSize / 1024).toFixed(1)}KB → ${(outputSize / 1024).toFixed(1)}KB (${savings}% smaller)\n`);
  }

  console.log('WebP conversion complete!');
}

convertToWebP().catch(console.error);

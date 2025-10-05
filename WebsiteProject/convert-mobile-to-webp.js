import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const photosDir = './public/photos';

async function convertMobileToWebP() {
  console.log('Converting mobile hero images to WebP format...\n');

  const files = await readdir(photosDir);
  const mobileFiles = files.filter(f => /^hero\d+-mobile\.jpg$/.test(f));

  for (const file of mobileFiles) {
    const inputPath = join(photosDir, file);
    const outputPath = join(photosDir, file.replace('.jpg', '.webp'));

    const inputSize = (await sharp(inputPath).toBuffer()).length;
    
    await sharp(inputPath)
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath);

    const outputSize = (await sharp(outputPath).toBuffer()).length;
    const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);
    
    console.log(`✓ ${file} → ${file.replace('.jpg', '.webp')}`);
    console.log(`  ${(inputSize / 1024).toFixed(1)}KB → ${(outputSize / 1024).toFixed(1)}KB (${savings}% smaller)\n`);
  }

  console.log('Mobile WebP conversion complete!');
}

convertMobileToWebP().catch(console.error);

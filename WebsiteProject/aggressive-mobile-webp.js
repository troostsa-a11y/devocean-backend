import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const photosDir = './public/photos';

async function aggressiveCompression() {
  console.log('Applying aggressive compression to mobile WebP (quality 55)...\n');

  const files = await readdir(photosDir);
  const mobileFiles = files.filter(f => /^hero\d+-mobile\.jpg$/.test(f));

  for (const file of mobileFiles) {
    const inputPath = join(photosDir, file);
    const outputPath = join(photosDir, file.replace('.jpg', '.webp'));

    const oldSize = (await sharp(outputPath).toBuffer()).length;
    
    // Quality 55 - very aggressive for mobile
    await sharp(inputPath)
      .webp({ quality: 55, effort: 6 })
      .toFile(outputPath);

    const newSize = (await sharp(outputPath).toBuffer()).length;
    const oldKB = (oldSize / 1024).toFixed(1);
    const newKB = (newSize / 1024).toFixed(1);
    const savings = (oldSize - newSize) / 1024;
    
    console.log(`✓ ${file.replace('.jpg', '.webp')}`);
    console.log(`  ${oldKB}KB → ${newKB}KB (saved ${savings.toFixed(1)}KB)\n`);
  }

  console.log('Aggressive compression complete!');
}

aggressiveCompression().catch(console.error);

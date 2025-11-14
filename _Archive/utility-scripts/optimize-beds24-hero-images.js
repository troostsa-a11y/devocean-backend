import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Target dimensions for Beds24 carousel
// Display size: 553x415px
// 2x for retina: 1106x830px
const TARGET_WIDTH = 1106;
const TARGET_HEIGHT = 830;

async function optimizeHeroImages() {
  const sourceDir = join(__dirname, 'WebsiteProject', 'public', 'photos');
  const outputDir = join(__dirname, '_Archive', 'beds24');

  console.log('🎯 Optimizing HERO images for Beds24 carousel...\n');
  
  try {
    const files = await readdir(sourceDir);
    const heroFiles = files.filter(f => f.startsWith('hero') && f.endsWith('.jpg'));
    
    let totalOriginal = 0;
    let totalWebP = 0;
    let totalJPG = 0;

    for (const file of heroFiles) {
      const inputPath = join(sourceDir, file);
      const baseName = file.replace('.jpg', '');
      
      // Get original file size
      const stats = await sharp(inputPath).metadata();
      const origSize = (await sharp(inputPath).toBuffer()).length;
      totalOriginal += origSize;
      
      console.log(`📸 ${file} (${stats.width}x${stats.height}) - ${(origSize / 1024).toFixed(0)} KB`);
      
      // Create WebP version (best compression)
      const webpPath = join(outputDir, `${baseName}.webp`);
      const webpBuffer = await sharp(inputPath)
        .resize(TARGET_WIDTH, TARGET_HEIGHT, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 80 })
        .toFile(webpPath);
      
      totalWebP += webpBuffer.size;
      console.log(`   ✅ WebP: ${(webpBuffer.size / 1024).toFixed(0)} KB (${((1 - webpBuffer.size / origSize) * 100).toFixed(0)}% smaller)`);
      
      // Create optimized JPG version (fallback if Beds24 doesn't support WebP)
      const jpgPath = join(outputDir, `${baseName}.jpg`);
      const jpgBuffer = await sharp(inputPath)
        .resize(TARGET_WIDTH, TARGET_HEIGHT, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(jpgPath);
      
      totalJPG += jpgBuffer.size;
      console.log(`   ✅ JPG:  ${(jpgBuffer.size / 1024).toFixed(0)} KB (${((1 - jpgBuffer.size / origSize) * 100).toFixed(0)}% smaller)\n`);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 HERO IMAGES SUMMARY (${heroFiles.length} images optimized)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Original total:  ${(totalOriginal / 1024).toFixed(0)} KB`);
    console.log(`WebP total:      ${(totalWebP / 1024).toFixed(0)} KB (${((1 - totalWebP / totalOriginal) * 100).toFixed(0)}% savings)`);
    console.log(`JPG total:       ${(totalJPG / 1024).toFixed(0)} KB (${((1 - totalJPG / totalOriginal) * 100).toFixed(0)}% savings)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✨ Hero images optimized and saved to: _Archive/beds24/');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

optimizeHeroImages();

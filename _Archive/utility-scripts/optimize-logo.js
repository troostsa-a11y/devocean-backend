/**
 * Logo Optimization Script
 * Creates optimized versions of the DEVOCEAN Lodge logo
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function optimizeLogo() {
  const inputPath = 'WebsiteProject/public/images/devocean_logo_new.png';
  const outputDir = 'WebsiteProject/public/images';
  
  console.log('🎨 Optimizing DEVOCEAN Lodge logo...\n');
  
  // Get original file size
  const originalStats = fs.statSync(inputPath);
  console.log(`📊 Original file: ${(originalStats.size / 1024).toFixed(2)} KB\n`);
  
  // Get image metadata
  const metadata = await sharp(inputPath).metadata();
  console.log(`📐 Original dimensions: ${metadata.width} x ${metadata.height}\n`);
  
  // Create optimized versions
  const versions = [
    // For email (smaller, optimized PNG)
    {
      name: 'devocean_logo_email.png',
      width: 320,
      format: 'png',
      quality: 90,
      description: 'Email logo (PNG, 320px)'
    },
    // For website header (WebP for modern browsers)
    {
      name: 'devocean_logo_header.webp',
      width: 400,
      format: 'webp',
      quality: 85,
      description: 'Website header (WebP, 400px)'
    },
    // PNG fallback for website
    {
      name: 'devocean_logo_header.png',
      width: 400,
      format: 'png',
      quality: 85,
      description: 'Website header fallback (PNG, 400px)'
    },
    // Full size optimized
    {
      name: 'devocean_logo_full.png',
      width: metadata.width,
      format: 'png',
      quality: 90,
      description: 'Full size optimized (PNG)'
    }
  ];
  
  for (const version of versions) {
    const outputPath = path.join(outputDir, version.name);
    
    let pipeline = sharp(inputPath).resize(version.width, null, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    });
    
    if (version.format === 'webp') {
      pipeline = pipeline.webp({ quality: version.quality });
    } else if (version.format === 'png') {
      pipeline = pipeline.png({ quality: version.quality, compressionLevel: 9 });
    }
    
    await pipeline.toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const savings = ((1 - stats.size / originalStats.size) * 100).toFixed(1);
    
    console.log(`✅ ${version.description}`);
    console.log(`   File: ${version.name}`);
    console.log(`   Size: ${sizeKB} KB (${savings}% smaller)`);
    console.log('');
  }
  
  console.log('🎉 Logo optimization complete!\n');
  console.log('📁 All files saved to: WebsiteProject/public/images/\n');
}

optimizeLogo().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

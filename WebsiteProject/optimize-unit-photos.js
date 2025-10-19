import sharp from 'sharp';
import { readdir, mkdir, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const sourceDir = './photos/units';
const outputDir = './public/photos/units';

async function optimizeUnitPhotos() {
  console.log('Optimizing accommodation unit photos...\n');

  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }

  const files = await readdir(sourceDir);
  const jpgFiles = files.filter(f => f.endsWith('.jpg'));

  let totalSavings = 0;
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  for (const file of jpgFiles) {
    const inputPath = join(sourceDir, file);
    const outputPath = join(outputDir, file.replace('.jpg', '.webp'));

    // Get actual file size of input JPEG
    const inputStats = await stat(inputPath);
    const inputSize = inputStats.size;

    // Convert to WebP
    await sharp(inputPath)
      .webp({ quality: 85, effort: 6 })
      .toFile(outputPath);

    // Get actual file size of output WebP
    const outputStats = await stat(outputPath);
    const outputSize = outputStats.size;

    const savings = ((1 - outputSize / inputSize) * 100).toFixed(1);

    totalOriginalSize += inputSize;
    totalOptimizedSize += outputSize;

    console.log(`✓ ${file} → ${file.replace('.jpg', '.webp')}`);
    console.log(`  ${(inputSize / 1024).toFixed(1)}KB → ${(outputSize / 1024).toFixed(1)}KB (${savings}% smaller)\n`);
  }

  totalSavings = ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(1);

  console.log('='.repeat(60));
  console.log(`Total: ${jpgFiles.length} photos optimized`);
  console.log(`Original: ${(totalOriginalSize / 1024).toFixed(1)}KB`);
  console.log(`Optimized: ${(totalOptimizedSize / 1024).toFixed(1)}KB`);
  console.log(`Total savings: ${totalSavings}%`);
  console.log('='.repeat(60));
  console.log('\n✅ WebP conversion complete!');
}

optimizeUnitPhotos().catch(console.error);

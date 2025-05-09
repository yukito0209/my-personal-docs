// 生成缩略图
// 项目根目录下，打开终端并运行 node scripts/generate-thumbnails.mjs
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const photosDir = path.join(process.cwd(), 'public', 'photos');
const thumbnailsDir = path.join(process.cwd(), 'public', 'photos', 'thumbnails');

// 缩略图的目标宽度，高度会自动按比例调整
const THUMBNAIL_WIDTH = 400; 

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    } else {
      throw error;
    }
  }
}

async function generateThumbnails() {
  try {
    await ensureDirectoryExists(thumbnailsDir);

    const files = await fs.readdir(photosDir);
    const imageFiles = files.filter(file => 
      !file.startsWith('.') &&
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      console.log('No images found in a public/photos to generate thumbnails for.');
      return;
    }

    console.log(`Found ${imageFiles.length} images. Starting thumbnail generation...`);

    for (const file of imageFiles) {
      const sourcePath = path.join(photosDir, file);
      const targetPath = path.join(thumbnailsDir, file);

      try {
        // 可选：检查缩略图是否已存在且比原图新
        let shouldGenerate = true;
        try {
          const sourceStat = await fs.stat(sourcePath);
          const targetStat = await fs.stat(targetPath);
          if (targetStat.mtimeMs >= sourceStat.mtimeMs) {
            shouldGenerate = false;
            console.log(`Thumbnail for ${file} is up to date. Skipping.`);
          }
        } catch (err) {
          // 缩略图不存在，继续生成
        }

        if (shouldGenerate) {
          await sharp(sourcePath)
            .resize({ width: THUMBNAIL_WIDTH })
            .toFile(targetPath);
          console.log(`Generated thumbnail for ${file}`);
        }
      } catch (error) {
        console.error(`Error generating thumbnail for ${file}:`, error.message);
      }
    }

    console.log('Thumbnail generation complete.');
  } catch (error) {
    console.error('Error during thumbnail generation process:', error);
    if (error.message.includes('requires Node.js 12.17.0 or later')) {
        console.error("Please ensure you are using a compatible Node.js version for the 'sharp' library.");
    }
  }
}

generateThumbnails(); 
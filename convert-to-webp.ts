import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = './public';
const files = fs.readdirSync(publicDir);

files.forEach(file => {
  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
    const filePath = path.join(publicDir, file);
    const outputFilePath = path.join(publicDir, file.replace(/\.(jpg|jpeg)$/, '.webp'));
    
    sharp(filePath)
      .toFile(outputFilePath)
      .then(() => console.log(`Converted ${file} to WebP`))
      .catch(err => console.error(`Error converting ${file}:`, err));
  }
});

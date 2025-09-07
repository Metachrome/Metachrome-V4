import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create assets directory if it doesn't exist
const assetsDir = path.join(process.cwd(), 'client', 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Copy essential images
const imagesToCopy = [
  'logo_base_1754552987910.png',
  'featureimage01_1754552987907.png',
  'featureimage02_1754552987908.png',
  'featureimage03_1754552987909.png',
  'FAQ_image_1754552987905.png',
  'emailsb_1754552987905.png'
];

imagesToCopy.forEach(image => {
  const src = path.join(__dirname, 'attached_assets', image);
  const dest = path.join(assetsDir, image);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${image}`);
  } else {
    console.log(`Source not found: ${image}`);
  }
});

console.log('Asset copying complete!');

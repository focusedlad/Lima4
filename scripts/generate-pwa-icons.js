import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateIcons() {
  const svgPath = path.resolve('./public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const targets = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'pwa-maskable-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon.png', size: 64 },
  ];

  for (const target of targets) {
    const dest = path.resolve('./public', target.name);
    await sharp(svgBuffer)
      .resize(target.size, target.size)
      .png()
      .toFile(dest);
    console.log(`Generated ${target.name} (${target.size}x${target.size})`);
  }

  // Also create a maskable icon with safe zone padding (10% padding)
  const paddedDest = path.resolve('./public/pwa-maskable-512x512.png');
  const innerSize = Math.round(512 * 0.8);
  const padding = Math.round((512 - innerSize) / 2);

  const innerBuffer = await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 253, g: 251, b: 247, alpha: 1 }, // cream background
    },
  })
    .composite([{ input: innerBuffer, top: padding, left: padding }])
    .png()
    .toFile(paddedDest);

  console.log('Generated safe-zone padded pwa-maskable-512x512.png');
}

generateIcons().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});

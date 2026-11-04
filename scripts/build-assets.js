// Draws the bundled default artwork (logo, CEO placeholder, illustrations) in
// the default brand colours into /brand.   npm run assets
import { buildBundledAssets } from '../src/generate.js';
await buildBundledAssets();
console.log('Default artwork written to brand/');

#!/usr/bin/env node
// Build index.html from _index_template.html + base64-embedded assets.
// Usage: node _build.js
const fs = require('fs');
const path = require('path');

const root = __dirname;
const template = fs.readFileSync(path.join(root, '_index_template.html'), 'utf8');

// 1) Embed the top-down spike image (官方 Plant Plant 喷漆, 512x512, square)
const spikePath = path.join(root, 'assets/spike/spike_plant_full.png');
const spikeB64 = fs.readFileSync(spikePath).toString('base64');
const spikeDataUri = 'data:image/png;base64,' + spikeB64;

// 2) Embed each map image + sites JSON
const sites = JSON.parse(fs.readFileSync(path.join(root, '_sites.json'), 'utf8'));
let html = template;

// Replace IMG_<id> placeholders
const mapIds = ['ascent','bind','split','haven','icebox','breeze','fracture','pearl','lotus','sunset','abyss','corrode','summit'];
mapIds.forEach(id => {
  // Map images live in assets/_crop/<id>.png
  const imgPath = path.join(root, 'assets/_crop', id + '.png');
  if (fs.existsSync(imgPath)) {
    const b64 = fs.readFileSync(imgPath).toString('base64');
    const uri = 'data:image/png;base64,' + b64;
    html = html.split('{{IMG_' + id + '}}').join(uri);
  } else {
    console.warn('Missing map image: ' + imgPath);
  }
  // Sites placeholder
  const sitesJson = JSON.stringify(sites[id] || []);
  html = html.split('{{SITES_' + id + '}}').join(sitesJson);
});

// 3) Replace SPIKE_B64_PLACEHOLDER (if any remain) and the legacy spike image (3 occurrences)
html = html.split('SPIKE_B64_PLACEHOLDER').join(spikeDataUri);

// 4) Replace the legacy big spike image (569196B base64 PNG, 600x1065) in the built file
// We need to actually patch the already-built index.html because the template
// was the previous step. So this build script mainly does the SPIKE replacement.

// Write the built file
fs.writeFileSync(path.join(root, 'index.html'), html, 'utf8');
console.log('Built index.html (' + (html.length / 1024).toFixed(1) + ' KB)');

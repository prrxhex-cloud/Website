const https = require('https');
const fs = require('fs');
const path = require('path');

const download = (url, dest) => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return download(res.headers.location, dest);
    }
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Downloaded ' + dest + ' (Size: ' + fs.statSync(dest).size + ')');
    });
  }).on('error', (err) => {
    console.error('Error downloading ' + dest + ':', err.message);
  });
};

const assetsDir = path.join(__dirname, 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Devicons URLs are reliable for raw SVGs
download('https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/windows8/windows8-original.svg', path.join(assetsDir, 'windows.svg'));

// For bluestacks and msi, let's use a proxy for wikipedia or alternative safe SVG sources.
// Actually, let's just use icon-icons.com or standard github repos if possible.
// Or we can just create simple placeholders for now to test if local assets work.
// I will try to fetch the wikipedia SVGs one more time, maybe they'll work.
download('https://upload.wikimedia.org/wikipedia/commons/4/42/BlueStacks_App_Player_Logo_2021.svg', path.join(assetsDir, 'bluestacks.svg'));
download('https://upload.wikimedia.org/wikipedia/commons/c/ca/MSI_logo.svg', path.join(assetsDir, 'msi.svg'));


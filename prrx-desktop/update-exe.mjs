import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const rcedit = require('rcedit');
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const exePath = path.join(__dirname, 'dist', 'prrx-desktop', 'prrx-desktop-win_x64.exe');
  const newExePath = path.join(__dirname, 'dist', 'prrx-desktop', 'PRRX-HEX.exe');

  if (fs.existsSync(exePath)) {
    fs.renameSync(exePath, newExePath);
  }

  try {
    await rcedit(newExePath, {
      'version-string': {
        'FileDescription': 'PRRX HEX',
        'ProductName': 'PRRX HEX',
        'CompanyName': 'PRRX',
        'OriginalFilename': 'PRRX-HEX.exe'
      }
    });
    console.log('Successfully updated EXE metadata!');
  } catch (err) {
    console.error('Error updating EXE:', err);
  }
}

main();

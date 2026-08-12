const rcedit = require('rcedit');
const path = require('path');
const fs = require('fs');

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

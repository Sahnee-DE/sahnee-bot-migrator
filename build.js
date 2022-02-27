// Build script since windows can't handle basic UNIX commands
const fs = require('fs-extra');
const child_process = require('child_process');

fs.rmSync('./pkg', { recursive: true, force: true });
fs.mkdirpSync('./pkg');
child_process.exec('npm run build.pkg');
fs.copyFileSync('./appsettings.example.json', './pkg/appsettings.json');
fs.copySync('./db', './pkg/db');

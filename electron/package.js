const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const packageCmd = [
  'electron-packager',
  'dist',
  'SpY',
  '--asar',
  '--overwrite',
  '--out',
  'electron/packages',
  '--electron-version',
  '3.0.10',
];

const run = ([command, ...options], env) => (
  new Promise((resolve, reject) => {
    const cmd = spawn(
      `${command}${process.platform === 'win32' ? '.cmd' : ''}`,
      options,
      { cwd: path.resolve(__dirname, '..'), env }
    );
    cmd.stdout.pipe(process.stdout);
    cmd.stderr.pipe(process.stderr);
    cmd.on('exit', (status) => {
      if (status === 0) {
        resolve();
      } else {
        reject();
      }
    });
  })
);

run([
  'yarn',
  'run',
  'build',
], { BASENAME: '../' }).then(() => (
  new Promise((resolve) => {
    fs.copyFile(path.resolve(__dirname, 'main.js'), path.resolve(__dirname, '..', 'dist', 'main.js'), (err) => {
      if (err) throw err;
      fs.copyFile(path.resolve(__dirname, '..', 'package.json'), path.resolve(__dirname, '..', 'dist', 'package.json'), (err) => {
        if (err) throw err;
        const index = path.resolve(__dirname, '..', 'dist', 'index.html');
        const html = fs.readFileSync(index, 'utf8');
        fs.writeFileSync(
          index,
          html
            .replace(/spygame\.tk\.\.\//gi, 'spygame.tk/')
            .replace(/\.\.\//g, './')
        );
        resolve(run([
          ...packageCmd,
          '--platform=win32',
          '--arch=ia32',
        ]).then(run([
          ...packageCmd,
          '--platform=linux',
          '--arch=x64',
        ])));
      });
    });
  })
))
  .catch(() => process.exit(1));

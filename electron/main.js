const { app, BrowserWindow } = require('electron');

app.on('ready', () => {
  const browserWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: true,
  });
  browserWindow.setMenu(null);
  browserWindow.loadFile('index.html');
  // browserWindow.webContents.openDevTools();
});

app.on('window-all-closed', () => (
  app.quit()
));

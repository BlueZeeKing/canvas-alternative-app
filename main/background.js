import { app, ipcMain } from 'electron';
import serve from 'electron-serve';
import { createWindow } from './helpers';
import axios from "axios";
import { config } from "dotenv";

config({
  path: "/Users/1002148/Desktop/canvas-alternative-app/.env", // set relative path to .env file on root project
});

const { MY_ENV, API_KEY } = process.env;

const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1100,
    height: 600,
    titleBarStyle: "hidden",
  });

  if (isProd) {
    await mainWindow.loadURL('app://./home.html');
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('canvas', async (e, body) => {
  const res = await axios.get(
    body,
    {
      headers: { Authorization: `Bearer ${API_KEY}` },
    }
  )
  e.returnValue = JSON.stringify(res.data)
})
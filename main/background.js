import { app, ipcMain, session } from "electron";
import serve from 'electron-serve';
import { createWindow } from './helpers';
import axios from "axios";
import { config } from "dotenv";
import path from "path"
import os from "os"

config({
  path: ".env", // set relative path to .env file on root project
});

const { MY_ENV, API_KEY } = process.env;

const isProd = process.env.NODE_ENV === 'production';

const reactDevToolsPath = path.join(
  os.homedir(),
  "/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.24.0_0"
);

app.whenReady().then(async () => {
  await session.defaultSession.loadExtension(reactDevToolsPath);
});

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1500,
    height: 1200,
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
  console.log(body)
  try {
    const res = await axios.get(
      body,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
      }
    )

    e.returnValue = JSON.stringify(res.data)
  } catch (err) {
    console.log(API_KEY);
    e.returnValue = {};
  }
})
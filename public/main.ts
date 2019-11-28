import * as electron from "electron";
import * as path from "path";
import * as url from "url";
import squirrelCheck from "./squirrel";

const __DEV__ = process.env.NODE_ENV === "development";
const isSquirrel = squirrelCheck();
if (!isSquirrel) {
  electronInit();
}

function electronInit() {
  let currWin: Electron.BrowserWindow;
  let secondaryWin: Electron.BrowserWindow;

  function createAndSetWin() {
    currWin = createWindow();
    if (__DEV__) {
      secondaryWin = createWindow();
      currWin.webContents.openDevTools();
    } else {
      if (process.platform === "win32") {
        // const { checkUpdates } = require("./autoUpdater");
        // checkUpdates();
      }
    }
  }

  function createWindow () {
    let win: Electron.BrowserWindow;
    win = new electron.BrowserWindow({
      fullscreen: false,
      width: 1120,
      height: 730,
      frame: false,
      autoHideMenuBar: true,
      vibrancy: "dark",
      maximizable: true,
      fullscreenable: true,
      resizable: true,
      icon: path.join(__dirname, "static/images/icons/icon-128x128." + process.platform === "darwin" ? "icns" : "ico" )
    });

    win.loadURL(url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file",
      slashes: true
    }));

    win.on("closed", (e: any) => {
      win = null;
    });

    return win;
  }

  electron.app.on("ready", createAndSetWin);

  electron.app.on("window-all-closed", () => {
    currWin = null;
    electron.app.quit();
  });

  electron.app.on("activate", () => {
    if (currWin === null) {
      createAndSetWin();
    }
  });
}

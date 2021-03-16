const { app, Menu, Tray, BrowserWindow } = require('electron')
const fs = require('fs');
const path = require('path');
const {ipcMain} = require('electron')

let settingsData = fs.readFileSync('octowrap-settings.json')
let settings = JSON.parse(settingsData);

let tray = null

var win = null;
var ipWin = null;

ipcMain.on('restart', (evt, arg) => {
    app.relaunch()
    app.exit()
})

function createWindow () {
    win = new BrowserWindow({
        icon:'octoprint.png',
        width: settings.screenWidth,
        height: settings.screenHeight,
        webPreferences: {
            nodeIntegration: true
        },
        title: "OctoWrap"
    })

    win.removeMenu();

    var url = (settings.ssl) ? "https://" : "http://" + settings.ip;
    win.loadURL(url);

    win.on('close', function (event) {
        if(!app.isQuiting){
            event.preventDefault();
            win.hide();
        }

        return false;
    });

    win.on('page-title-updated', (evt) => {
        evt.preventDefault();
    });

    win.on('maximize', function()
    {
        saveScreenSize();
    })

    win.on('resized', function()
    {
        saveScreenSize();
    });

    function saveScreenSize()
    {
        var size = win.getSize();
        var width = size[0];
        var height = size[1];
        settings.screenWidth = width;
        settings.screenHeight = height;
        saveSettings();
    }
}

function createIPWindow()
{
    if(ipWin != null)
    {
        ipWin.show();
        return;
    }

    ipWin = new BrowserWindow({
        icon:'octoprint.png',
        width: 300,
        height: 100,
        webPreferences: {
            sandbox: false,
            nodeIntegration: true,
            contextIsolation: false
        },
        title: "Octoprint IP"
    })

    ipWin.removeMenu();

    ipWin.loadFile('ip.html');

    ipWin.on('closed', function()
    {
        ipWin = null;
    });

    // ipWin.setFullScreenable(false)

    // ipWin.on('resize', (evt) => {
    //     evt.preventDefault();
    // })
    // ipWin.on('maximize', (evt) => {
    //     evt.preventDefault();
    // })
    // ipWin.on('minimize', (evt) => {
    //     evt.preventDefault();
    // })

}

function saveSettings()
{
    fs.writeFile('octowrap-settings.json', JSON.stringify(settings), function(err, result) {
        if(err) console.log('error', err);
      })
}

function makeTray()
{
    
    const trayIcnName = process.platform === 'win32' ? 'octoprint.ico' : 'octoprint.ico';
    const trayIcnPath = path.join(__dirname, `../app.asar/${trayIcnName}`);
    //const trayIcnPath = 'octoprint.ico';

    tray = new Tray(trayIcnPath)

    const contextMenu = Menu.buildFromTemplate([
        { 
            label: 'Show OctoPrint',
            click(){ win.show() }
        },
        {
            label: 'Change IP',
            click(){ createIPWindow() }
        },
        { 
            label: 'Quit', 
            click(){  app.isQuiting = true; app.quit(); }
        }
    ])

    tray.setToolTip('OctoWrap')
    tray.setContextMenu(contextMenu)
}

app.whenReady().then(() => {
    createWindow()
    makeTray();    
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
    makeTray();
  }
})
const fs = require('fs');
const {ipcRenderer} = require('electron');

let settingsData = fs.readFileSync('octowrap-settings.json')
let settings = JSON.parse(settingsData);

function setIP()
{
    settings.ip = document.getElementById("ip").value;
    saveSettings();

    ipcRenderer.send('restart')
}

function saveSettings()
{
    fs.writeFile('octowrap-settings.json', JSON.stringify(settings), function(err, result) {
        if(err) console.log('error', err);
      })
}
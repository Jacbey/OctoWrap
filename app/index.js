const fs = require('fs');

let settingsData = fs.readFileSync('octowrap-settings.json')
let settings = JSON.parse(settingsData);
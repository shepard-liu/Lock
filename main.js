const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const process = require('process');
const { ctrEncrypt, ctrDecrypt } = require('./aes/ctr');

//* States
const states = {
    transformedFilePaths: []
};

//* Utility

// Temporary directory
const tmpDir = getAppDataPath();

if (!fs.existsSync(tmpDir))
    fs.mkdirSync(tmpDir);

function getAppDataPath() {
    switch (process.platform) {
        case "darwin": {
            return path.join(process.env.HOME, "Library", "Application Support", "Lock");
        }
        case "win32": {
            return path.join(process.env.APPDATA, "Lock");
        }
        case "linux": {
            return path.join(process.env.HOME, ".Lock");
        }
        default: {
            console.log("Unsupported platform!");
            process.exit(1);
        }
    }
}

function resetTemp() {
    states.transformedFilePaths.forEach((path) => fs.unlinkSync(path));
    states.transformedFilePaths = [];
}

async function read(path) {
    return new Promise((resolve, reject) => {
        if (fs.lstatSync(path).isDirectory()) reject("Cannot read data from directory.");
        fs.readFile(path, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

async function write(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
            if (err) reject(err);
            resolve();
        })
    })
}

//* Drag and drop handler

ipcMain.handle('transform', async (event, password, filePaths, mode) => {
    resetTemp();

    let opFunc = null;
    if (mode === 'encrypt') opFunc = ctrEncrypt;
    else if (mode === 'decrypt') opFunc = ctrDecrypt;

    return new Promise((resolve, reject) => {
        let finishCount = 0;
        filePaths.forEach(async (filePath) => {
            try {
                const data = await read(filePath);
                const outPath = path.join(tmpDir, path.basename(filePath) + `.${mode}ed`);
                await write(outPath, opFunc(password, data));
                states.transformedFilePaths.push(outPath);
                ++finishCount;
                if (finishCount === filePaths.length)
                    resolve(states.transformedFilePaths.map(p => path.basename(p)));
            } catch (err) {
                reject(err);
            }
        })
    })
});

ipcMain.on('dragStart', (event) => {
    if (!states.transformedFilePaths.length) return;
    event.sender.startDrag({
        files: states.transformedFilePaths,
        icon: states.transformedFilePaths > 1 ? path.join(__dirname, '../assets/files.png') : path.join(__dirname, '../assets/file.png')
    });
})

//* Application Configurations

const createWindow = () => {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 600,
        maxHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
            // webSecurity: false
        }
    });

    //! Remove "/ui" in production mode
    window.loadFile(path.resolve(__dirname, './index.html'));
}

app.whenReady().then(() => {
    createWindow();

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') app.quit();
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    })
});

app.on('quit', () => { resetTemp(); })
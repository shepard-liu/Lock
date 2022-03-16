const { ipcRenderer } = require('electron');

window.electron = {
    transform: (password, filePaths, mode) => ipcRenderer.invoke('transform', password, filePaths, mode),
    startDrag: () => ipcRenderer.send('dragStart')
}
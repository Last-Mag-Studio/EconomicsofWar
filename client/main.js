const { app, BrowserWindow } = require('electron')

const createWindow = () => {
    const onlineStatusWindow = new BrowserWindow({
        width: 1920,
        height: 1080
    })

    onlineStatusWindow.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
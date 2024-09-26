import { app, BrowserWindow } from 'electron';
import path from 'path';
import { autoUpdater } from 'electron-updater'; // Importa autoUpdater

/** Handle creating/removing shortcuts on Windows when installing/uninstalling. */
if (require('electron-squirrel-startup')) {
  app.quit();
}

/**
 * Main window instance.
 */
let mainWindow: BrowserWindow | null;
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

/**
 * This method will be called when Electron has finished
 * initialization and is ready to create browser windows.
 * Some APIs can only be used after this event occurs.
 */
app.on('ready', () => {
  createMainWindow();
  autoUpdater.checkForUpdatesAndNotify(); // Verifica actualizaciones al iniciar
});

/**
 * Emitted when the application is activated. Various actions can
 * trigger this event, such as launching the application for the first time,
 * attempting to re-launch the application when it's already running,
 * or clicking on the application's dock or taskbar icon.
 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

/**
 * Emitted when all windows have been closed.
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Create main window
 * @returns {BrowserWindow} Main window instance
 */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 700,
    minWidth: 500,
    minHeight: 700,
    maxWidth: 500,
    maxHeight: 700,
    backgroundColor: '#202020',
    show: false,
    autoHideMenuBar: true,
    icon: path.resolve('assets/favicon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
    },
  });

  // Intentar cargar la URL del servidor de desarrollo
  console.log(MAIN_WINDOW_VITE_NAME)
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL).catch((error) => {
      console.error(
        'Error al cargar la URL del servidor de desarrollo:',
        error.message,
      );
      const backupPath = path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`,
      );
      mainWindow?.loadFile(backupPath).catch((fileError) => {
        console.error(
          'Error al cargar el archivo de respaldo:',
          fileError.message,
        );
      });
    });
  } else {
    const backupPath = path.join(
      __dirname,
      `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`,
    );
    mainWindow.loadFile(backupPath).catch((fileError) => {
      console.error(
        'Error al cargar el archivo de respaldo:',
        fileError.message,
      );
    });
  }

  // Mostrar la ventana cuando esté lista para mostrar
  mainWindow.on('ready-to-show', () => {
    if (mainWindow) mainWindow.show();
  });

  // Cierra todas las ventanas cuando la ventana principal se cierra
  mainWindow.on('close', () => {
    mainWindow = null;
    app.quit();
  });

  return mainWindow;
}

/**
 * Configurar eventos del autoUpdater
 */
autoUpdater.on('update-available', () => {
  console.log(
    'Actualización disponible: Se está descargando una nueva versión.',
  );
});

autoUpdater.on('update-downloaded', () => {
  console.log(
    'Actualización lista: La aplicación se actualizará en el próximo reinicio.',
  );
  autoUpdater.quitAndInstall();
});

autoUpdater.on('error', (error) => {
  console.error(
    `Error de actualización: ${
      error == null ? 'unknown' : (error.stack || error).toString()
    }`,
  );
});

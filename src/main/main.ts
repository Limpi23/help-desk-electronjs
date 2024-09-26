import { app, BrowserWindow } from 'electron';
import path from 'path';

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
app.on('ready', createMainWindow);

/**
 * Emitted when the application is activated. Various actions can
 * trigger this event, such as launching the application for the first time,
 * attempting to re-launch the application when it's already running,
 * or clicking on the application's dock or taskbar icon.
 */
app.on('activate', () => {
  /**
   * On macOS it's common to re-create a window in the app when the
   * dock icon is clicked and there are no other windows open.
   */
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

/**
 * Emitted when all windows have been closed.
 */
app.on('window-all-closed', () => {
  /**
   * On macOS it is common for applications and their menu bar
   * to stay active until the user quits explicitly with Cmd + Q
   */
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
    height: 600,
    minWidth: 500, // Define tamaño mínimo fijo para la ventana
    minHeight: 600,
    maxWidth: 500, // Define tamaño máximo fijo para evitar redimensionamientos
    maxHeight: 600,
    backgroundColor: '#202020',
    show: false,
    autoHideMenuBar: true,
    icon: path.resolve('assets/favicon.ico'), // Ruta del ícono de la aplicación
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
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL).catch((error) => {
      console.error(
        'Error al cargar la URL del servidor de desarrollo:',
        error.message,
      );

      // Si falla la carga de la URL, intenta cargar un archivo de respaldo
      const backupPath = path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`,
      );

      console.log('Intentando cargar el archivo de respaldo en:', backupPath);

      mainWindow?.loadFile(backupPath).catch((fileError) => {
        console.error(
          'Error al cargar el archivo de respaldo:',
          fileError.message,
        );
      });
    });
  } else {
    // Cargar el archivo de respaldo directamente si no se especifica la URL de desarrollo
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
 * In this file you can include the rest of your app's specific main process code.
 * You can also put them in separate files and import them here.
 */

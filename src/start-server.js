
const { spawn } = require('child_process');
const fs = require('fs'); // For logging

// ==================================================================================
// == महत्वपूर्ण: مسیر پوشه پروژه خود را در اینجا به درستی وارد کنید! ==
// == IMPORTANT: Replace the projectDir path below with the correct absolute path ==
// == to your project directory on the cPanel server.                      ==
// ==================================================================================
// مثال: const projectDir = '/home/your_cpanel_username/public_html/kalanow';
// Example: const projectDir = '/home/your_cpanel_username/public_html/kalanow';
const projectDir = '/home/YOUR_CPANEL_USERNAME/public_html/YOUR_PROJECT_FOLDER'; // <--- این مسیر را ویرایش کنید / EDIT THIS PATH

const logFile = `${projectDir}/startup-log.txt`; // Log file within project directory

function logMessage(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`, 'utf8');
  console.log(message); // Also log to cPanel's Node.js app logs
}

logMessage(`Starting start-server.js script at ${new Date().toLocaleString()}`);
logMessage(`Project directory set to: ${projectDir}`);
logMessage(`Attempting to read process.dev.yml to determine app name...`);

let appName = 'kalanow-dev'; // Default app name
try {
    const yaml = require('js-yaml');
    const processFile = fs.readFileSync(`${projectDir}/process.dev.yml`, 'utf8');
    const doc = yaml.load(processFile);
    if (doc && doc.apps && doc.apps[0] && doc.apps[0].name) {
        appName = doc.apps[0].name;
        logMessage(`App name from process.dev.yml: ${appName}`);
    } else {
        logMessage(`Could not read app name from process.dev.yml, using default: ${appName}`);
    }
} catch (e) {
    logMessage(`Error reading or parsing process.dev.yml: ${e.message}. Using default app name: ${appName}`);
}


logMessage(`Attempting to start Next.js dev server for '${appName}' using PM2...`);
logMessage(`Command: pm2 start npm --name ${appName} -- run dev`);
logMessage(`Working directory (cwd): ${projectDir}`);


const pm2Process = spawn('pm2', ['start', 'npm', '--name', appName, '--', 'run', 'dev'], {
  cwd: projectDir, // مسیر اجرایی دستور / Working directory for the command
  detached: true,  // فرآیند را از ترمینال جدا می‌کند / Detach the process from the terminal
  stdio: 'pipe',   // Capture stdio for logging
});

pm2Process.stdout.on('data', (data) => {
  logMessage(`PM2 STDOUT for ${appName}: ${data.toString().trim()}`);
});

pm2Process.stderr.on('data', (data) => {
  logMessage(`PM2 STDERR for ${appName}: ${data.toString().trim()}`);
});

// اطمینان از اینکه فرآیند والد منتظر این فرآیند نمی‌ماند
// Ensure the parent process doesn't wait for this child process
pm2Process.unref();

// بررسی خطا در هنگام ایجاد فرآیند PM2
// Check for errors during PM2 process spawning
pm2Process.on('error', (err) => {
  if (err.code === 'ENOENT') {
    logMessage(`********************************************************************************`);
    logMessage(`ERROR: The 'pm2' command was not found by the system.`);
    logMessage(`This usually means PM2 is not installed globally OR its installation path is not in the PATH environment variable for the Node.js application in cPanel.`);
    logMessage(``);
    logMessage(`To fix this:`);
    logMessage(`1. Connect to your cPanel server via SSH or use the cPanel Terminal.`);
    logMessage(`2. Install PM2 globally by running:`);
    logMessage(`   npm install pm2 -g`);
    logMessage(`3. After installation, try restarting the Node.js application from the cPanel interface.`);
    logMessage(`4. If the error persists, you may need to configure the PATH for your Node.js environment in cPanel to include the directory where global npm packages are installed (usually something like /home/YOUR_CPANEL_USERNAME/nodevenv/YOUR_NODE_VERSION/bin). Consult your hosting provider's documentation or support for this.`);
    logMessage(`********************************************************************************`);
  }
  logMessage(`Failed to start PM2 process for '${appName}' (raw error): ${err.message}\n${err.stack}`);
});

// بررسی خروج فرآیند PM2 (برای دیباگ)
// Check PM2 process exit (for debugging)
pm2Process.on('exit', (code, signal) => {
  if (code !== 0) {
    logMessage(`PM2 process for '${appName}' exited with code ${code} and signal ${signal}. This might indicate an issue with starting the app via PM2.`);
  } else {
    logMessage(`PM2 process for '${appName}' initiated successfully.`);
  }
});

// این پیام بلافاصله پس از شروع اجرای اسکریپت نمایش داده می‌شود
// This message is displayed immediately after the script starts executing
logMessage(`Node.js script 'start-server.js' has finished attempting to start PM2 for '${appName}'.`);
logMessage(`Check PM2 logs ('pm2 logs ${appName}') and the cPanel Node.js app logs for further details.`);
logMessage(`If the app doesn't start, review 'startup-log.txt' in your project root and the cPanel logs for errors.`);

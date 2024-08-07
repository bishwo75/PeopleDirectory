const fs = require('fs-extra');
const { exec } = require('child_process');
const path = require('path');

async function clean() {
  try {
    if (fs.existsSync('dist')) {
      await fs.remove('dist');
    }
  } catch (err) {
    console.error('Error cleaning dist directory:', err);
  }
}

async function buildServer() {
  try {
    await clean();
    await fs.mkdir('dist');
    await fs.copy(path.join('framework', 'mock-server', 'mockServiceWorker.js'), path.join('dist', 'mockServiceWorker.js'));

    exec('esbuild ./framework/server/index.js --bundle --minify --platform=node --outfile=dist/server.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
      console.log(`Stdout: ${stdout}`);
    });
  } catch (err) {
    console.error('Error building server:', err);
  }
}

async function buildClient() {
  exec('esbuild ./framework/client/index.js --bundle --minify --platform=browser --outfile=dist/client.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(`Stdout: ${stdout}`);
  });
}

const buildTarget = process.argv[2];
if (buildTarget === 'server') {
  buildServer();
} else if (buildTarget === 'client') {
  buildClient();
} else if (buildTarget === 'clean') {
  clean();
} else {
  buildServer().then(buildClient);
}

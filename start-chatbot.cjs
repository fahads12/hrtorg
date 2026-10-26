// Run the bundled chatbot; credentials remain in its ignored .env.local file.
const fs = require('node:fs'), path = require('node:path'), {spawn} = require('node:child_process');
const directory = path.resolve(process.env.HRT_GUIDE_DIR || path.join(__dirname, 'chatbot'));
if (!fs.existsSync(path.join(directory, 'server/index.js'))) {
  console.error('HRT chatbot not found. Set HRT_GUIDE_DIR to its project folder.'); process.exit(1);
}
const port = Number(process.env.HRT_GUIDE_PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('Invalid HRT_GUIDE_PORT');
const child = spawn(process.execPath, ['--use-system-ca', '--env-file-if-exists=' + path.join(directory, '.env.local'), path.join(directory, 'server/index.js')], {
  cwd: directory, stdio: 'inherit', windowsHide: true,
  env: {...process.env, HOST:'127.0.0.1', PORT:String(port), APP_ORIGIN:`http://127.0.0.1:${port}`, SYNC_INTERVAL_HOURS:'0',
    WIDGET_ORIGINS: process.env.HRT_GUIDE_WIDGET_ORIGINS || 'http://localhost:8001,http://127.0.0.1:8001,http://localhost:8000,http://127.0.0.1:8000,https://hrt.org,https://store.hrt.org'}
});
child.on('error', () => { console.error('Could not start the HRT chatbot service.'); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code || 0; });
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => { child.kill(signal); });

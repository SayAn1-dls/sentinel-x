/* Runtime launcher: production -> `next start`, otherwise -> `next dev` (preview hot reload). */
const { spawn } = require('child_process');

const prod = process.env.NODE_ENV === 'production';
const port = process.env.PORT || '3000';
const nextBin = require.resolve('next/dist/bin/next');

const child = spawn('node', [nextBin, prod ? 'start' : 'dev', '-H', '0.0.0.0', '-p', port], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', code => process.exit(code === null ? 0 : code));
['SIGTERM', 'SIGINT'].forEach(sig => process.on(sig, () => child.kill(sig)));

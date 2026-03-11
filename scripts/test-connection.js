const net = require('net');
require('dotenv').config();

const host = process.env.DB_HOST || '8.133.21.62';
const port = parseInt(process.env.DB_PORT || '3306', 10);

console.log(`Testing TCP connection to ${host}:${port}...`);

const socket = new net.Socket();

socket.setTimeout(5000); // 5s timeout

socket.on('connect', () => {
  console.log(`✅ Success! Connection to ${host}:${port} established.`);
  socket.destroy();
});

socket.on('timeout', () => {
  console.log(`❌ Timeout! Could not connect to ${host}:${port} within 5 seconds.`);
  socket.destroy();
});

socket.on('error', (err) => {
  console.log(`❌ Connection Failed! Error: ${err.message}`);
  if (err.code === 'ECONNREFUSED') {
    console.log('   -> This means the server is actively refusing the connection.');
    console.log('   -> Possible causes:');
    console.log('      1. MySQL service is NOT running on the server.');
    console.log('      2. MySQL is running but listening on localhost only (bind-address=127.0.0.1).');
    console.log('      3. Firewall is blocking the port.');
  }
});

socket.connect(port, host);

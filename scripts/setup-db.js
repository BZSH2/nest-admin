const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  const connectionConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  };

  console.log(`Connecting to MySQL at ${connectionConfig.host}:${connectionConfig.port} as ${connectionConfig.user}...`);

  try {
    const connection = await mysql.createConnection(connectionConfig);
    console.log('Connected to MySQL server successfully.');

    const dbName = process.env.DB_DATABASE || 'nest_admin';
    console.log(`Checking if database "${dbName}" exists...`);

    const [rows] = await connection.query(`SHOW DATABASES LIKE '${dbName}'`);

    if (rows.length === 0) {
      console.log(`Database "${dbName}" does not exist. Attempting to create it...`);
      try {
        await connection.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`Database "${dbName}" created successfully!`);
      } catch (err) {
        console.error(`Failed to create database "${dbName}". Error: ${err.message}`);
        console.error('Please ensure the user has CREATE DATABASE privileges or create the database manually.');
      }
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }

    await connection.end();
  } catch (err) {
    console.error('Failed to connect to MySQL server.');
    console.error(`Error: ${err.message}`);

    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Check your username and password.');
    }
  }
}

setupDatabase();

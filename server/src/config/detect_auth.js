import mysql from 'mysql2/promise';

const candidates = ['', 'root', '1234', '123456', '12345678', 'admin', 'mysql', 'password', 'arund', 'Arund@123'];

async function testPasswords() {
  console.log('Testing MySQL passwords...');
  for (const pw of candidates) {
    try {
      const conn = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: pw
      });
      console.log(`>>> SUCCESS with password: "${pw}"`);
      await conn.end();
      return pw;
    } catch (err) {
      // ignore and try next
    }
  }
  console.log('No candidate password matched.');
  return null;
}

testPasswords();

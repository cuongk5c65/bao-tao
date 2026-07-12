const Database = require('better-sqlite3');
const db = new Database('/Users/cuongqnm/Desktop/App Khách/Bảo Táo/backend/.tmp/data.db');

try {
  const versions = db.prepare("SELECT * FROM versions").all();
  const fs = require('fs');
  fs.writeFileSync('versions_dump.json', JSON.stringify(versions, null, 2));
  console.log("Dumped", versions.length, "versions to versions_dump.json");
} catch (e) {
  console.error(e);
} finally {
  db.close();
}

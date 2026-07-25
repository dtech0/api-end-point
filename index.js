const sqlite3=require('sqlite3').verbose()
const express = require('express');
const db=new sqlite3.Database('task.db')

db.serialize(() => {
    db.run (`
       CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0
    )
  `);

db.get('SELECT COUNT(*) AS count FROM tasks', (err, row) => {
    if (err) {
      console.error(err.message);
      return;
    }
if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
      stmt.run('Buy groceries', 0);
      stmt.run('Read SQLite docs', 0);
      stmt.run('Complete Stage 0', 1);
      stmt.finalize();
      console.log('Seeded 3 initial tasks successfully!');
    }
  });
});

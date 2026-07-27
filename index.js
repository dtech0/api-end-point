const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());
const port=3000;

// Stage 0: Create & Open Database
const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) console.error('Database opening error:', err.message);
  else console.log('Connected to SQLite database: tasks.db');
});

// Stage 0: Create Table & Seed Data
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER DEFAULT 0
    )
  `);

  db.get('SELECT COUNT(*) AS count FROM tasks', [], (err, row) => {
    if (err) return console.error(err.message);

    if (row.count === 0) {
      const stmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
      stmt.run('Learn SQLite', 0);
      stmt.run('Connect CRUD to DB', 0);
      stmt.run('Complete Assignment 2', 0);
      stmt.finalize();
      console.log('Seeded 3 initial tasks.');
    }
  });
});


// Stage 1: Get All Tasks 
app.get('/tasks',  (req, res)=> {
  db.all("SELECT * FROM tasks", [], (err, rows)=> {
    if (err) {
     return res.status(500).json({ error: err.message });
      
    }

    let formattedTasks = [];

    for (let i = 0; i < rows.length; i++) {
      let currentTask = rows[i];

      let taskObject = {
        id: currentTask.id,
        title: currentTask.title,
        done:Boolean(currentTask.done)
      };

      formattedTasks.push(taskObject);
    }

    res.json(formattedTasks);
  });
});

// Stage 2: Get Single Task by ID 
app.get('/tasks/:id', (req, res)=> {
  let taskId = req.params.id;

  db.get("SELECT * FROM tasks WHERE id = ?", [taskId],(err, row)=> {
    if (err) {
     return res.status(500).json({ error: err.message });
      
    }

    if (!row) {
    return  res.status(404).json({ error: "Task not found" });
      
    }

    

    res.json({
      id: row.id,
      title: row.title,
      done: Boolean(row.done)
    });
  });
});


// Stage 3: Create New Task 
app.post('/tasks', (req, res) =>{
  let title = req.body.title;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
   
  }

  let cleanTitle = title.trim();
  let sql = "INSERT INTO tasks (title, done) VALUES (?, 0)";

  db.run(sql, [cleanTitle], (err)=> {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    res.status(201).json({
      id: this.lastID,
      title: cleanTitle,
      done: false
    });
  });
});


// Stage 3: Update Task 
app.put('/tasks/:id', (req, res)=> {
  let taskId = req.params.id;
  let title = req.body.title;
  let done = req.body.done;

  if (title === undefined || done === undefined || title.trim() === "") {
    res.status(400).json({ error: "Title and done are required" });
    return;
  }

  db.get("SELECT * FROM tasks WHERE id = ?", [taskId], (err, row)=> {
    if (err) {
     return res.status(500).json({ error: err.message });
      
    }

    if (!row) {
      return res.status(404).json({ error: "Task not found" });
    }

    let doneAsNumber = Number(done);
    

    let sql = "UPDATE tasks SET title = ?, done = ? WHERE id = ?";
    db.run(sql, [title.trim(), doneAsNumber, taskId], (err)=> {
      if (err) {
        res.status(500).json({ error: err.message });
        ;
      }

      res.json({
        id: Number(taskId),
        title: title.trim(),
        done: Boolean(doneAsNumber)
      });
    });
  });
});

// Stage 4: Delete Task 
app.delete('/tasks/:id',(req, res)=> {
  let taskId = req.params.id;

  let sql = "DELETE FROM tasks WHERE id = ?";
  db.run(sql, [taskId],  (err) =>{
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.status(204).send();
  });
});

// Server Listen
app.listen(3000, () => console.log(`server running on http://localhost:${port}`));return
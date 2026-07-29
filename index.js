const express = require('express');
require ('dotenv').config()
const {Pool}= require('pg')

const app = express();
app.use(express.json());
const port=process.env.PORT ||3000;
const pool=new Pool({
  connectionString: process.env.DATABASE_URL,
})
// Stage 0: Create & Open Database
async function initdb() {
  try{
  await pool.query(`
   create table if not exists tasks(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    done BOOLEAN DEFAULT FALSE
    )`);
  


 const checkRes = await pool.query('SELECT COUNT(*) FROM tasks');
    const count = parseInt(checkRes.rows[0].count, 10);

    if (count === 0) {
      await pool.query(`
        INSERT INTO tasks (title, done) VALUES
        ('Learn Docker & Postgres', false),
        ('Connect Express to Postgres', false),
        ('Complete Assignment 3', false)
      `);
      console.log('Seeded 3 initial tasks into Postgres.');
    } else {
      console.log(`Database connected. Existing task count: ${count}`);
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}


//read from postgres

app.get('/tasks', async(req, res)=> {
  try{
  const result=await pool.query("SELECT * FROM tasks  ORDER BY id ASC");
  const rows = result.rows;

    let formattedTasks = [];
    for (let i = 0; i < rows.length; i++) {
      let currentTask = rows[i];

      let taskObject = {
        id: currentTask.id,
        title: currentTask.title,
        done:currentTask.done
      };

      formattedTasks.push(taskObject);
    }

    res.json(formattedTasks);
  }
  catch(err){
    res.status(500).json({ error: err.message });
  }


});

//  Get Single Task by ID 
app.get('/tasks/:id',async (req, res)=> {
  try {
  let taskId = req.params.id;

  const result=await pool.query("SELECT * FROM tasks WHERE id = $1", [taskId])

    if (result.rows.length===0) {
    return  res.status(404).json({ error: "Task not found" });
      
    }

    res.json({
      id: result.row[0].id,
      title: result.row[0].title,
      done: result.row[0].done
    });
  }
  catch(err){
    res.status(500).json({ error : err.message })
  }
  });

//full crud on postgres


//  Create New Task 
app.post('/tasks', async(req, res) =>{
  try{
  let title = req.body.title;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
   
  }

  let cleanTitle = title.trim();
  let sql = 
  `
  INSERT INTO tasks (title, done)
   VALUES ($1,$2) 
   RETURNING *
   `;


  const result=await pool.query(sql, [cleanTitle,false])

      res.status(201).json(result.rows[0]);
}
catch(err){
  res.status(500).json({ error: err.message });
}
});




// Update Task 
app.put('/tasks/:id', async(req, res)=> {
  try{
  const taskId = req.params.id;
  const title = req.body.title;
  const done = req.body.done;

  if (title === undefined || done === undefined || title.trim() === "") {
    res.status(400).json({ error: "Title and done are required" });
    return;
  }

  const result=await pool.query(`
   UPDATE tasks
   SET title = $1, done = $2
   WHERE id = $3
   RETURNING *`,[title.trim(), Boolean(done), taskId])
    

    if (result.rows.length===0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  }catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete Task 
app.delete('/tasks/:id',async(req, res)=> {
  try{
  let taskId = req.params.id;

  const result=await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [taskId])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(204).send();
}
catch(err){
  res.status(500).json({ error: err.message });
}  
});






// Server Listen
initdb().then(()=>{
  app.listen(port, () => console.log(`server running on http://localhost:${port}`));
})

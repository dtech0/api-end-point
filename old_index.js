const express=require('express')
const swaggerUi=require('swagger-ui-express')
const bodyparser=require('body-parser')
const app=express()
const port=3000
app.use(bodyparser.json())

let tasks=[
   { id: 1, title: "Learn CRUD", done: false },
    { id: 2, title: "Build first API", done: false },
    { id: 3, title: "Push to GitHub", done: true }
]

//root endpoint
app.get('/',(req,res)=>{
    res.json({
        name:"task api",
        version:"1.0.0",
        endpoint:["/tasks"]
    })
})
//health check
app.get('/health',(req,res)=>{
    res.json({
        status:"ok"
    })
})
//get all tasks
app.get('/tasks',(req,res)=>{
    res.json(tasks)
})

// GET /tasks/:id
app.get('/tasks/:id',(req,res)=>{
    const taskId=parseInt(req.params.id)
    const task=tasks.find(t=> t.id === taskId)
    if(!task){
        return res.status(404).json({erros:`tasks ${taskId} id not found`})
    }
    res.json(task)
})

//post tasks api
app.post('/tasks',(req,res)=>{
    const title=req.body.title
    if(!title || typeof title!=='string' || title.trim()===" ")
        return res.status(400).json({error:"please add title"})
    const newId=tasks.length+1
    const newTask={
        id:newId,
        title:title.trim(),
        done:true
    };
    tasks.push(newTask)
    res.status(201).json(newTask)
})

//update task
app.put('/tasks/:id',(req,res)=>{
    const id=parseInt(req.params.id)
    const taskIndex=tasks.findIndex(t=>t.id===id)
    if(taskIndex==-1){
        return res.status(404).json({error:`Task id ${id} not found`})
    }
    const{title,done}=req.body
     if(title!==undefined &&( typeof title!=='string' || title.trim()===" "))
        return res.status(400).json({error:"title cant be empty"})

    if (title === undefined && done === undefined) {
        return res.status(400).json({ error: "title and done status is required" });
    }
    if (title!==undefined){
        tasks[taskIndex].title=title.trim()

    }
    if(done!==undefined){
      tasks[taskIndex].done=Boolean(done)
    }
    return res.status(200).json(tasks[taskIndex])
})


//delete api
app.delete('/tasks/:id',(req,res)=>{
    const id=parseInt(req.params.body)
    const Index=tasks.findIndex(t=>t.id === id)
    if (Index===-1){
        return res.status(404).json({error:`Task id ${id}not found`})
    }
    tasks.splice(Index,1)
    return res.status(204).send()
})
//swagger api endpoint

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Task Management API",
    version: "1.0.0",
    description: "FlyRank Internship - Week 2 Task API"
  },
  paths: {
    "/": {
      get: {
        summary: "API Information",
        responses: { "200": { description: "OK" } }
      }
    },
    "/health": {
      get: {
        summary: "Check Server Health",
        responses: { "200": { description: "OK" } }
      }
    },
    "/tasks": {
      get: {
        summary: "Get all tasks",
        responses: { "200": { description: "List of all tasks" } }
      },
      post: {
        summary: "Create a new task",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", example: "submit Assignment" }
                }
              }
            }
          }
        },
        responses: {
          "201": { description: "Task created successfully" },
          "400": { description: "Bad Request - Title is required" }
        }
      }
    },
    "/tasks/{id}": {
      get: {
        summary: "Get a single task by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }
        ],
        responses: {
          "200": { description: "Task found" },
          "404": { description: "Task not found" }
        }
      },
      put: {
        summary: "Update an existing task",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Updated task title" },
                  done: { type: "boolean", example: true }
                }
              }
            }
          }
        },
        responses: {
          "200": { description: "Task updated successfully" },
          "400": { description: "Invalid input" },
          "404": { description: "Task not found" }
        }
      },
      delete: {
        summary: "Delete a task by ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer" }, example: 1 }
        ],
        responses: {
          "204": { description: "Task deleted successfully" },
          "404": { description: "Task not found" }
        }
      }
    }
  }
};

// Swagger Docs Route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/docs',swaggerUi.serve,swaggerUi.setup(swaggerDocument))
//start server
app.listen(port,()=>{
    console.log(`start the server http://localhost:${port}`)
})
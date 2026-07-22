const express=require('express')
const swaggerUi=require('swagger-Ui-express')
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

//start server
app.listen(port,()=>{
    console.log(`start the server http://localhost:${port}`)
})
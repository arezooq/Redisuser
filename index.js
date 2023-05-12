import express from 'express'
import { engine } from 'express-handlebars'
import path from 'path'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import { createClient } from 'redis'
import { config } from 'dotenv'
import e from 'express'


config()

// Create Redis Client

const client = createClient();

client.on('connect', () => console.log('Redis Client connected...'));

await client.connect();


// Set Port
const port = 4000
 
// Init app
const app = express()

// view Engine
app.engine('handlebars', engine({defaultLayout:'main'}))
app.set('view engine', 'handlebars')

// body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(methodOverride('_method'))

// Search Page
app.get('/', (req, res, next) => {
    res.render('searchusers')
})

// Search Proccessing
app.post('/user/search', (req, res, next) => {
    let id = req.body.id

    client.HGETALL(id, (err, obj) => {
        console.log('hiiii')
        if(err){
            res.render('searchusers', {
                error:"User does not found"
            })
        } else {
            obj.id = id
            res.render('details', {
                user: obj
            })
        }
    })
})


// Add User Page
app.get('/user/add', (req, res, next) => {
    res.render('adduser')
})

// Proccessing Add User Page
app.post('/user/add', (req, res, next) => {
    let id = req.body.id
    let first_name = req.body.firstName
    let last_name = req.body.lastName
    let email = req.body.email
    let phone = req.body.phone

    client.hSet(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email,
        'phone', phone
    ], (err, reply) => {
        if(err){
            console.log(err)
        }
        else{
            console.log(reply)
            res.render('/')
        }
    })

})

// delete user by id
app.delete('/user/delete/:id', (req, res, next) => {
    client.del(req.params.id)
    res.redirect('/')
})

app.listen(port, () => console.log(`Server is running on port ${port}`))
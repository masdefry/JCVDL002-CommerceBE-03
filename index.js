const express = require('express')
const cors = require('cors')
const mysql = require('mysql')

const PORT = 2003
const app = express()

app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'password',
    database : '3_warehouse',
    port : 3306,
    multipleStatements : true
})

db.connect((err) =>{
    if (err) {
        return console.error(`error : ${err.message}`)
    }
    console.log(`Connected to MySQL Server`)
})

app.get('/',(req,res) => {
    res.status(200).send("<h4> Integrated mysql with express </h4>")
})

app.get('/product' ,(req,res) => {
    let scriptQuery = `Select id,product_name,product_price,detail_product from 3_warehouse.product;`
    db.query(scriptQuery, (err,results) => {
        if(err) res.status(500).send(err)
        res.status(200).send(results)
    })
})

app.listen(PORT,() => console.log('Api running : ',PORT));
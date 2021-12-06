const { db } = require('../Database/Connection')

module.exports = {
    getData: (req, res) => {
        let scriptQuery = `Select * from product;`
        if (req.query.product_name){
            scriptQuery = `Select * from product where product_name = ${db.escape(req.query.product_name)}`
        }
        db.query(scriptQuery, (err, result) => {
            if (err) res.status(500).send(err)
            res.status(200).send(result)
        })
    },

    addData:(req, res) => {
        let {id, product_name, product_price, category_id, gender_id, stock, detail_product } = req.body
        let insertQuery = `Insert into product values (null,${db.escape(product_name)},${db.escape(product_price)},${db.escape(category_id)}${db.escape(gender_id)},${db.escape(stock)},${db.escape(detail_product)})`
        db.query(insertQuery,(err,results)=>{
            if(err)res.status(500).send(err)

            db.query(`Select * from product where product_name = ${product_name}`, (err, results2))
                if(err2)res.status(500).send(err2)
                res.status(200).send({message: 'Penambahan Produk Berhasil', data: results2 })
        })
    },

    editData: (req, res) => {
        let dataUpdate = []
        for (let prop in req.body) {
            dataUpdate.push(`${prop} = ${db.escape(req.body[prop])}`)
        }
        let updateQuery = `UPDATE product set ${dataUpdate} where id = ${req.params.id}`
        db.query(updateQuery, (err, results)=>{
            if(err)req.status(500).send(err)
            res.status(200).send(results)
        })
    },

    deleteData:(req, res) => {
        let deleteQuery = `DELETE from product where id = ${db.escape(req.params.id)}`

        db.query(deleteQuery, (err, results) => {
            if(err)res.status(500).send(err)
            res.status(200).send(results)
        })
    },
};
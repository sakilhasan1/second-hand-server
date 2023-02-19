const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('colors')
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const ObjectId = require('mongodb').ObjectId;


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.stybsc2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const categoryCollection = client.db('SecondhandDb').collection('categories')
const phoneCollection = client.db('SecondhandDb').collection('phones')
const orderCollection = client.db('SecondhandDb').collection('orders')

app.get('/categories', async (req, res) => {
    try {
        const categories = await categoryCollection.find({}).toArray();
        res.send(categories)
    } catch (error) {
        console.log(error)
    }
})

app.get('/phones/:brand', async (req, res) => {
    try {
        const brand = req.params.brand
        const query = { brand: brand }
        const phones = await phoneCollection.find(query).toArray();
        res.send(phones)
    } catch (error) {
        console.log(error)
    }
})

app.post('/orders', async (req, res) => {
    try {
        const orderData = req.body
        const result = await orderCollection.insertOne(orderData);
        res.send(result)
    } catch (error) {
        console.log(error);
    }

})
app.get('/orders', async (req, res) => {
    try {
        const email = req.query.email;
        const query = { email: email }
        const orders = await orderCollection.find(query).toArray();
        res.send(orders)
    } catch (error) {
        console.log(error);
    }

})

app.delete('/orders/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const filter = { _id: new ObjectId(id) }
        const result = await orderCollection.deleteOne(filter);
        res.send(result)
    } catch (error) {
        console.log(error);
    }

})

app.post('/add', async (req, res) => {
    try {
        const orderData = req.body
        const result = await phoneCollection.insertOne(orderData);
        res.send(result)
    } catch (error) {
        console.log(error);
    }

})



app.get('/addSpecialty', async (req, res) => {
    const query = {};
    const result = await categoryCollection.find(query).project({ brand: 1 }).toArray()
    res.send(result)
})

app.get('/allSeller', async (req, res) => {
    const query = {};
    const result = await phoneCollection.find(query).toArray()
    res.send(result)
})

app.delete('/sellerDelete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const result = await phoneCollection.deleteOne(filter);
        res.send(result)
    } catch (error) {
        console.log(error);
    }

})

app.get('/allBuyer', async (req, res) => {
    const query = {};
    const result = await orderCollection.find(query).toArray()
    res.send(result)
})

app.delete('/buyerDelete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const result = await orderCollection.deleteOne(filter);
        res.send(result)
    } catch (error) {
        console.log(error);
    }

})

app.get('/', (req, res) => {
    res.send('second hand server is running')
})

app.listen(port, () => {
    console.log('second hand server is running on'.cyan.bold, port);
})
const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('colors')
var jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
// const ObjectId = require('mongodb').ObjectId;


app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.stybsc2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unAuthorized access')
    }
    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'forbidden access' })
        }

        req.decoded = decoded;
        next()
    })

}

const categoryCollection = client.db('SecondhandDb').collection('categories')
const phoneCollection = client.db('SecondhandDb').collection('phones')
const orderCollection = client.db('SecondhandDb').collection('orders')
const paymentCollection = client.db('SecondhandDb').collection('payments')
const userCollection = client.db('SecondhandDb').collection('users')

app.post('/create-payment-intent', async (req, res) => {
    const order = req.body;
    const price = order.price;
    const amount = price * 100;

    const paymentIntent = await stripe.paymentIntents.create({
        currency: 'usd',
        amount: amount,
        "payment_method_types": [
            "card"
        ]
    })

    res.send({
        clientSecret: paymentIntent.client_secret,
    })
})

app.post('/payments', async (req, res) => {
    const payment = req.body;
    const result = await paymentCollection.insertOne(payment);
    const id = payment.bookingId;
    const filter = { _id: ObjectId(id) }
    const updatedDoc = {
        $set: {
            paid: true,
            transactionId: payment.transactionId
        }
    }
    const updateResult = await orderCollection.updateOne(filter, updatedDoc)
    res.send(result)
})

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


app.get('/jwt', async (req, res) => {
    const email = req.query.email;
    const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
    return res.send({ accessToken: token })

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
app.get('/orders/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const result = await orderCollection.findOne(filter);
        res.send(result)
    } catch (error) {
        console.log(error);
    }

})

app.get('/orders', verifyJWT, async (req, res) => {
    try {
        const email = req.query.email;
        const decodedEmail = req.decoded.email;
        if (decodedEmail !== email) {
            return res.status(401).send({ message: 'forbidden access' })
        }
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

app.post('/users', async (req, res) => {
    const user = req.body;
    const result = await userCollection.insertOne(user);
    res.send(result)
})

app.get('/users', async (req, res) => {
    const result = await userCollection.find({}).toArray();
    res.send(result)
})

app.put('/users/admin/:id', async (req, res) => {

    const id = req.params.id;
    const filter = { _id: new ObjectId(id) }
    const options = { upsert: true };
    const updatedDoc = {
        $set: {
            role: 'admin'
        }
    }
    const result = await userCollection.updateOne(filter, updatedDoc, options)
    res.send(result)
})

app.get('/users/:email', async (req, res) => {
    try {
        const email = req.params.email;
        console.log(email);
        const query = { email: email }
        const user = await userCollection.findOne(query);
        res.send({
            isAdmin: user?.role === 'admin'
        })
    } catch (error) {
        console.log(error);
    }


})

app.delete('/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const result = await userCollection.deleteOne(filter);
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
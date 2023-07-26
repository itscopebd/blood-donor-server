const express = require("express");
const app = express();
require('dotenv').config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;



// middle ware 
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Ropirq")
})

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@cluster0.loltiyt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const users = client.db("blood-donor").collection("users");
        const donations = client.db("blood-donor").collection("donations");

        app.post("/users", async (req, res) => {
            const data = req.body;
            const result = await users.insertOne(data);
            res.send(result)
        })
        // // get user data 
        // app.get("/users/:email", async (req, res) => {

        //     const data = req.params.email;
        //     console.log(data)
        //     const query = { email: data }
        //     const result = await users.findOne(query)
        //     res.send(result)
        // })


        // donations
        app.post("/addDonations", async (req, res) => {
            const data = req.body;

            let query = {};
            if (req.query.email) {
                query = { email: req.query.email };
            }
            const isDonation = await donations.findOne(query);
            if (isDonation) {
                return res.send({ message: "Donar Already Registretion! " })
            } else {
                const result = await donations.insertOne(data)
                res.send(result)
            }
        })


        // check user role 

        app.get("/userCheck", async (req, res) => {
            // const email = req.query.email;

            let query = {}
            if (req.query.email) {
                query = { email: req.query.email }

            }
            
            const result = await users.findOne(query);


            if (result?.role === "admin") {
                return res.send({ role: "admin" })
            }
            else if (result?.role === "author") {
                return res.send({ role: "author" })
            }
            else {
                return res.send({ role: "user" })
            }
        })


        // users api 


        app.get("/users", async (req, res) => {

            const value = users.find({
                $nor: [
                    {
                        role: { $in: ['admin', "author"] }
                    }
                ]
            })

            if (!value) {
                return res.send({ message: "User is Not Found ! " })

            }

            const result = await value.toArray();
            res.send(result)


        })




        // Connect the client to the server	(optional starting in v4.7)
        client.connect();
        // Send a ping to confirm a successful connection
        client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log("Running......")
})
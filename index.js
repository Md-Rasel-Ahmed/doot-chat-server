const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT_KEY || 5000;
// midleware
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = require("socket.io")(server);
global.io = io;

const uri =
  "mongodb+srv://mongodbUser:hSMFLPo6zrAqzr8w@cluster0.6plls.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const dootChatUserCollections = client.db("Doot_Chat").collection("users");
    const dootChatConversationsCollections = client
      .db("Doot_Chat")
      .collection("conversations");
    const dootChatMessagesCollections = client
      .db("Doot_Chat")
      .collection("messages");

    //   get the all users
    app.get("/users", async (req, res) => {
      const query = {};
      const cursor = dootChatUserCollections.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // Post user all orders
    app.post("/users", async (req, res) => {
      let user = req.body;
      const result = await dootChatUserCollections.insertOne(user);
      res.send(result);
    });

    // get converstaions
    app.get("/conversations", async (req, res) => {
      const query = {};
      const cursor = dootChatConversationsCollections.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // post conversations
    app.post("/conversations", async (req, res) => {
      let user = req.body;
      const result = await dootChatConversationsCollections.insertOne(user);

      res.send(result);
    });

    // update converstaions
    app.put("/conversations/:id", async (req, res) => {
      const { id } = req.params;
      const filter = { id: id };
      const updateDoc = {
        $set: { message: req.body.message },
      };
      const result = await dootChatConversationsCollections.updateOne(
        filter,
        updateDoc
      );
      io.emit("conversation", {
        data: "Hello",
      });
      res.send(result);
    });

    //   get the single messages
    app.get("/conversations/:id", async (req, res) => {
      const { id } = req.params;
      const query = { id: id };
      const result = await dootChatConversationsCollections.findOne(query);

      res.send(result);
    });

    // get Messages
    app.get("/messages/:id", async (req, res) => {
      const { id } = req.params;
      const query = { id: id };
      const cursor = dootChatMessagesCollections.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // post Messages
    app.post("/messages", async (req, res) => {
      let message = req.body;
      const result = await dootChatMessagesCollections.insertOne(message);
      res.send(result);
    });
    // Delete single message for login user Messages
    app.delete("/messages/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const result = await dootChatMessagesCollections.deleteOne(query);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

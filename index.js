import express from "express";
import "dotenv/config";
import cors from "cors";
const app = express();
const port = process.env.PORT || 3000;
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(cors());
app.use(express.json());

async function run() {
  try {
    await client.connect();
    const db = client.db("campusDB");
    const classesCollection = db.collection("classes");
    const transactionsCollection = db.collection("transactions");

    const apiResponse = (success, data = null, error = null) => {
      return { success, data, error };
    };

    // classes section
    app.get("/api/classes", async (req, res) => {
      try {
        const classes = await db.collection("classes").find({}).toArray();
        res.json(apiResponse(true, classes));
      } catch (error) {
        res.status(500).json(apiResponse(false, null, error.message));
      }
    });

    app.post("/api/classes", async (req, res) => {
      try {
        const {
          subject,
          instructor,
          dayOfWeek,
          startTime,
          endTime,
          color,
          notes,
        } = req.body;
        if (!subject || !instructor || !dayOfWeek || !startTime || !endTime) {
          return res
            .status(400)
            .json(apiResponse(false, null, "Missing required fields"));
        }
        const result = await classesCollection.insertOne({
          subject,
          instructor,
          dayOfWeek,
          startTime,
          endTime,
          color: color || "#0046FF",
          notes: notes || "",
          createdAt: new Date(),
        });
        res
          .status(201)
          .json(apiResponse(true, { insertedId: result.insertedId }));
      } catch (error) {
        res.status(500).json(apiResponse(false, null, error.message));
      }
    });

    app.put("/api/classes/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { subject, instructor, dayOfWeek, startTime, endTime, notes } =
          req.body;

        if (!ObjectId.isValid(id)) {
          return res
            .status(400)
            .json(apiResponse(false, null, "Invalid ID format"));
        }
        const result = await classesCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              subject,
              instructor,
              dayOfWeek,
              startTime,
              endTime,
              notes,
              updatedAt: new Date(),
            },
          }
        );
        if (result.matchedCount === 0) {
          return res
            .status(404)
            .json(apiResponse(false, null, "class not found"));
        }
        res.json(apiResponse(true, { modifiedCount: result.modifiedCount }));
      } catch (error) {
        res.status(500).json(apiResponse(false, null, error.message));
      }
    });

    app.delete("/api/classes/:id", async (req, res) => {
      try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) {
          return res
            .status(404)
            .json(apiResponse(false, null, "invalid id format"));
        }
        const result = await classesCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res
            .status(404)
            .json(apiResponse(false, null, "class not found for delete"));
        }
        res.json(apiResponse(true, { deletedCount: result.deletedCount }));
      } catch (error) {
        res.status(500).json(apiResponse(false, null, error.message));
      }
    });
    // Transactions api
    app.get("/api/transactions", async (req, res) => {
      try {
        const { month } = req.query;
        let query = {};
        if (month) {
          const startDate = new Date(month);
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1);
          query = {
            date: {
              $gte: startDate,
              $lt: endDate,
            }
          };
        }
        const transactions = await transactionsCollection('transactions').find(query).toArray();
        res.json(apiResponse(true, transactions))
      } catch (error) {
        res.status(500).json(apiResponse(false, null, error.message))
      }
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("campus server is running");
});
app.listen(port, () => {
  console.log(`Our server running on ${port}`);
});

const { MongoClient } = require("mongodb");

let cachedClient = globalThis.__mongoClient;
let cachedDb = globalThis.__mongoDb;

async function getDb() {
  if (cachedClient && cachedDb) return cachedDb;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is missing");
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();

  cachedClient = client;
  cachedDb = client.db(process.env.MONGODB_DB || "game");

  globalThis.__mongoClient = client;
  globalThis.__mongoDb = cachedDb;

  return cachedDb;
}

function send(res, status, data) {
  res.status(status).json(data);
}

module.exports = async function handler(req, res) {
  // CORS: useful when your API is called from a separate HTML project.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const db = await getDb();

    // Health check
    if (req.method === "GET" && req.url.split("?")[0] === "/api") {
      return send(res, 200, {
        ok: true,
        service: "MongoDB Vercel API",
        database: db.databaseName
      });
    }

    // GET /api/players
    if (req.method === "GET" && req.url.split("?")[0] === "/api/players") {
      const players = await db
        .collection("players")
        .find({})
        .sort({ _id: -1 })
        .limit(100)
        .toArray();

      return send(res, 200, players);
    }

    // POST /api/players
    if (req.method === "POST" && req.url.split("?")[0] === "/api/players") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

      if (!body.name) {
        return send(res, 400, { error: "name is required" });
      }

      const player = {
        name: String(body.name),
        score: Number(body.score || 0),
        createdAt: new Date()
      };

      const result = await db.collection("players").insertOne(player);

      return send(res, 201, {
        success: true,
        id: result.insertedId,
        player
      });
    }

    return send(res, 404, { error: "Route not found" });
  } catch (error) {
    console.error(error);
    return send(res, 500, {
      error: "Internal server error"
    });
  }
};

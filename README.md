# MongoDB API for Vercel

This is a small Node.js/Vercel API for the MongoDB Atlas `game` database.

## 1. Install locally (optional)

```bash
npm install
npm run dev
```

## 2. Vercel deployment

Upload this project to GitHub, import the repository into Vercel, then add these Environment Variables:

- `MONGODB_URI` = your MongoDB Atlas connection string
- `MONGODB_DB` = `game`

Redeploy after adding the variables.

## 3. Endpoints

Health:
GET `/api`

Get players:
GET `/api/players`

Create player:
POST `/api/players`

JSON body:
```json
{
  "name": "Abhishek",
  "score": 1000
}
```

## 4. Single-file HTML example

```js
const API_URL = "https://YOUR-PROJECT.vercel.app";

async function savePlayer(name, score) {
  const res = await fetch(`${API_URL}/api/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, score })
  });
  return res.json();
}

async function getPlayers() {
  const res = await fetch(`${API_URL}/api/players`);
  return res.json();
}
```

## Security

The MongoDB connection string is intentionally NOT included in this ZIP.
Keep it in Vercel Environment Variables. The browser only sees your API URL.

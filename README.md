# 🏀 NBA Project

![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=nextdotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![License](https://img.shields.io/badge/license-MIT-green)

A full-stack **Next.js + PostgreSQL + Prisma** app running in **Docker**, preloaded with NBA data.  
Built to demonstrate database querying and API interaction between a modern web frontend and a relational backend.

---

## 🚀 Quick Start

### 1️⃣ Clone the Repository
This step is unneeded if running on GitHub Codespaces.
```bash
git clone https://github.com/iammon/nba-project.git
cd nba-project
```

### 2️⃣ Start Everything with Docker

SQL Commands in case User and user_fav tables don't exist
```bash
CREATE TABLE IF NOT EXISTS "User" (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_fav (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  favorite_player_id INTEGER NOT NULL,
  favorite_team_id INTEGER NOT NULL,

  CONSTRAINT user_fav_user_fk
    FOREIGN KEY (user_id)
    REFERENCES "User"(id)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,

  CONSTRAINT user_fav_player_fk
    FOREIGN KEY (favorite_player_id)
    REFERENCES players(id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,

  CONSTRAINT user_fav_team_fk
    FOREIGN KEY (favorite_team_id)
    REFERENCES teams(id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);


```

```bash
docker compose up -d --build
```

If pages won't load, remove orphans:
```bash
docker compose down
docker compose up -d
```

Access the database:
```bash
psql -h localhost -p 5433 -U postgres -d nba
password: postgres
```

Wait until both containers (`db` and `adminer`) show **"healthy"**:

```bash
docker compose ps
```
Confirm the DB auto-restore ran:

```bash
docker compose logs -f db | sed -n '1,200p'
```

Look for:
```bash
/docker-entrypoint-initdb.d/01-restore.sh
🔄 Restoring ...nba_snapshot.dump...
✅ Initial restore complete.
```

If restore worked, we can do an API smoke test from terminal:
```bash
curl -s http://localhost:3000/api/health | jq
curl -s http://localhost:3000/api/players | jq

```
You should see something like { ok: true, ... } and a non-empty players array.

---

### 3️⃣ Open the App

| Service | URL | Description |
|----------|-----|-------------|
| 🖥️ **Web App** | [http://localhost:3000](http://localhost:3000) | Next.js frontend |
| 🧭 **Adminer** | [http://localhost:8080](http://localhost:8080) | Simple PostgreSQL database UI |

**Adminer Login Info:**

| Key | Value |
|-----|-------|
| **System** | PostgreSQL |
| **Server** | db |
| **User** | postgres
| **Password** | postgres |
| **Database** | nba |

---

## 🧠 Useful Commands

| Action | Command |
|--------|----------|
| View container logs | `docker compose logs -f db` or `docker compose logs -f web` |
| Stop all containers | `docker compose down` |
| Rebuild from scratch | `docker compose down -v && docker compose up -d --build` |
| Open Prisma Studio | `npm run studio` |
| Run dev server locally (no Docker) | `npm run dev` |

---

## 💾 Database Snapshot

This project includes a pre-loaded dataset (`data/nba_snapshot.dump`) containing **teams**, **players**, and **games** data.  
If needed, you can manually restore the database:

```bash
pg_restore -h localhost -p 5433 -U postgres \
  --no-owner --no-privileges data/nba_snapshot.dump
```

---

## 🧩 Tech Stack

| Category | Technology |
|-----------|-------------|
| **Frontend** | Next.js 15 (Turbopack) |
| **Backend** | Prisma ORM |
| **Database** | PostgreSQL 16 (Docker) |
| **DB Admin** | Adminer |
| **Styling** | TailwindCSS |
| **Runtime** | Node.js 20+ |

---

## 🧰 Development Notes

- Environment variables live in `.env` (see `.env.example` for defaults).  
- The Prisma client is generated in `src/generated/prisma/`.  
- The app connects to:
  - Local PostgreSQL on port **5432**, or  
  - Docker PostgreSQL container on port **5433**.

---

## 🧪 Testing Your Setup

Once everything is running:

```bash
curl -s http://localhost:3000/api/health | jq
curl -s http://localhost:3000/api/players | jq
```

✅ Expected output:  
- Health route returns `{ "status": "ok" }`  
- Players route returns player data from the database

---

## 🧑‍💻 Authors  

**Htaw Mon**  
_Computer Science, The University of Akron_  
[GitHub @iammon](https://github.com/iammon)  

**Evan Castner**  
_Computer Science, The University of Akron_

**Sabrina**  
_Computer Science and Applied Mathematics, The University of Akron_  

---

## 🪶 License

This project is open source and available under the **MIT License**.

---

## ⭐ Contributing (Optional)

If you’re collaborating or testing:
1. Fork the repo  
2. Create a new branch (`git checkout -b feature-name`)  
3. Commit and push your changes  
4. Open a Pull Request  

---

> _“Data tells stories — this project turns basketball stats into something you can see and query.”_

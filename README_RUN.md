## Run without Docker (XAMPP)

### Backend
- Start **Apache** and **MySQL** in XAMPP.
- Import `schema.sql` into your MySQL (create DB + tables).

Default admin user:
- **admin / 123**

API base URL (Apache):
- `http://localhost/Frontend/api`

### Frontend
```bash
npm install
npm run dev
```

Open:
- `http://localhost:5173`

If needed, create `Frontend/.env.local`:
```
VITE_API_BASE_URL=http://localhost/Frontend/api
```

---

## Run with Docker

From `Frontend/`:
```bash
docker compose up --build
```

Open:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080/health.php`
- API: `http://localhost:8080/api/login.php`
- MySQL: `localhost:3306` (root/root)


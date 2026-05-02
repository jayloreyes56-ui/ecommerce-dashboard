# ✅ Supabase Setup Checklist

## 📋 Quick Checklist - Gawin mo ito in order!

### 1️⃣ Create Supabase Account & Project (5 min)
- [ ] Go to https://supabase.com
- [ ] Sign up (free!)
- [ ] Create new project
- [ ] Save your database password!
- [ ] Wait for project to finish setting up

### 2️⃣ Get Database Credentials (2 min)
- [ ] Go to Settings → Database
- [ ] Copy connection string
- [ ] Extract these values:
  - [ ] DB_HOST (e.g., `db.xxxxx.supabase.co`)
  - [ ] DB_PASSWORD (your project password)

### 3️⃣ Update Local .env (1 min)
- [ ] Open `backend/.env`
- [ ] Update these lines:
  ```env
  DB_CONNECTION=pgsql
  DB_HOST=db.xxxxx.supabase.co          # ← Your Supabase host
  DB_PORT=5432
  DB_DATABASE=postgres
  DB_USERNAME=postgres
  DB_PASSWORD=your-password-here         # ← Your Supabase password
  DB_SSLMODE=require
  ```

### 4️⃣ Test Locally (2 min)
```bash
cd backend
php artisan config:clear
php artisan migrate:fresh --seed
php artisan serve
```

- [ ] No errors sa migration?
- [ ] May data na sa Supabase dashboard?

### 5️⃣ Update Render Environment Variables (3 min)
- [ ] Go to Render dashboard
- [ ] Select your backend service
- [ ] Go to **Environment** tab
- [ ] Add/Update:
  ```
  DB_CONNECTION=pgsql
  DB_HOST=db.xxxxx.supabase.co
  DB_PORT=5432
  DB_DATABASE=postgres
  DB_USERNAME=postgres
  DB_PASSWORD=your-password-here
  DB_SSLMODE=require
  ```
- [ ] Click **Save Changes**
- [ ] Wait for auto-redeploy

### 6️⃣ Run Migrations on Render (2 min)
- [ ] Go to Render **Shell** tab
- [ ] Run: `php artisan migrate:fresh --seed`
- [ ] Check for success message

### 7️⃣ Test Production (1 min)
- [ ] Visit: `https://your-backend.onrender.com/api/login`
- [ ] Try logging in from frontend
- [ ] Check if data loads

---

## 🎯 Total Time: ~15 minutes

## ✅ Success Indicators

You'll know it's working when:
- ✅ Local migrations run without errors
- ✅ Supabase dashboard shows tables with data
- ✅ Render deployment succeeds
- ✅ Login works on production
- ✅ No 500 errors

---

## 🆘 If Something Goes Wrong

### Can't connect locally?
1. Check DB_HOST and DB_PASSWORD
2. Make sure DB_SSLMODE=require
3. Run: `php artisan config:clear`

### Can't connect on Render?
1. Check environment variables are saved
2. Redeploy manually if needed
3. Check Render logs for errors

### Migrations fail?
1. Check if database is empty
2. Try: `php artisan migrate:fresh --seed --force`
3. Check Supabase logs

---

## 📚 Detailed Guides

- **Full Setup Guide**: [SUPABASE-SETUP.md](./SUPABASE-SETUP.md)
- **Migration Info**: [SQLITE-TO-SUPABASE-MIGRATION.md](./SQLITE-TO-SUPABASE-MIGRATION.md)
- **Deployment Guide**: [DEPLOY-NGAYON.md](./DEPLOY-NGAYON.md)

---

## 🎉 After Completion

Once all checkboxes are ✅:
- Your app is using Supabase PostgreSQL
- SQLite is completely removed
- Production deployment works
- Database is backed up automatically

**You're done! Congrats!** 🚀

# 🚀 Supabase PostgreSQL Setup Guide

## Bakit Supabase?
- ✅ **FREE PostgreSQL database** na production-ready
- ✅ **Walang SQLite issues** sa deployment
- ✅ **Automatic backups** at scaling
- ✅ **Real-time capabilities** kung kailangan mo

---

## Step 1: Create Supabase Account

1. Pumunta sa [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** o **"Sign Up"**
3. Sign up gamit ang GitHub, Google, o email

---

## Step 2: Create New Project

1. Sa Supabase dashboard, click **"New Project"**
2. Fill in the details:
   - **Name**: `ecommerce-dashboard` (o kahit ano)
   - **Database Password**: Gumawa ng strong password (SAVE THIS!)
   - **Region**: Choose closest to your users (e.g., `Southeast Asia (Singapore)`)
   - **Pricing Plan**: Select **FREE** tier
3. Click **"Create new project"**
4. Wait 2-3 minutes habang nag-setup

---

## Step 3: Get Database Credentials

1. Sa Supabase dashboard, click your project
2. Go to **Settings** (gear icon sa sidebar)
3. Click **"Database"** sa left menu
4. Scroll down to **"Connection string"** section
5. Select **"URI"** tab
6. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```

---

## Step 4: Update Your .env File

Palitan ang values sa `backend/.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-actual-password-here
DB_SSLMODE=require
```

### Paano kunin ang bawat value:

From your Supabase connection string:
```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

- **DB_HOST**: Yung part after `@` hanggang before `:5432`
  - Example: `db.abcdefghijklmnop.supabase.co`
- **DB_PASSWORD**: Yung password na ginawa mo nung nag-create ng project
- **DB_DATABASE**: `postgres` (default)
- **DB_USERNAME**: `postgres` (default)
- **DB_PORT**: `5432` (default)
- **DB_SSLMODE**: `require` (important for Supabase!)

---

## Step 5: Run Migrations

Once na-update na ang `.env`, run:

```bash
cd backend
php artisan config:clear
php artisan migrate:fresh --seed
```

Ito ang mag-create ng lahat ng tables sa Supabase PostgreSQL database mo.

---

## Step 6: Verify Connection

Test kung connected na:

```bash
php artisan tinker
```

Then type:
```php
DB::connection()->getPdo();
```

Kung walang error, success! ✅

---

## Common Issues & Solutions

### Issue: "SQLSTATE[08006] could not connect to server"
**Solution**: Check kung tama ang DB_HOST at DB_PASSWORD

### Issue: "SSL connection required"
**Solution**: Make sure `DB_SSLMODE=require` is set

### Issue: "password authentication failed"
**Solution**: 
1. Go to Supabase Dashboard → Settings → Database
2. Click "Reset Database Password"
3. Update your `.env` with new password

---

## For Render Deployment

Sa Render dashboard, i-add ang environment variables:

```
DB_CONNECTION=pgsql
DB_HOST=db.xxxxxxxxxxxxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your-supabase-password
DB_SSLMODE=require
```

---

## Supabase Free Tier Limits

- ✅ **500 MB database space** (more than enough for most apps)
- ✅ **Unlimited API requests**
- ✅ **50,000 monthly active users**
- ✅ **2 GB bandwidth**
- ✅ **Automatic backups** (7 days retention)

Perfect for development and small to medium production apps!

---

## Next Steps

1. ✅ Create Supabase account
2. ✅ Create new project
3. ✅ Get database credentials
4. ✅ Update `backend/.env`
5. ✅ Run migrations
6. ✅ Deploy to Render with Supabase credentials

---

## Need Help?

Kung may problema, check:
- Supabase Dashboard → Logs
- Laravel logs: `backend/storage/logs/laravel.log`
- Run: `php artisan config:clear && php artisan cache:clear`

**Tapos na! Your app will now use Supabase PostgreSQL instead of SQLite!** 🎉

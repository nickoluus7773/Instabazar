# Backend setup

The public vendor pages use these read-only endpoints:

- `GET /api/vendors/` — vendors marked **Verified** in Django admin
- `GET /api/vendors/<store_slug>/` — one verified vendor

For a local setup, create a virtual environment, install the tracked dependencies, and run:

```powershell
py -3.13 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8001
```

Open `/admin/`, create a Vendor linked to a user, give it a unique `store_slug`, and set its verification status to `Verified`. It will then appear on the frontend `/vendors` page.

SQLite is the default so a fresh clone can run migrations immediately. To use PostgreSQL, set the `POSTGRES_*` variables listed in `.env.example` before starting Django.

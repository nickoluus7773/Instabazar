#!/usr/bin/env python
"""
InstaBazaar Database & Product Seeder
====================================
Cross-platform setup script that can be run anywhere.
Seeds 5 vendors, all subscription plans, and 101 distinct, product-accurate items.

Usage:
    python seed_vendors.py
"""

import os
import sys
from pathlib import Path

# Resolve base project paths dynamically (OS-independent, no hardcoded paths)
BASE_DIR = Path(__file__).resolve().parent
BACKEND_DIR = BASE_DIR / "backend"

# Ensure backend directory is on Python path
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Automatically load backend/.env if it exists
env_file = BACKEND_DIR / ".env"
if env_file.exists():
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

try:
    import django
    django.setup()
except Exception as exc:
    print(f"Error initializing Django: {exc}")
    print("Please make sure Python dependencies are installed: pip install -r backend/requirements.txt")
    sys.exit(1)

from django.core.management import call_command

def main():
    print("=" * 65)
    print("  InstaBazaar Automated Seeder (5 Vendors & 101 Unique Products)")
    print("=" * 65)

    print("\n[1/2] Applying database migrations...")
    try:
        call_command("migrate", interactive=False)
    except Exception as exc:
        print(f"Warning during migration: {exc}")

    print("\n[2/2] Seeding plans, vendors, products and local images...")
    try:
        call_command("seed_vendors")
    except Exception as exc:
        print(f"Error seeding vendors: {exc}")
        sys.exit(1)

    print("\n" + "=" * 65)
    print("SUCCESS: All 5 Vendors & 101 Products Ready!")
    print("=" * 65)
    print("Vendor Accounts Created (Password for all: password123):")
    print("  1. Free Vendor:      free_vendor         (10 products)")
    print("  2. Standard Vendor:  standard_vendor     (20 products)")
    print("  3. Advance Vendor:   advance_vendor      (50 products)")
    print("  4. Motorsport:       scuderia_motorsport (12 products, incl. Ferrari Cap)")
    print("  5. Footwear:         heritage_footwear   (9 products)")
    print("\nNext steps to run the app:")
    print("  Backend:  python backend/manage.py runserver")
    print("  Frontend: npm --prefix frontend run dev")
    print("=" * 65)


if __name__ == "__main__":
    main()

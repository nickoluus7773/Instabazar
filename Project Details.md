# InstaBazaar — Project Details

> Presentation reference document based on the source code and project documentation in this repository. It describes implemented behavior and calls out areas where the code exposes a placeholder or plan flag rather than a complete feature.

## 1. Project at a glance

**InstaBazaar** is a social-commerce product discovery and storefront management platform for businesses that sell through Instagram. It brings vendor product catalogs, customer discovery, wishlists, reviews, vendor follows, and plan-based vendor tools into one web application.

The platform has two primary user roles:

- **Customers** browse products and verified vendors, save products, follow eligible vendors, read and write reviews, and visit the vendor's Instagram presence to enquire or purchase.
- **Vendors** create a storefront, publish and manage product listings, monitor plan-aware activity and wishlist analytics, build a follower audience, and subscribe to higher-tier plans.

The application is a catalog and social-commerce discovery layer. Product records contain stock and price information, but the repository does not implement an in-app cart, order fulfillment, or customer checkout workflow. The sales conversation/purchase is directed to Instagram.

## 2. Problem and proposed solution

Many small and independent sellers use Instagram as their main shop but lack a structured catalog and useful discovery experience. Customers can have difficulty finding products across sellers or keeping track of items they like. InstaBazaar provides:

- Structured, image-rich product listings associated with their vendors and categories.
- Public vendor storefronts and category/product discovery pages.
- A saved-products wishlist and a feed based on followed vendors.
- A vendor dashboard for storefront and catalog administration.
- Subscription tiers that gate listing capacity, analytics depth, and selected promotional capabilities.

## 3. Main capabilities

### Customer experience

- **Home and discovery:** Homepage sections present the platform, categories, featured products, top vendors, reviews, and calls to action.
- **Product gallery:** Browse active product listings and open a product detail view. Product data includes title, description, price, image, stock, size, condition, category, vendor, and optional Instagram post URL.
- **Vendor directory and storefronts:** Browse verified vendors and open a vendor by its unique store slug. Storefronts show vendor identity, profile image/logo, bio, location, Instagram handle, eligible catalog, and follow state.
- **Search/filter presentation:** The frontend contains category/tag filtering and vendor/product browsing UI. Actual discovery data is supplied from the API or local homepage data modules, depending on the page.
- **Wishlist:** Authenticated customers can save and remove products; saved products are persisted per account and surfaced on the wishlist/profile views. The UI updates optimistically and restores prior state if the request fails.
- **Vendor follows:** Customers can follow and unfollow verified vendors when the vendor's active plan permits follows. Follow state and follower counts are exposed by the API.
- **Personal feed:** Authenticated customers can view recent active products from followed, eligible vendors. The API paginates the feed (default 12 items, configurable up to 36).
- **Reviews:** Visitors can read public reviews. Authenticated users can submit reviews and manage their own reviews from their profile.
- **Account/profile:** Customer registration and login, profile bio/username editing, password change, account deletion, and review/favorite sections are represented in the application.
- **Legal and about pages:** About, privacy, terms, cookies, and disclaimer pages provide informational and policy content.

### Vendor experience

- **Vendor registration:** A business can register with account credentials and business details, or an authenticated customer account can create a vendor profile. The system generates a unique store slug. New vendor profiles begin pending verification and on the Free plan.
- **Moderation:** Django admin is used to review vendor records and set verification status. Public vendor listings only include verified vendors.
- **Vendor profile:** Vendors can view and edit business name, bio, location, Instagram handle, logo/profile image, and related storefront data.
- **Product management:** Vendor dashboard routes provide product listing, creation, editing, and deletion. Product images can be uploaded. Listings have active/inactive state and are associated with a category.
- **Plan-aware listing limits:** Product creation checks the vendor's effective plan. Defaults seeded by the project are Free: 10 products, Standard: 50, Advanced: unlimited. When the limit is reached, the API returns an upgrade-required response.
- **Instagram product references:** A product may include a direct HTTPS Instagram post, reel, or video URL. The backend validates the host and path format.
- **Dashboard and analytics:** Vendor dashboard and analysis screens surface product counts, favorites/wishlist activity, followers, and plan-dependent product/category/trend views. Analytics access is restricted according to the effective plan.
- **Follower management:** Eligible vendors can fetch a paginated list of followers. Vendor follow eligibility requires a verified vendor with a current Standard or Advanced subscription.
- **Subscription management:** Vendors can view available plans, current subscription and history, initiate a subscription, create/verify a Razorpay payment order, and cancel a subscription through API flows.
- **Instagram redirect:** The backend has a public redirect endpoint that sends a customer to a valid vendor Instagram username when the effective plan includes the redirect feature.

### Subscription tiers (seed defaults)

The management command `seed_subscription_plans` creates or updates the following default plan records. Prices are application defaults and may be changed in the database/configuration.

| Plan | Default monthly price | Product capacity | Analytics | Other configured entitlements |
|---|---:|---:|---|---|
| Free | ₹0 | 10 | Basic | No Instagram redirect, badges, or Bazaar Choice flag |
| Standard | ₹149 | 50 | Standard | Instagram redirect and product badges |
| Advanced | ₹249 | Unlimited | Advanced | Redirect, badges, and Bazaar Choice flags |

Paid subscriptions are modeled with pending, active, expired, and cancelled states. Payment activation is intended to follow provider verification. The service layer sets a 30-day paid period and applies a plan access cutoff at noon on the day after the stored expiry date. A scheduled management command can mark subscriptions expired. Bazaar Choice is a plan entitlement in the data model; this repository should not be presented as containing a complete customer-facing workflow unless that functionality is implemented elsewhere.

## 4. Typical user journeys

### Customer journey

1. Open the homepage or product gallery.
2. Browse a product and open its details or the seller's storefront.
3. Register/login to save a product or follow an eligible seller.
4. Revisit saved items in the wishlist/profile, or view updates in the personalized feed.
5. Use the seller's Instagram details or the plan-enabled redirect to continue the enquiry/purchase on Instagram.

### Vendor journey

1. Create an account and submit business/store details.
2. Wait for verification; the vendor is not shown in public verified-vendor listings until approved.
3. Sign in to the vendor dashboard and update the storefront profile.
4. Add, edit, activate/deactivate, or remove catalog products within the plan limit.
5. Review available dashboard and analytics information.
6. Upgrade to Standard or Advanced for higher listing capacity, deeper analytics, follows, and applicable promotional features.

## 5. Pages and routes

Frontend routes are implemented with the Next.js App Router. The main route groups include:

| Route | Purpose |
|---|---|
| `/` | Homepage and marketplace introduction |
| `/about` and `/aboutn` | About/story content (both route directories exist) |
| `/gallery` | Product discovery/gallery |
| `/gallery/product/[id]` | Product details |
| `/vendors` | Vendor directory |
| `/vendors/[slug]` | Public vendor storefront |
| `/wishlist` | Customer saved products |
| `/feed` | Personalized feed from followed vendors |
| `/reviews` | Review listing/submission experience |
| `/login`, `/register` | Account access |
| `/register/vendor` | Vendor onboarding |
| `/profile` | Customer profile, favorites, reviews, settings |
| `/vendor` | Vendor dashboard landing |
| `/vendor/profile` | Vendor profile management |
| `/vendor/products` | Vendor product list/management |
| `/vendor/products/create` | Add listing |
| `/vendor/products/[id]/edit` | Edit listing |
| `/vendor/analysis` | Vendor analytics |
| `/vendor/marketing` | Vendor marketing screen |
| `/vendor/subscription` and `/subscription` | Plan and subscription experiences |
| `/legal`, `/legal/privacy-policy`, `/legal/terms-and-conditions`, `/legal/cookies`, `/legal/disclaimer` | Legal/informational pages |

## 6. Technical architecture

### Frontend

- **Framework:** Next.js 16 App Router with React 19.
- **Language:** JavaScript/JSX.
- **Styling:** Tailwind CSS 4, global CSS, and reusable UI components.
- **Icons:** `lucide-react` and `react-icons` are dependencies.
- **API calls:** Fetch API (plus Axios dependency) through shared helpers; backend base URL comes from `NEXT_PUBLIC_API_URL`, defaulting to `http://127.0.0.1:8000`.
- **Shared state:** React context provides authentication/role state and wishlist state.
- **Authentication storage:** The frontend stores the JWT access token in browser `localStorage` and sends it as a Bearer token.
- **Design system:** Premium, minimal, off-white and white surfaces, rounded cards, soft shadows, clear typography, and restrained Instagram-inspired gradient accents. Shared UI elements include buttons, cards, badges, section headings, and containers.

### Backend

- **Framework:** Django 5.2 with Django REST Framework.
- **Authentication:** Simple JWT; login accepts username or email (case-insensitive). The login response includes vendor status and store slug when applicable.
- **Database:** SQLite is the default for local development; PostgreSQL settings are enabled through `POSTGRES_*` environment variables.
- **Media:** Uploaded product/vendor images are stored under `backend/media`. Model save logic also attempts to copy images to `frontend/public/images` for frontend use.
- **CORS:** `django-cors-headers` is configured; current settings allow all origins, suitable for local development but requiring production hardening.
- **Admin:** Django admin manages users, products/categories, vendors/verification, reviews, and subscription data.
- **Installed domain apps:** `users`, `vendor`, `products`, `reviews`, and `subscriptions`.

### Core data entities

- **User / UserProfile:** Django account and associated customer profile (bio and creation date).
- **Vendor:** One-to-one association with a user; business profile, unique store slug, verification state, social details, plan label, follower count, and profile image.
- **VendorFollow:** Unique customer/vendor relationship with timestamp.
- **Category:** Product category name.
- **Product:** Vendor-owned listing with description, price, stock, size, condition, image, category, active flag, creation time, and optional Instagram post URL.
- **WishlistItem:** Unique user/product saved relation.
- **Review:** User-authored text review and timestamp.
- **SubscriptionPlan:** Price, product limit, analytics level, and feature entitlement flags.
- **VendorSubscription:** Vendor's subscription history, status, date range, payment reference, Razorpay order ID, and cancellation fields.

## 7. API overview

The backend API is rooted at `/api/` except subscription endpoints, which are rooted at `/subscriptions/`.

### Authentication and account

- `POST /api/login/` — obtain JWT access/refresh tokens (login accepts username or email).
- `POST /api/token/refresh/` — refresh JWT access token.
- `POST /api/register/` — customer registration.
- `POST /api/register/vendor/` — vendor onboarding/profile creation.
- `GET /api/me/` — current-user endpoint.
- `GET/PUT /api/profile/` — retrieve/update customer profile.
- `PUT /api/change-password/` — change password.
- `DELETE /api/delete-account/` — delete current account.

### Products and wishlist

- `GET /api/products/` — public active products within plan visibility limits.
- `GET /api/products/{id}/` — product detail; vendors can access their own inactive items.
- Authenticated product ViewSet writes are available to signed-in users, with vendor ownership and subscription checks applied in the vendor product workflow.
- `GET/POST /api/wishlist/` — list/add current user's saved products.
- `DELETE /api/wishlist/{product_id}/` — remove a saved product.

### Vendors and social graph

- `GET /api/vendor/public/` — verified vendor list.
- `GET /api/vendor/public/{store_slug}/` — verified vendor detail and eligible active products.
- `GET /api/vendor/profile/`, `PUT/PATCH /api/vendor/profile/update/` — authenticated vendor profile.
- `GET /api/vendor/stats/`, `/api/vendor/analysis/`, `/api/vendor/wishlist-analysis/` — plan-aware vendor metrics.
- `/api/vendor/products/` and `/api/vendor/products/{id}/` — vendor catalog operations.
- `GET/POST /api/vendor/follows/` — customer follow list/create.
- `DELETE /api/vendor/follows/{vendor_id}/` — unfollow.
- `GET /api/vendor/feed/` — customer feed from followed eligible vendors.
- `GET /api/vendor/followers/` — vendor follower list.

### Reviews and subscriptions

- `GET/POST /api/reviews/` — public review list; authenticated review submission.
- `GET /api/profile/reviews/` — current user's reviews.
- `PUT/DELETE /api/reviews/{id}/` — edit/delete own review.
- `GET /subscriptions/plans/`, `/current/`, `/history/` — plan and subscription information.
- `POST /subscriptions/subscribe/`, `/cancel/` — subscription lifecycle actions.
- `POST /subscriptions/payment/create-order/`, `/payment/verify/` — Razorpay order and verification flow.

Exact permissions and response shapes are defined in the corresponding Django views and serializers; endpoint names above are a high-level guide.

## 8. Security and access rules in the implementation

- Most private API requests require JWT authentication.
- Customer-only follow/feed endpoints reject vendor accounts; vendor follower endpoints reject customer accounts.
- Public storefront APIs only return vendors marked verified.
- Follow eligibility checks verification and a current Standard or Advanced subscription.
- Vendor product creation is associated with the authenticated vendor, and plan limits are checked in a database transaction.
- Wishlist entries are unique per user/product and follow relationships are unique per customer/vendor.
- Users can edit or delete only their own reviews.
- Instagram post URLs are constrained to direct HTTPS Instagram post/reel/video paths; Instagram profile redirect validates the handle before redirecting.

## 9. Local development setup

### Prerequisites

- Python 3.13 is used in the backend README example (compatible Python version should match installed dependencies).
- Node.js/npm compatible with the Next.js 16 frontend.
- Optional PostgreSQL for non-SQLite local setup.
- Razorpay credentials are needed to exercise real payment processing.

### Backend

From the `backend` directory in PowerShell:

```powershell
py -3.13 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_subscription_plans
python manage.py runserver 8000
```

The repository README demonstrates port `8001`; the frontend API helper defaults to port `8000`. Set `NEXT_PUBLIC_API_URL` to the actual backend URL used in the local environment. A verified vendor must be created/approved through Django admin to appear in the public directory.

### Frontend

From the `frontend` directory:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The frontend package also defines `npm run build`, `npm run start`, and `npm run lint` scripts.

### Useful backend commands and configuration

- `python manage.py seed_subscription_plans` — create/update default Free, Standard, and Advanced plans.
- `python manage.py expire_subscriptions` — mark subscriptions expired after their access cutoff.
- Configure `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `NEXT_PUBLIC_API_URL`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and optionally `POSTGRES_*` values for the environment.
- `backend/run_expire_subscriptions.bat` is present as a Windows helper for subscription expiration.

## 10. Repository layout

```text
Instabazar1/
├── frontend/                 # Next.js application
│   ├── app/                  # App Router pages and UI components
│   ├── context/              # Authentication and wishlist state
│   ├── lib/                  # API helpers
│   └── public/images/        # Frontend images
├── backend/                  # Django REST API
│   ├── config/               # Django settings and root URLs
│   ├── users/                # Account/profile/authentication
│   ├── vendor/               # Vendor profiles, public stores, follows
│   ├── products/             # Categories, products, wishlist
│   ├── reviews/              # Customer reviews
│   ├── subscriptions/        # Plans, payment, subscription services
│   └── media/                # Uploaded product/vendor assets
├── seed_vendors.py           # Root-level vendor seed utility
└── VENDOR_DASHBOARD_README.md # Additional vendor dashboard reference
```

## 11. Current implementation boundaries to describe accurately

- The project supports product discovery and vendor contact through Instagram; it does not contain a complete checkout, order, payment-for-product, shipping, or fulfillment system.
- Product stock is stored, but stock reservation/decrement and order lifecycle are not implemented in the visible product model/API.
- Several dashboard fields are explicitly returned as `None` or `0` (for example views, orders, revenue, ratings, and product `views_count`). Do not describe these as measured production analytics. Some analysis trend values are calculated from wishlist/product/follower counts rather than recorded page-view events.
- Reviews are general user text reviews in the backend model; they are not linked to a vendor or product and have no rating field in that model.
- Product badges and Bazaar Choice appear as plan entitlement flags. Their full customer-facing workflows are not established by these fields alone.
- Razorpay settings, order creation, and payment verification endpoints exist. Live payments require valid credentials and provider configuration.
- The seed plan values are defaults, not a guarantee that a deployed database currently has those values.
- `frontend/public/images` and `backend/media` both contain image assets. Backend model save methods copy uploads to frontend public images on a best-effort basis; media serving and deployment behavior should be configured for the target hosting environment.

## 12. Suggested presentation outline

1. **Title:** InstaBazaar — Social Commerce Catalog Platform.
2. **Problem:** Instagram sellers need an organized catalog and customers need a simple way to discover and track products.
3. **Solution:** Vendor storefronts, product discovery, wishlist, follows, and a personalized feed.
4. **User roles:** Customer and vendor journeys.
5. **Customer features:** Gallery, vendor pages, favorites, follows/feed, reviews, Instagram contact.
6. **Vendor features:** Onboarding, verification, product management, dashboard, plan-aware analytics.
7. **Business model:** Free, Standard, Advanced subscriptions and feature/capacity gating.
8. **Technology:** Next.js/React frontend; Django REST Framework backend; JWT; SQLite/PostgreSQL; Razorpay integration.
9. **System design:** Frontend → REST API → Django domain apps/database/media; admin moderation.
10. **Limitations and roadmap:** Explain current catalog/social scope and distinguish calculated/placeholder metrics from tracked analytics; potential future checkout, order tracking, measured analytics, and fuller paid-tier feature workflows.

## 13. Short project summary for a slide

**InstaBazaar is a social-commerce catalog platform that helps Instagram-based sellers create verified storefronts and manage product listings, while customers discover products, save favorites, follow eligible vendors, and continue shopping through Instagram. It combines a Next.js customer/vendor experience with a Django REST API, JWT authentication, and subscription-based vendor capabilities.**

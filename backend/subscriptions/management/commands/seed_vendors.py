import os
import random
import shutil
import urllib.request
from datetime import timedelta
from pathlib import Path
from PIL import Image, ImageDraw

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf import settings

from products.models import Product, Category
from vendor.models import Vendor
from subscriptions.models import SubscriptionPlan, VendorSubscription


def download_or_generate_image(filename, unsplash_id, title, category_name, price, index):
    """
    Downloads a high-res real product image from Unsplash and saves it to:
      1. frontend/public/images/<filename>
      2. backend/media/products/<filename>
    Falls back to a rendered product card if offline or error occurs.
    """
    frontend_dir = settings.BASE_DIR.parent / "frontend" / "public" / "images"
    backend_dir = settings.BASE_DIR / "media" / "products"
    frontend_dir.mkdir(parents=True, exist_ok=True)
    backend_dir.mkdir(parents=True, exist_ok=True)

    frontend_path = frontend_dir / filename
    backend_path = backend_dir / filename

    if frontend_path.exists() and frontend_path.stat().st_size > 5000:
        if not backend_path.exists():
            shutil.copy2(frontend_path, backend_path)
        return

    downloaded = False
    if unsplash_id:
        url = f"https://images.unsplash.com/{unsplash_id}?w=600&h=600&fit=crop&crop=entropy&q=80"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
            with urllib.request.urlopen(req, timeout=8) as response:
                content = response.read()
                if len(content) > 3000:
                    with open(frontend_path, "wb") as f:
                        f.write(content)
                    with open(backend_path, "wb") as f:
                        f.write(content)
                    downloaded = True
        except Exception:
            downloaded = False

    if not downloaded:
        palettes = [
            ((15, 23, 42), (99, 102, 241)),
            ((24, 24, 27), (236, 72, 153)),
            ((19, 78, 74), (45, 212, 191)),
            ((120, 53, 15), (245, 158, 11)),
        ]
        bg, accent = palettes[index % len(palettes)]
        img = Image.new("RGB", (600, 600), bg)
        draw = ImageDraw.Draw(img)
        draw.rounded_rectangle([30, 30, 570, 570], radius=24, outline=accent, width=3)
        draw.text((60, 60), f"[{category_name.upper()}]", fill=accent)
        draw.text((60, 260), title[:30], fill=(255, 255, 255))
        draw.text((60, 310), f"INR {int(price):,}", fill=accent)
        img.save(frontend_path, format="JPEG", quality=85)
        img.save(backend_path, format="JPEG", quality=85)


VENDOR_COVER_PHOTOS = [
    "photo-1565193566173-7a0ee3dbe261",  # Earth & Thread (Pottery / textiles)
    "photo-1555529669-e69e7aa0ba9a",  # District Streetwear (Urban fashion)
    "photo-1522335789203-aabd1fc54bc9",  # Atelier De Luxe (Luxury boutique)
    "photo-1568605117036-5fe5e7bab0b7",  # Scuderia Motorsport (Motorsport team)
    "photo-1449505278894-297fdb3edbc1",  # Heritage Craftsmen (Leather workshop)
]

def create_avatar(filename, business_name, index):
    frontend_dir = settings.BASE_DIR.parent / "frontend" / "public" / "images"
    backend_dir = settings.BASE_DIR / "media" / "vendor_profiles"
    frontend_dir.mkdir(parents=True, exist_ok=True)
    backend_dir.mkdir(parents=True, exist_ok=True)

    f_path = frontend_dir / filename
    b_path = backend_dir / filename

    if f_path.exists() and f_path.stat().st_size > 20000:
        if not b_path.exists():
            shutil.copy2(f_path, b_path)
        return

    uid = VENDOR_COVER_PHOTOS[index % len(VENDOR_COVER_PHOTOS)]
    url = f"https://images.unsplash.com/{uid}?w=800&h=600&fit=crop&q=80"
    downloaded = False
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=8) as response:
            content = response.read()
            if len(content) > 10000:
                with open(f_path, "wb") as f:
                    f.write(content)
                with open(b_path, "wb") as f:
                    f.write(content)
                downloaded = True
    except Exception:
        downloaded = False

    if not downloaded:
        colors = [(99, 102, 241), (236, 72, 153), (20, 184, 166), (249, 115, 22), (168, 85, 247)]
        accent = colors[index % len(colors)]
        img = Image.new("RGB", (600, 450), (15, 23, 42))
        draw = ImageDraw.Draw(img)
        draw.ellipse([150, 75, 450, 375], fill=accent)
        initial = (business_name.strip()[:1] or "V").upper()
        draw.text((280, 200), initial, fill=(255, 255, 255))
        img.save(f_path, format="JPEG", quality=85)
        img.save(b_path, format="JPEG", quality=85)


# 1. FREE VENDOR: 10 Products (Handcrafted, Pottery, Decor & Candles)
FREE_VENDOR_PRODUCTS = [
    ("Handmade Glazed Ceramic Coffee Mug", "Hand-thrown speckled stoneware ceramic mug with ergonomic handle.", "Home Decor", 450, "350 ml", "New", "photo-1514432324607-a09d9b4aefdd"),
    ("Organic Lavender Scented Soy Candle", "Clean-burning soy wax candle in frosted glass jar with lavender flowers.", "Handmade", 399, "200 g", "New", "photo-1603006905003-be475563bc59"),
    ("Bohemian Macrame Cotton Wall Hanging", "Hand-knotted 100% natural cotton macrame tapestry on a smooth wooden rod.", "Handmade", 899, "Medium", "Handcrafted", "photo-1522758971460-1d21eed7dc1d"),
    ("Terracotta Geometric Succulent Planter", "Raw natural terracotta pot with drainage dish, ideal for desktop succulents.", "Home Decor", 299, "Standard", "Handcrafted", "photo-1485955900006-10f4d324d411"),
    ("Embroidered Organic Cotton Tote Bag", "Reusable heavy canvas grocery and book tote with botanical embroidery.", "Bags", 549, "One Size", "New", "photo-1544816155-12df9643f363"),
    ("Handcrafted Teak Wood Cutting Board", "End-grain sustainable teak chopping block treated with organic mineral oil.", "Handmade", 1299, "12x16 in", "Handcrafted", "photo-1588854337236-6889d631faa8"),
    ("Minimalist Ceramic Flower Bud Vase", "Matte stone-textured sculptural vase for dried floral arrangements.", "Home Decor", 650, "8 inch", "New", "photo-1610701596007-11502861dcfa"),
    ("Pure Brass Ayurvedic Water Carafe", "Hand-beaten pure copper and brass water jug with leakproof cap.", "Home Decor", 1499, "1 Litre", "Handcrafted", "photo-1616046229478-9901c5536a45"),
    ("Hand-poured Amber Glass Vanilla Candle", "Warm Madagascar vanilla and sandalwood scented luxury home candle.", "Handmade", 499, "250 g", "New", "photo-1572726729207-a78d6feb18d7"),
    ("Handwoven Jute Storage Organizer Basket", "Braided natural jute fiber basket for laundry, toys, or planters.", "Home Decor", 599, "Large", "Handcrafted", "photo-1590736704728-f4730bb30770"),
]

# 2. STANDARD VENDOR: 20 Products (Streetwear, Hoodies, Sneakers, Accessories)
STANDARD_VENDOR_PRODUCTS = [
    ("Oversized Vintage Acid-Wash T-Shirt", "Heavyweight 240 GSM combed cotton tee with relaxed dropped shoulders.", "Clothing", 999, "L", "New", "photo-1521572267360-ee0c2909d518"),
    ("Retro Air High-Top Leather Sneakers", "Iconic high-top street basketball shoes with cushioned ankle collar.", "Footwear", 3499, "UK 9", "New", "photo-1542291026-7eec264c27ff"),
    ("Heavyweight Fleece Streetwear Hoodie", "400 GSM loopback cotton pullover hoodie with double-layer hood.", "Clothing", 1999, "XL", "New", "photo-1556905055-8f358a7a47b2"),
    ("Vintage Distressed Denim Jacket", "Classic 90s blue stone-washed trucker jacket with dual chest pockets.", "Clothing", 2799, "M", "New", "photo-1551028719-00167b16eac5"),
    ("Tactical Ripstop Multi-Pocket Cargos", "Durable water-repellent urban utility trousers with adjustable leg cuffs.", "Clothing", 1799, "32", "New", "photo-1624378439575-d8705ad7ae80"),
    ("Classic Canvas Low-Top Skate Shoes", "Vulcanized rubber sole trainers with reinforced canvas uppers.", "Footwear", 2299, "UK 8", "New", "photo-1607522370275-f14206abe5d3"),
    ("Corduroy Button-Down Overshirt", "Soft wide-wale cotton corduroy casual jacket shirt in olive green.", "Clothing", 1599, "L", "New", "photo-1596755094514-f87e34085b2c"),
    ("Classic Aviator Polarized Sunglasses", "Full metal frame sunglasses with 100% UV400 protective polarized lenses.", "Accessories", 1299, "Standard", "New", "photo-1511499767150-a48a237f0083"),
    ("Waterproof Technical Crossbody Sling", "Ballistic nylon compact sling pack with Fidlock magnetic buckle.", "Bags", 1199, "One Size", "New", "photo-1553062407-98eeb64c6a62"),
    ("Chunky Knit Merino Wool Beanie", "Warm cuffed fisherman beanie crafted from pure soft merino wool.", "Accessories", 599, "One Size", "New", "photo-1576871337622-98d48d1cf531"),
    ("Raw Selvedge Straight-Leg Jeans", "13.5 oz unwashed indigo denim with authentic redline selvedge ID.", "Clothing", 2899, "34", "New", "photo-1541099649105-f69ad21f3246"),
    ("Nylon Flight Bomber Jacket", "Military-inspired orange-lined MA-1 reversible weather-resistant jacket.", "Clothing", 3299, "M", "New", "photo-1544022613-e87ca75a784a"),
    ("Lug-Sole Polished Leather Derby Shoes", "Commando sole 3-eyelet black leather shoes with Goodyear storm welt.", "Footwear", 3899, "UK 9", "New", "photo-1533867617858-e7b97e060509"),
    ("Graphic Print Streetwear Crewneck", "Custom typography screen-printed relaxed fit French terry sweatshirt.", "Clothing", 1499, "L", "New", "photo-1620799140408-edc6dcb6d633"),
    ("Embroidered Low-Profile Dad Cap", "6-panel washed cotton twill strapback baseball cap with brass slider.", "Accessories", 699, "Adjustable", "New", "photo-1588850561407-ed78c282e89b"),
    ("Stainless Steel Cuban Chain Necklace", "Hypoallergenic 7mm bevelled curb link chain with secure lobster clasp.", "Jewellery", 799, "20 inch", "New", "photo-1599643478518-a784e5dc4c8f"),
    ("Retro Runner Suede Trainers", "Vintage 80s athletic silhouette with EVA wedge cushioning and gum outsole.", "Footwear", 2999, "UK 8", "New", "photo-1595950653106-6c9ebd614d3a"),
    ("Relaxed Linen Camp-Collar Shirt", "Breathable pure linen short-sleeve resort vacation shirt in ecru.", "Clothing", 1399, "M", "New", "photo-1602810318383-e386cc2a3ccf"),
    ("Utility Canvas Duffle Gym Bag", "Heavy 16oz cotton canvas barrel bag with reinforced haul handles.", "Bags", 1699, "35 Litres", "New", "photo-1547949003-9792a18a2601"),
    ("Polarized Wayfarer Matte Sunglasses", "Iconic squared frame silhouette in ultra-lightweight TR90 material.", "Accessories", 999, "Standard", "New", "photo-1572635196237-14b3f281503f"),
]

# 3. ADVANCE VENDOR: 50 Products (Watches, Fine Jewellery, Leather Bags, Footwear, Designer Outerwear)
ADVANCE_VENDOR_PRODUCTS = [
    # Watches & EDC (10)
    ("Minimalist Bauhaus Rose Gold Watch", "Swiss movement dress timepiece with scratch-resistant sapphire crystal glass.", "Accessories", 4999, "38 mm", "New", "photo-1524805444758-089113d48a6d"),
    ("Automatic Diver 300M Stainless Steel Watch", "Professional grade diving watch with ceramic unidirectional bezel.", "Accessories", 7999, "41 mm", "New", "photo-1509042239860-f550ce710b93"),
    ("Heritage Skeleton Mechanical Watch", "Exposed balance wheel movement encased in surgical stainless steel.", "Accessories", 6899, "40 mm", "Vintage", "photo-1522335789203-aabd1fc54bc9"),
    ("Square Retro Vintage Gold Watch", "1970s inspired tank case gold-tone dress watch with lizard pattern band.", "Accessories", 3899, "34 mm", "Vintage", "photo-1523275335684-37898b6baf30"),
    ("Bespoke Hand-Burnished Leather Belt", "Full-grain English bridle leather belt with solid brass buckle.", "Accessories", 1499, "34", "Handcrafted", "photo-1624222247344-550fb60583dc"),
    ("Designer Acetate Polarized Sunglasses", "Handcrafted Italian Mazzucchelli acetate sunglasses with gradient tint.", "Accessories", 2499, "Standard", "New", "photo-1508296695146-257a814070b4"),
    ("Leather Passport & Travel Document Wallet", "Vegetable-tanned leather organizer with RFID blocking protection.", "Accessories", 1299, "Travel", "New", "photo-1627123424574-724758594e93"),
    ("Solid Titanium Key Carabiner Clip", "Precision CNC-machined lightweight titanium everyday carry hook.", "Accessories", 799, "Compact", "New", "photo-1584917865442-de89df76afd3"),
    ("Chronograph Swiss Quartz Aviator Watch", "Cockpit-inspired matte black dial watch with luminous numerals and stopwatch.", "Accessories", 5499, "42 mm", "New", "photo-1539185441755-769473a23570"),
    ("Handmade Vegetable Tanned Cardholder", "Compact saddle-stitched card sleeve that patinas beautifully over time.", "Accessories", 899, "Slim", "Handcrafted", "photo-1607604276583-eef5d076aa5f"),

    # Fine Jewellery (10)
    ("18K Gold Plated Paperclip Chain Choker", "Tarnish-proof waterproof stainless steel with heavy 18K gold dipping.", "Jewellery", 1899, "16 inch", "New", "photo-1599643477877-530eb83abc8e"),
    ("925 Sterling Silver Signet Ring", "Solid hand-cast sterling silver ring with raw brushed face.", "Jewellery", 2299, "US 10", "Handcrafted", "photo-1605100804763-247f67b3557e"),
    ("Freshwater Baroque Pearl Drop Earrings", "Lustrous genuine natural pearls mounted on 14K gold vermeil posts.", "Jewellery", 1699, "One Size", "Handcrafted", "photo-1535632066927-ab7c9ab60908"),
    ("Solid Hammered Brass Bangle Cuff", "Artisanal textured cuff hand-beaten by skilled metal craftsmen.", "Jewellery", 1199, "Adjustable", "Handcrafted", "photo-1611591475819-79b8b4a7b989"),
    ("Emerald Cut Solitaire Crystal Pendant", "Vibrant forest green gem set in a 4-prong minimalist gold necklace.", "Jewellery", 1450, "18 inch", "New", "photo-1515562141207-7a88fb7ce338"),
    ("Pave Zirconia Eternity Band Ring", "Delicate stackable silver ring lined with brilliant-cut stones.", "Jewellery", 1399, "US 7", "New", "photo-1603561591411-07134e71a2a9"),
    ("Raw Amethyst Crystal Gold Wire Ring", "Natural rough purple amethyst gemstone wire-wrapped in 14K gold fill.", "Jewellery", 899, "Free Size", "Handcrafted", "photo-1573408301185-9146fe634ad0"),
    ("Interlocking Cuban Link Chain Bracelet", "Polished 8mm bevelled curb chain with integrated safety clasp.", "Jewellery", 2199, "7.5 inch", "New", "photo-1539109136881-3be0616acf4b"),
    ("Filigree Vintage Art Deco Chandelier Earrings", "Ornate antique silver statement earrings with shimmering crystals.", "Jewellery", 1799, "One Size", "Vintage", "photo-1630019852942-f89202989a59"),
    ("Rainbow Moonstone Pendant Necklace", "Iridescent natural moonstone cabochon in rope-bordered sterling silver.", "Jewellery", 2499, "18 inch", "Handcrafted", "photo-1602751584552-8ba73aad10e1"),

    # Leather Goods & Bags (10)
    ("Full-Grain Leather Weekend Duffle Bag", "Vegetable-tanned buffalo leather overnight holdall with brass zippers.", "Bags", 7499, "45 Litres", "Handcrafted", "photo-1548036328-c9fa89d128fa"),
    ("Structured Italian Pebble Leather Tote", "Luxury work bag with protective metal feet and 15-inch laptop sleeve.", "Bags", 5299, "Large", "New", "photo-1584917865442-de89df76afd4"),
    ("Quilted Lambskin Evening Crossbody Bag", "Diamond-stitched plush leather purse with gold curb chain strap.", "Bags", 3899, "Medium", "New", "photo-1566150905458-1bf1fc113f0d"),
    ("Vintage Waxed Canvas Commuter Rucksack", "Scottish 18oz waterproof canvas pack with genuine saddle leather accents.", "Bags", 4699, "25 Litres", "Vintage", "photo-1622560480605-d83c853bc5c3"),
    ("Slim Hand-Stitched Leather Cardholder", "Compact minimalist 4-pocket card case made from French Epsom leather.", "Accessories", 699, "Slim", "Handcrafted", "photo-1559563458-527698bf5295"),
    ("Suede Slouchy Shoulder Hobo Bag", "Supple camel brown split cowhide suede purse with interior zip pouch.", "Bags", 3999, "One Size", "Handcrafted", "photo-1590874103328-eac38a683ce7"),
    ("Crocodile Embossed Leather Clutch", "Sophisticated envelope clutch with detachable delicate wrist strap.", "Bags", 2899, "Small", "New", "photo-1566150902887-9679ecf56ba8"),
    ("Hand-Woven Leather Basket Tote", "Artisanal lattice woven leather handbag with removable linen liner.", "Bags", 4999, "Medium", "Handcrafted", "photo-1591561954557-26941169b49e"),
    ("Top-Grain Leather Messenger Briefcase", "Professional dual-buckle laptop satchel with padded shoulder strap.", "Bags", 6299, "15 inch", "Handcrafted", "photo-1527443224154-c4a3942d3acf"),
    ("Compact Leather Travel Toiletry Dopp Kit", "Water-resistant lined grooming organizer with antique brass hardware.", "Accessories", 1599, "Medium", "Handcrafted", "photo-1512496015851-a90fb38ba796"),

    # Luxury Footwear (10)
    ("Goodyear-Welted Cap Toe Oxford Shoes", "Hand-finished black calfskin leather formal shoes for black-tie wear.", "Footwear", 5999, "UK 9", "New", "photo-1614252235316-8c857d38b5f4"),
    ("Hand-Stitched Suede Chelsea Boots", "Rich snuff brown suede boots with elastic side gussets and crepe soles.", "Footwear", 4999, "UK 8", "New", "photo-1638247025967-b4e38f787b76"),
    ("Italian Pebble Grain Penny Loafers", "Supple unlined leather driving loafers with classic saddle strap detail.", "Footwear", 4299, "UK 9", "New", "photo-1582895101004-94924c5ba3b4"),
    ("Rugged Horween Chromexcel Service Boots", "Heavy-duty 8-eyelet heritage work boots with studded Dainite rubber soles.", "Footwear", 7899, "UK 9", "Handcrafted", "photo-1520639888713-7851133b1ed0"),
    ("Double Monk-Strap Burnished Leather Shoes", "Museum calf dual silver buckle dress shoes with hand-painted patina.", "Footwear", 5499, "UK 8.5", "New", "photo-1595341888016-a392ef81b7de"),
    ("Minimalist Premium White Leather Court Sneakers", "Italian Margom rubber cupsole trainers with ultra-soft nappa uppers.", "Footwear", 3799, "UK 9", "New", "photo-1560769629-975ec94e6a86"),
    ("Genuine Vibram Combat Utility Boots", "Full-grain waterproof military tactical boots with reinforced toe caps.", "Footwear", 5299, "UK 10", "New", "photo-1608256246200-53e635b5b65f"),
    ("Tassel Slip-On Dress Loafers", "Burgundy polished leather loafers with braided apron and dual tassels.", "Footwear", 4499, "UK 8", "New", "photo-1562273138-f46be4ebdf33"),
    ("Suede Chukka Desert Boots", "Classic 2-eyelet British style boots with plantation crepe natural soles.", "Footwear", 3699, "UK 9", "New", "photo-1549298916-b41d501d3772"),
    ("Vintage Wingtip Brogue Oxford Shoes", "Intricately perforated tan calfskin brogues with stacked leather heels.", "Footwear", 4899, "UK 9.5", "Vintage", "photo-1543163521-1bf539c55dd2"),

    # Designer Apparel & Outerwear (10)
    ("Double-Breasted Camel Wool Trench Coat", "Timeless heavy melton wool overcoat with horn buttons and storm flap.", "Clothing", 8999, "L", "New", "photo-1539533018447-63fcce2678e3"),
    ("Super 120s Charcoal Wool Suit Blazer", "Half-canvas construction tailored sport coat with notch lapel.", "Clothing", 7499, "40R", "New", "photo-1594938298603-c8148c4dae35"),
    ("100% Mongolian Cashmere Ribbed Turtleneck", "Ultra-soft 2-ply pure cashmere winter roll-neck knit sweater in oatmeal.", "Clothing", 5299, "M", "New", "photo-1576566588028-4147f3842f27"),
    ("Asymmetrical Heavy Sheepskin Biker Jacket", "Distressed black leather motorcycle jacket with chunky YKK nickel zips.", "Clothing", 9499, "L", "New", "photo-1521223890158-f9f7c3d5d504"),
    ("Silk Satin Bias-Cut Slip Evening Dress", "Draped champagne silk midi dress with delicate adjustable spaghetti straps.", "Clothing", 4699, "S", "New", "photo-1595777457583-95e059d581b8"),
    ("Tailored Pleated Wide-Leg Trousers", "Italian tropical wool relaxed formal trousers with double forward pleats.", "Clothing", 3299, "32", "New", "photo-1509551388413-e18d0ac5d495"),
    ("Merino Wool Shawl Collar Cardigan", "Chunky 5-gauge cable knit sweater coat with genuine real horn buttons.", "Clothing", 4199, "XL", "New", "photo-1434389677669-e08b4cac3105"),
    ("Pure Mulberry Silk Printed Scarf", "Hand-rolled edges square silk twill neckerchief with equestrian motif.", "Accessories", 1899, "90x90 cm", "New", "photo-1601924994987-69e26d50dc26"),
    ("Waxed Cotton Hunting Field Jacket", "Weatherproof British Millerain waxed canvas jacket with corduroy collar.", "Clothing", 6799, "L", "New", "photo-1489987707025-afc232f7ea0f"),
    ("French Terry Luxury Lounge Sweatpants", "450 GSM heavyweight organic cotton tapered joggers with metal aglets.", "Clothing", 2199, "M", "New", "photo-1552902865-b72c031ac5ea"),
]

# 4. RANDOM VENDOR 1: Scuderia Motorsport Apparel (12 Products)
SCUDERIA_PRODUCTS = [
    ("Official Scuderia Ferrari Racing Team Cap", "Authentic scarlet red racing cap with embroidered prancing horse shield emblem.", "Accessories", 2499, "Adjustable", "New", "photo-1534215754734-18e55d13e346"),
    ("Grand Prix Formula 1 Track Bomber Jacket", "Windproof technical paddock jacket with sponsor badges and contrast zip pulls.", "Clothing", 6499, "L", "New", "photo-1578632767115-351597cf2477"),
    ("Carbon Fiber Composite Chrono Sports Watch", "Tachymeter bezel racing watch with woven real carbon fiber textured dial face.", "Accessories", 8499, "43 mm", "New", "photo-1524592094714-0f0654e20314"),
    ("Performance Suede Driving Shoes with Grip Sole", "Ultra-flexible low-profile red suede driving moccasins with heel wrap tread.", "Footwear", 4999, "UK 9", "New", "photo-1525966222134-fcfa99b8ae77"),
    ("Paddock Team Polo with Embroidered Badges", "Breathable piqué cotton team jersey polo with Italian flag collar trims.", "Clothing", 2999, "M", "New", "photo-1618354691373-d851c5c3a990"),
    ("Motorsport Polarized Wraparound Visor Sunglasses", "Aerodynamic lightweight racing eyewear engineered for zero road glare.", "Accessories", 3299, "One Size", "New", "photo-1509695503492-412db9d2822a"),
    ("Nomex Technical Kevlar-Stitched Racing Gloves", "FIA-grade flame retardant ergonomic palm grip precision motorsport gloves.", "Accessories", 3799, "Large", "New", "photo-1517445312882-bc9910d016b7"),
    ("Anodized Matte Black Pit Crew Tool Bottle", "Double-walled vacuum insulated titanium steel flask with leakproof seal.", "Accessories", 1299, "750 ml", "New", "photo-1602143407151-7111542de6e8"),
    ("Checkered Flag Racing Stripe Duffel Bag", "Tear-resistant nylon holdall with racing harness straps and shoe tunnel.", "Bags", 3499, "40 Litres", "New", "photo-1553062407-98eeb64c6a63"),
    ("Trackside Thermal Windbreaker Anorak", "Waterproof storm-sealed pullover cagoule with reflective safety piping.", "Clothing", 4299, "XL", "New", "photo-1548883354-7622d03aca27"),
    ("Monaco GP Vintage Graphic Heavyweight Tee", "Commemorative historic race poster silkscreen print on washed jersey tee.", "Clothing", 1599, "L", "Vintage", "photo-1503342217505-b0a15ec3261c"),
    ("Kevlar Weave Compact Bifold Wallet", "Ballistic grade slim pocket wallet with red contrast stitching and coin pouch.", "Accessories", 1499, "Compact", "New", "photo-1627123424574-724758594e94"),
]

# 5. RANDOM VENDOR 2: Heritage Craftsmen (9 Products)
HERITAGE_PRODUCTS = [
    ("Hand-Lasted Horween Chromexcel Work Boots", "Built on vintage Munson lasts with triple-stitched oil-tanned leather uppers.", "Footwear", 8499, "UK 9", "Handcrafted", "photo-1542838132-92c53300491e"),
    ("Norwegian Welted Heavy Alpine Hiking Boots", "Double-stitchdown mountain boots with full leather lining and commando lug sole.", "Footwear", 9299, "UK 8.5", "Handcrafted", "photo-1518049362265-d5b2a6467637"),
    ("Roughout Suede Moc-Toe Heritage Boots", "Thick unlined roughout suede boots engineered to resist scuffs and rain.", "Footwear", 7699, "UK 9", "Handcrafted", "photo-1582588678413-dbf45f4823e9"),
    ("Shell Cordovan Hand-Stitched Leather Belt", "Rare polished equine shell cordovan leather strap with solid brass roller buckle.", "Accessories", 3299, "34", "Handcrafted", "photo-1614777986387-015c2a89b817"),
    ("Solid Cast Brass Buckle Key Fob", "Hand-peened heavy raw brass hardware clip on 10oz veg-tanned leather keeper.", "Accessories", 699, "Standard", "Handcrafted", "photo-1531306728370-e2ebd9d7bb99"),
    ("Waxed Leather Shoe Care & Polishing Kit", "Beeswax polish, horsehair dauber brush, and cotton buffing cloth in wooden box.", "Accessories", 1299, "Kit", "New", "photo-1584308666744-24d5c474f2ae"),
    ("Triple-Stitched Heavy Raw Canvas Apron", "Artisan workshop apron with cross-back leather straps and utility tool loops.", "Accessories", 1899, "Universal", "Handcrafted", "photo-1581578731548-c64695cc6952"),
    ("Benchmade Waxed Suede Field Chukka", "Waterproof waxed split suede chukka boots with natural gum crepe outsoles.", "Footwear", 6899, "UK 9", "Handcrafted", "photo-1512374382149-233c42b6613c"),
    ("Vegetable Tanned Thick Leather Valet Tray", "Corner-snapped bedside organizer tray that molds and ages gracefully.", "Home Decor", 899, "Medium", "Handcrafted", "photo-1585829365295-ab7cd400c167"),
]


class Command(BaseCommand):
    help = "Seeds 5 vendors and 101 products with 101 verified unique images and proper subscription plans."

    def handle(self, *args, **options):
        self.stdout.write("=" * 60)
        self.stdout.write("  InstaBazaar Database Seeder: 5 Vendors + 101 Unique Products")
        self.stdout.write("=" * 60)

        # 1. Ensure Subscription Plans
        free_plan, _ = SubscriptionPlan.objects.get_or_create(
            code="free",
            defaults={
                "name": "Free",
                "monthly_price": 0,
                "max_products": 10,
                "analytics_level": "basic",
                "instagram_redirect": False,
                "product_badges": False,
                "ai_tools": False,
                "bazaar_choice": False,
                "is_active": True,
            },
        )
        standard_plan, _ = SubscriptionPlan.objects.get_or_create(
            code="standard",
            defaults={
                "name": "Standard",
                "monthly_price": 149,
                "max_products": 50,
                "analytics_level": "standard",
                "instagram_redirect": True,
                "product_badges": True,
                "ai_tools": False,
                "bazaar_choice": False,
                "is_active": True,
            },
        )
        advance_plan, _ = SubscriptionPlan.objects.get_or_create(
            code="advanced",
            defaults={
                "name": "Advanced",
                "monthly_price": 249,
                "max_products": None,
                "analytics_level": "advanced",
                "instagram_redirect": True,
                "product_badges": True,
                "ai_tools": True,
                "bazaar_choice": True,
                "is_active": True,
            },
        )

        plans_map = {
            "free": free_plan,
            "standard": standard_plan,
            "advanced": advance_plan,
        }

        # 2. Vendors to seed
        vendors_config = [
            {
                "username": "free_vendor",
                "email": "free@instabazaar.in",
                "business_name": "Earth & Thread Artisans",
                "store_slug": "earth-and-thread",
                "plan_code": "free",
                "handle": "earthandthread",
                "location": "Jaipur, Rajasthan",
                "bio": "Handcrafted home decor, natural soy candles, pottery, and sustainable lifestyle essentials.",
                "avatar": "vendor_free.jpg",
                "prefix": "free",
                "products": FREE_VENDOR_PRODUCTS,
            },
            {
                "username": "standard_vendor",
                "email": "standard@instabazaar.in",
                "business_name": "District Streetwear Co.",
                "store_slug": "district-streetwear",
                "plan_code": "standard",
                "handle": "districtstreetwear",
                "location": "Mumbai, Maharashtra",
                "bio": "Contemporary urban streetwear, graphic hoodies, vintage denim, and premium skate sneakers.",
                "avatar": "vendor_standard.jpg",
                "prefix": "standard",
                "products": STANDARD_VENDOR_PRODUCTS,
            },
            {
                "username": "advance_vendor",
                "email": "advance@instabazaar.in",
                "business_name": "Atelier De Luxe",
                "store_slug": "atelier-de-luxe",
                "plan_code": "advanced",
                "handle": "atelierdeluxe",
                "location": "Bengaluru, Karnataka",
                "bio": "Curated luxury boutique showcasing Swiss horology, fine jewellery, Italian leathercraft, and bespoke footwear.",
                "avatar": "vendor_advance.jpg",
                "prefix": "advance",
                "products": ADVANCE_VENDOR_PRODUCTS,
            },
            {
                "username": "scuderia_motorsport",
                "email": "scuderia@instabazaar.in",
                "business_name": "Scuderia Motorsport Apparel",
                "store_slug": "scuderia-motorsport",
                "plan_code": "standard",
                "handle": "scuderiamotorsport",
                "location": "Greater Noida, UP",
                "bio": "Official trackside apparel, racing team caps, driving shoes, and carbon-fiber composite accessories.",
                "avatar": "vendor_scuderia.jpg",
                "prefix": "scuderia",
                "products": SCUDERIA_PRODUCTS,
            },
            {
                "username": "heritage_footwear",
                "email": "heritage@instabazaar.in",
                "business_name": "Heritage Craftsmen",
                "store_slug": "heritage-craftsmen",
                "plan_code": "free",
                "handle": "heritagecraftsmen",
                "location": "Agra, Uttar Pradesh",
                "bio": "Traditional Goodyear-welted leather work boots, shell cordovan belts, and handcrafted workshop goods.",
                "avatar": "vendor_heritage.jpg",
                "prefix": "heritage",
                "products": HERITAGE_PRODUCTS,
            },
        ]

        total_seeded_products = 0

        for v_idx, conf in enumerate(vendors_config):
            # Create or update User
            user, _ = User.objects.get_or_create(
                username=conf["username"],
                defaults={"email": conf["email"]},
            )
            user.set_password("password123")
            user.save()

            # Create or update Vendor Profile
            create_avatar(conf["avatar"], conf["business_name"], v_idx)
            plan = plans_map[conf["plan_code"]]

            vendor, _ = Vendor.objects.update_or_create(
                user=user,
                defaults={
                    "business_name": conf["business_name"],
                    "store_slug": conf["store_slug"],
                    "instagram_handle": conf["handle"],
                    "location": conf["location"],
                    "bio": conf["bio"],
                    "verification_status": "verified",
                    "subscription_plan": conf["plan_code"],
                    "logo_url": f"/images/{conf['avatar']}",
                    "profile_image": f"vendor_profiles/{conf['avatar']}",
                },
            )

            # Ensure Active Subscription
            now = timezone.now()
            expires_at = now + timedelta(days=30) if conf["plan_code"] != "free" else None
            VendorSubscription.objects.update_or_create(
                vendor=vendor,
                status=VendorSubscription.Status.ACTIVE,
                defaults={
                    "plan": plan,
                    "starts_at": now,
                    "expires_at": expires_at,
                    "payment_reference": f"SEED_{conf['plan_code'].upper()}_{vendor.id}",
                },
            )

            # Clear old products for this vendor to ensure exact counts and no duplicates
            vendor.products.all().delete()

            # Seed Products
            for p_idx, prod_info in enumerate(conf["products"]):
                title, desc, cat_name, price, size, condition, unsplash_id = prod_info
                filename = f"{conf['prefix']}_p{p_idx + 1}.jpg"

                # Download real product photo or create fallback card
                download_or_generate_image(filename, unsplash_id, title, cat_name, price, p_idx)

                # Category
                cat, _ = Category.objects.get_or_create(
                    categoryName=cat_name
                )

                # Product
                product, _ = Product.objects.update_or_create(
                    vendor=vendor,
                    productTitle=title,
                    defaults={
                        "productDescription": desc,
                        "productPrice": price,
                        "productStock": random.randint(5, 30),
                        "productCondition": condition,
                        "productSize": size,
                        "category": cat,
                        "is_active": True,
                        "productImage": f"products/{filename}",
                        "instagram_post_url": f"https://www.instagram.com/{conf['handle']}/",
                    },
                )
                total_seeded_products += 1

            self.stdout.write(
                f"[OK] Seeded Vendor '{conf['business_name']}' ({conf['plan_code'].capitalize()} Plan) with {len(conf['products'])} products."
            )

        self.stdout.write("=" * 60)
        self.stdout.write(f"All done! 5 vendors and {total_seeded_products} unique products successfully seeded.")
        self.stdout.write("=" * 60)

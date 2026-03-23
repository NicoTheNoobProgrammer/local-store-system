# 🔑 Complete Cheat Sheet - Local Store System

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Authentication Flow](#authentication-flow)
6. [API Endpoints](#api-endpoints)
7. [Key Components](#key-components)
8. [How Everything Works](#how-everything-works)
9. [Environment Setup](#environment-setup)
10. [Deployment](#deployment)

---

## 📱 Project Overview

**What is it?** A local marketplace where:
- **Buyers** can browse stores and products from their area
- **Sellers** can create stores and manage products
- Users can add items to cart and checkout
- Real-time chat between buyers and sellers
- Product recommendations based on purchases
- Store location mapping

**Main Features:**
- User authentication (signup/login/logout)
- Store and product management
- Shopping cart system
- Order management
- User ratings and reviews
- Conversation/chat system
- Seller dashboard
- Dark mode toggle

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 16.1.7 (React 19.2.3)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + PostCSS
- **Icons:** Lucide React
- **State Management:** React hooks (useState, useEffect)
- **Routing:** Next.js App Router

### Backend
- **API Framework:** Next.js API Routes
- **ORM:** Prisma 5.22.0
- **Database:** PostgreSQL 18 (Render)
- **Authentication:** Cookies + localStorage

### Deployment
- **Frontend:** Vercel
- **Database:** Render (PostgreSQL)
- **Git:** GitHub (NicoTheNoobProgrammer/local-store-system)

---

## 📁 Project Structure

```
local-store-system/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Homepage (store listing)
│   │   ├── layout.tsx               # Root layout with navbar
│   │   ├── globals.css              # Global styles
│   │   ├── login/
│   │   │   └── page.tsx             # Login form
│   │   ├── signup/
│   │   │   └── page.tsx             # Signup form
│   │   ├── cart/
│   │   │   └── page.tsx             # Shopping cart
│   │   ├── dashboard/
│   │   │   ├── page.tsx             # Seller dashboard
│   │   │   ├── DashboardClient.tsx  # Dashboard client component
│   │   │   └── add-product/
│   │   │       └── page.tsx         # Add product form
│   │   ├── stores/
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Store detail page
│   │   ├── map/
│   │   │   ├── page.tsx             # Map view
│   │   │   └── MapComponent.tsx     # Map component
│   │   └── api/                     # API routes
│   │       ├── signup/route.ts
│   │       ├── login/route.ts
│   │       ├── logout/route.ts
│   │       ├── cart/* 
│   │       ├── products/*
│   │       ├── orders/*
│   │       ├── chat/route.ts
│   │       ├── recommend/route.ts
│   │       └── stores/*
│   ├── components/
│   │   ├── UserGreeting.tsx         # User display + logout
│   │   ├── NavAuth.tsx              # Login/signup links
│   │   ├── ProductCard.tsx          # Product display
│   │   ├── AddToCartButton.tsx      # Add to cart action
│   │   ├── FloatingCart.tsx         # Floating cart icon
│   │   ├── ChatBot.tsx              # Chat interface
│   │   ├── ConversationAI.tsx       # AI chat component
│   │   ├── Rating.tsx               # Star rating
│   │   ├── Recommendations.tsx      # Recommended products
│   │   ├── ThemeToggle.tsx          # Dark mode toggle
│   │   ├── WishlistButton.tsx       # Wishlist feature
│   │   ├── ImageInput.tsx           # Image upload
│   │   └── MapComponent.tsx         # Map display
│   ├── lib/
│   │   ├── prisma.ts                # Prisma client
│   │   ├── auth.ts                  # Auth utilities
│   │   └── conversationAI.ts        # AI chat logic
│   └── middleware.ts                # Next.js middleware
├── prisma/
│   ├── schema.prisma                # Database schema (all models)
│   ├── seed.ts                      # Database seed script
│   └── migrations/                  # Database migration history
├── public/
│   └── favicon.ico
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.mjs
└── .env.local                       # Local environment variables
```

---

## 💾 Database Schema

### Prisma Models Overview

#### 1. **User Model**
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  username  String    @unique
  password  String
  role      Role      @default(USER)  // USER or SELLER
  createdAt DateTime  @default(now())
  
  // Relations
  stores    Store[]
  cart      Cart[]
  orders    Order[]
  ratings   Rating[]
  messages  ConversationMessage[]
}
```

**What it does:** Stores user accounts with email/password authentication

---

#### 2. **Store Model**
```prisma
model Store {
  id        String    @id @default(cuid())
  name      String
  userId    String    // Owner (Seller)
  category  String
  products  Product[]
  
  // Relations
  user      User      @relation(fields: [userId], references: [id])
}
```

**What it does:** Represents a seller's store

---

#### 3. **Product Model**
```prisma
model Product {
  id           String   @id @default(cuid())
  name         String
  description  String
  price        Float
  storeId      String
  store        Store    @relation(fields: [storeId], references: [id])
  image        String   @db.Text  // Base64 image
  cartItems    CartItem[]
  orderItems   OrderItem[]
  ratings      Rating[]
}
```

**What it does:** Products sold by stores

---

#### 4. **Cart & CartItem Models**
```prisma
model Cart {
  id    String     @id @default(cuid())
  userId String   @unique
  user   User     @relation(fields: [userId], references: [id])
  items  CartItem[]
}

model CartItem {
  id        String  @id @default(cuid())
  cartId    String
  productId String
  quantity  Int
  cart      Cart    @relation(fields: [cartId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}
```

**What it does:** Shopping cart system

---

#### 5. **Order Models**
```prisma
model Order {
  id        String      @id @default(cuid())
  userId    String
  user      User        @relation(fields: [userId], references: [id])
  email     String
  phone     String
  status    OrderStatus @default(PENDING)  // PENDING, CONFIRMED, SHIPPED, DELIVERED
  items     OrderItem[]
  createdAt DateTime    @default(now())
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Float
  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}
```

**What it does:** Order management system

---

#### 6. **Rating Model**
```prisma
model Rating {
  id        String  @id @default(cuid())
  userId    String
  productId String
  score     Int     // 1-5 stars
  comment   String
  user      User    @relation(fields: [userId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}
```

**What it does:** Product reviews and ratings

---

#### 7. **Conversation Models** (Chat System)
```prisma
model ConversationSession {
  id        String                  @id @default(cuid())
  userId    String
  messages  ConversationMessage[]
}

model ConversationMessage {
  id            String               @id @default(cuid())
  sessionId     String
  userId        String
  sender        String               // "user" or "ai"
  content       String               @db.Text
  createdAt     DateTime             @default(now())
  
  session       ConversationSession  @relation(fields: [sessionId], references: [id])
  user          User                 @relation(fields: [userId], references: [id])
}
```

**What it does:** Real-time chat conversations

---

#### 8. **Enums**
```prisma
enum Role {
  USER    // Buyer
  SELLER  // Store owner
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
}
```

---

## 🔐 Authentication Flow

### **Signup Process**

```
User fills signup form
    ↓
POST /api/signup with { email, username, password, role }
    ↓
Prisma creates User in PostgreSQL
    ↓
HTTP response with user object
    ↓
localStorage.setItem("user", JSON.stringify(userData))
    ↓
Redirect to / (homepage) or /dashboard (if seller)
```

**Key Code:** `src/app/signup/page.tsx` → `src/app/api/signup/route.ts`

---

### **Login Process**

```
User fills login form with { email, password, role }
    ↓
POST /api/login with credentials
    ↓
Server queries database for User with email
    ↓
Validates password matches
    ↓
Checks role matches selected role
    ↓
Sets HTTP cookie with userId
    ↓
Returns user object
    ↓
localStorage.setItem("user", JSON.stringify(userData))
    ↓
router.push("/") for BUYER or router.push("/dashboard") for SELLER
```

**Key Code:** `src/app/login/page.tsx` → `src/app/api/login/route.ts`

---

### **Logout Process**

```
User clicks Logout button (in navbar UserGreeting component)
    ↓
POST /api/logout (clears server-side cookie)
    ↓
localStorage.removeItem("user")
    ↓
router.push("/login")
```

**Key Code:** `src/components/UserGreeting.tsx` → `src/app/api/logout/route.ts`

---

## 🌐 API Endpoints

### Authentication Endpoints

| Method | Route | Body | Returns | Purpose |
|--------|-------|------|---------|---------|
| POST | `/api/signup` | `{email, username, password, role}` | User object | Create new account |
| POST | `/api/login` | `{email, password}` | User object + role check | Authenticate user |
| POST | `/api/logout` | - | Success message | Clear session |

### Product Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/products` | Get all products |
| POST | `/api/product/create` | Create new product (seller) |
| DELETE | `/api/products/delete` | Delete product |

### Store Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/stores` | Get all stores |
| POST | `/api/stores` | Create store (seller) |
| DELETE | `/api/stores/delete` | Delete store |

### Cart Endpoints

| Method | Route | Body | Purpose |
|--------|-------|------|---------|
| GET | `/api/cart` | - | Get user's cart |
| POST | `/api/cart` | `{productId, quantity}` | Add to cart |
| PUT | `/api/cart/update` | `{productId, quantity}` | Update quantity |
| DELETE | `/api/cart/clear` | - | Clear entire cart |

### Order Endpoints

| Method | Route | Body | Purpose |
|--------|-------|------|---------|
| GET | `/api/orders` | - | Get user's orders |
| POST | `/api/checkout` | `{items[], email, phone}` | Create order from cart |

### Other Endpoints

| Route | Purpose |
|-------|---------|
| `/api/chat` | Chat messages (AI) |
| `/api/recommend` | Product recommendations |
| `/api/user` | Get current user info |
| `/api/dashboard` | Seller dashboard data |

---

## 🎨 Key Components

### **UserGreeting.tsx**
- **Location:** `src/components/UserGreeting.tsx`
- **Purpose:** Display logged-in user info & logout button
- **Props:** None (reads from localStorage)
- **Features:**
  - Gets user from localStorage on mount
  - Shows `Welcome, [username] (Buyer/Seller)`
  - Logout button with loading state (prevents double-logout)
  - Returns null if not logged in

### **NavAuth.tsx**
- **Location:** `src/components/NavAuth.tsx`
- **Purpose:** Show Login/Signup links when not logged in
- **Logic:** Returns null if user is logged in (checked in localStorage)

### **ProductCard.tsx**
- **Purpose:** Display individual product in grid
- **Shows:** Product image, name, price, store category
- **Actions:** "View Store" button

### **AddToCartButton.tsx**
- **Purpose:** Add product to shopping cart
- **Calls:** POST `/api/cart` with productId and quantity

### **FloatingCart.tsx**
- **Purpose:** Floating cart icon in bottom-right (always visible)
- **Shows:** Item count badge
- **Action:** Link to `/cart` page

### **ChatBot.tsx & ConversationAI.tsx**
- **Purpose:** Real-time chat with AI
- **Calls:** POST `/api/chat` with message
- **Stores:** Messages in Prisma ConversationMessage table

### **ThemeToggle.tsx**
- **Purpose:** Dark mode toggle button
- **Logic:** Uses CSS class toggling and localStorage

### **Rating.tsx**
- **Purpose:** Star rating display/input
- **Shows:** 1-5 star rating with optional comment

### **Recommendations.tsx**
- **Purpose:** Show recommended products
- **Calls:** GET `/api/recommend`
- **Logic:** Based on user purchase history

---

## 🔄 How Everything Works Together

### **Homepage Flow (`page.tsx`)**
```
Homepage loads
    ↓
useEffect fetches /api/stores
    ↓
Stores display in 3-column grid
    ↓
User can search by store name
    ↓
Click "View Store" → Navigate to /stores/[id]
```

### **Store Detail Page (`stores/[id]/page.tsx`)**
```
Load specific store with [id]
    ↓
Fetch products for that store
    ↓
Show store name, products in grid
    ↓
Each product shows: image, name, price, rating
    ↓
User can:
  - View product details
  - Add to cart
  - Rate product
  - Search products in store
```

### **Shopping Flow**
```
Browse stores/products
    ↓
Click "Add to Cart"
    ↓
POST /api/cart (adds CartItem to DB)
    ↓
Floating cart shows updated count
    ↓
Navigate to /cart
    ↓
See all cart items with quantities
    ↓
Update quantities or remove items
    ↓
Click Checkout
    ↓
Enter email & phone
    ↓
POST /api/checkout
    ↓
Create Order + OrderItems in database
    ↓
Clear cart
    ↓
Show order confirmation
```

### **Seller Dashboard Flow (`dashboard/`)**
```
Seller logs in with role = SELLER
    ↓
Redirect to /dashboard
    ↓
Display all their stores and products
    ↓
Click "Add Product"
    ↓
Fill form: name, price, description, image
    ↓
POST /api/product/create
    ↓
Product added to Prisma
    ↓
Dashboard updates with new product
```

### **Chat/Conversation Flow**
```
User clicks chat icon
    ↓
ConversationAI component opens
    ↓
User types message
    ↓
Send to POST /api/chat
    ↓
Server processes with AI
    ↓
Response saved to ConversationMessage table
    ↓
Message displays in chat UI
    ↓
Conversation stored for history
```

---

## 🔧 Environment Setup

### **PostgreSQL Connection (Render)**

**Live Database URL (Production):**
```
postgresql://[user]:[password]@ohio-postgres.render.com:5432/local_store_system
```

**Local Database URL (.env.local):**
```
DATABASE_URL="postgresql://postgres@localhost:5432/local-store-system"
```

### **Running Migrations**

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# View database
npx prisma studio

# Create new migration (if schema changes)
npx prisma migrate dev --name descriptive_name
```

### **Seeding Database**

```bash
npx prisma seed
```

---

## 🚀 Deployment

### **Vercel (Frontend)**

1. **Connect GitHub:** https://github.com/NicoTheNoobProgrammer/local-store-system
2. **Environment Variables in Vercel Dashboard:**
   ```
   DATABASE_URL=postgresql://[user]:[password]@ohio-postgres.render.com:5432/local_store_system
   ```
3. **Build Command:** 
   ```
   prisma generate && prisma migrate deploy && next build
   ```
4. **Auto-deploys on:** Git push to master branch

### **Render (PostgreSQL)**

1. **Database URL:** `postgresql://[user]:[password]@ohio-postgres.render.com:5432/local_store_system`
2. **Region:** Ohio
3. **Provided:** All table migrations auto-run via `prisma migrate deploy`

### **GitHub**

- **Repo:** https://github.com/NicoTheNoobProgrammer/local-store-system
- **Branch:** master
- **Commits show:** All changes, fixes, and features added

---

## 📝 Key Code Patterns

### **Fetch with Error Handling**
```typescript
try {
  const res = await fetch("/api/endpoint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }

  const data = await res.json();
  return data;
} catch (error) {
  console.error(error);
  alert("Error occurred");
}
```

### **Prisma Query Pattern**
```typescript
const user = await prisma.user.findUnique({
  where: { email: "test@example.com" }
});

const products = await prisma.product.findMany({
  where: { storeId: storeId },
  include: { ratings: true }
});
```

### **Next.js API Route Pattern**
```typescript
// src/app/api/endpoint/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Process...
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
```

---

## 🐛 Common Issues & Solutions

### **Login Not Redirecting**
- **Issue:** `await router.push()` doesn't return a resolvable Promise
- **Solution:** Remove `await`, just call `router.push("/")` directly

### **Duplicate Logouts**
- **Issue:** Multiple logout buttons or double-click issues
- **Solution:** Use `loggingOut` state to disable button during logout

### **Prisma TypeErrors**
- **Issue:** "@db.LongText not supported for PostgreSQL"
- **Solution:** Replace with `@db.Text` (supports unlimited length)

### **Migrations Not Running**
- **Issue:** "Table does not exist" on production
- **Solution:** Ensure build command includes `prisma migrate deploy`

### **localStorage Not Persisting**
- **Issue:** User data disappears on page reload
- **Solution:** Check useEffect runs on component mount and reads from localStorage

---

## 📊 User Roles & Permissions

### **USER (Buyer)**
- ✅ Browse stores and products
- ✅ Add products to cart
- ✅ Create orders
- ✅ Rate products
- ✅ Chat with AI
- ❌ Cannot create stores
- ❌ Cannot access /dashboard

### **SELLER (Store Owner)**
- ✅ Create and manage stores
- ✅ Add products to store
- ✅ Edit/delete products
- ✅ Access /dashboard for analytics
- ✅ Browse other stores
- ❌ Cannot access /dashboard as different user

---

## 💡 Quick Interview Answers

**Q: How does authentication work?**
A: Users signup with email/password/role, credentials stored in PostgreSQL, login validates credentials and saves user object to localStorage. Logout clears localStorage.

**Q: How is the database structured?**
A: PostgreSQL with Prisma ORM. Key tables: Users, Stores, Products, Carts, Orders, Ratings, ConversationSessions/Messages.

**Q: How does the shopping cart work?**
A: Cart table per user. CartItems contain productId + quantity. POST /api/cart adds items, DELETE /api/cart/clear empties it before checkout.

**Q: What's the difference between USER and SELLER roles?**
A: Users browse and buy. Sellers create stores, manage inventory, access /dashboard analytics.

**Q: How does deployment work?**
A: GitHub master branch → Vercel auto-deploys → runs migrations → builds Next.js → Render PostgreSQL gets data.

**Q: How do you handle sessions?**
A: HTTP cookies store userId on server, localStorage stores full user object on client for frontend logic.

**Q: What prevents duplicate logouts?**
A: `loggingOut` state variable disables button during logout process, prevents multiple clicks.

---

## 🎯 File You Must Know

| File | Why Important |
|------|---------------|
| `prisma/schema.prisma` | Defines all database tables & relationships |
| `src/app/api/signup/route.ts` | User account creation |
| `src/app/api/login/route.ts` | User authentication |
| `src/app/page.tsx` | Main homepage with store listing |
| `src/app/login/page.tsx` | Login form & redirect logic |
| `src/app/signup/page.tsx` | Registration form |
| `src/components/UserGreeting.tsx` | User display & logout |
| `src/app/dashboard/page.tsx` | Seller dashboard |
| `.env.local` | Database connection string |
| `package.json` | Dependencies & build scripts |

---

## 🎓 Good Luck with Your Interview!

Your project demonstrates:
- ✅ Full-stack development (React + Node.js)
- ✅ Database design and management (Prisma + PostgreSQL)
- ✅ Authentication & security
- ✅ API design & REST principles
- ✅ Component-based architecture
- ✅ Type safety (TypeScript)
- ✅ Real-world deployment (Vercel + Render)

Focus on explaining **why** you made design choices, not just **what** you built!

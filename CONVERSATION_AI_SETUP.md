# 🤖 Conversational AI Setup Guide

## Overview
The marketplace now includes an advanced **Conversational AI Assistant** that:
- ✅ Remembers conversation history across sessions
- ✅ Helps sellers manage stores and products
- ✅ Tracks orders for buyers
- ✅ Uses external LLM APIs (with local data integration)

---

## Step 1: Choose Your LLM Provider

### Option A: Google Gemini (⭐ Recommended - Free Tier Available)
**Pros:** Very cheap (~$0-3/month), fast, good quality  
**Cons:** Slightly less powerful than GPT-4

**Setup:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and add to `.env.local`:
   ```
   GEMINI_API_KEY=your_key_here
   LLM_PROVIDER=gemini
   ```

### Option B: OpenAI (Premium Quality)
**Pros:** Best quality (GPT-4o), most powerful  
**Cons:** Paid (~$5-15/month for moderate use)

**Setup:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an API key
3. Add to `.env.local`:
   ```
   OPENAI_API_KEY=your_key_here
   LLM_PROVIDER=openai
   ```

---

## Step 2: Update Environment Variables

Edit or create `.env.local` in project root:

```bash
# === EXISTING VARS ===
DATABASE_URL="mysql://root:password@localhost:3306/local_store"

# === LLM CONFIGURATION ===
# Choose one: "gemini" or "openai"
LLM_PROVIDER=gemini

# Google Gemini API Key (if using gemini provider)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# OR OpenAI API Key (if using openai provider)
# OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Step 3: Database Migration (Already Done ✅)

The following tables were created:
- `ConversationSession` - Stores conversation sessions per user
- `ConversationMessage` - Stores individual messages with context

If you need to reset:
```bash
npx prisma migrate reset --force
npx ts-node prisma/seed.ts
```

---

## Step 4: Test the System

### Test 1: Start Dev Server
```bash
npm run dev
```

### Test 2: Open Browser
Navigate to: `http://localhost:3001`

### Test 3: Click Robot Button
Look for the 🤖 button in bottom-right corner

### Test 4: Send a Message
Try these prompts:

**For Buyers:**
- "Track my order"
- "Where's my delivery?"
- "Status of my recent order"

**For Sellers:**
- "Help me add a new product"
- "What's my sales insight?"
- "Manage my store inventory"
- "How can I increase sales?"

---

## Features Included

### 📦 Order Tracking (Buyers)
- Natural language queries like "Where's my order?"
- Automatic order lookup from database
- Shows order status, items, and store info

### 🏪 Seller Assistant (Sellers)
- Help managing products
- Store optimization tips
- Sales insights
- Pricing recommendations

### 💾 Conversation Memory
- All conversations saved to database
- Accessible across browser sessions
- Context-aware responses based on history
- User role detection (BUYER/SELLER)

### 🎯 Smart Intent Detection
- Automatically identifies what user wants
- Routes to appropriate handler:
  - `seller_assistant` - Store/product help
  - `order_tracking` - Order status
  - `product_discovery` - Finding items
  - `general` - General questions

---

## How It Works

```
┌─────────────────────────────────────────┐
│ 1. User sends message via UI            │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 2. API receives message & session ID    │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 3. Detect user intent & user role       │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 4. Fetch marketplace context from DB    │
│    (stores, products, orders, ratings)  │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 5. Retrieve conversation history (10)   │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 6. Call external LLM with full context  │
│    (Gemini or OpenAI)                   │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 7. Store response in database           │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 8. Return response to user              │
└─────────────────────────────────────────┘
```

---

## Cost Estimation

### Google Gemini
- **Free Tier:** 60 requests/minute, free
- **Paid:** $0.075 per 1M input tokens, $0.3 per 1M output tokens
- **Estimate:** $2-5/month for moderate use (500+ conversations)

### OpenAI GPT-3.5-turbo
- **Input:** $0.0005 per 1K tokens
- **Output:** $0.0015 per 1K tokens
- **Estimate:** $10-20/month for moderate use (500+ conversations)

---

## Files Created/Modified

### New Files:
- `/src/lib/conversationAI.ts` - Conversation logic & context building
- `/src/app/api/chat/route.ts` - Chat API endpoint with LLM integration
- `/src/components/ConversationAI.tsx` - UI component

### Modified Files:
- `prisma/schema.prisma` - Added ConversationSession & ConversationMessage tables
- `/src/app/layout.tsx` - Added ConversationAI component

### Database:
- Migration: `20260321092611_add_conversation_system`

---

## Troubleshooting

### "GEMINI_API_KEY not configured"
→ Add `GEMINI_API_KEY` to `.env.local`

### "No text in response"
→ Check your API key is valid and has quota remaining

### Messages not saving
→ Ensure database migration ran: `npx prisma migrate reset --force`

### Wrong LLM being called
→ Check `LLM_PROVIDER` in `.env.local` matches your API key

---

## Next Steps

1. ✅ Configure API key in `.env.local`
2. ✅ Restart dev server (`npm run dev`)
3. ✅ Click 🤖 button and start chatting
4. ✅ Monitor API usage in your provider dashboard

Enjoy your new conversational AI system! 🚀

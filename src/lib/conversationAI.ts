import { prisma } from "@/lib/prisma";

/**
 * CONVERSATION AI SYSTEM
 * Hybrid assistant for sellers, buyers, and order tracking
 * Stores conversation history and integrates with marketplace data
 */

export interface ConversationMessage {
  id: string;
  userId: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sessionId: string;
  context?: any;
}

export interface ConversationSession {
  id: string;
  userId: number;
  userRole: "BUYER" | "SELLER";
  title: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * INITIALIZE or RETRIEVE conversation session
 */
export async function getOrCreateSession(
  userId: number,
  userRole: "BUYER" | "SELLER",
  sessionId?: string
): Promise<ConversationSession> {
  try {
    // Try to find existing session
    if (sessionId) {
      const existing = await prisma.conversationSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { timestamp: "asc" } } },
      });

      if (existing && existing.userId === userId) {
        return {
          id: existing.id,
          userId: existing.userId,
          userRole: existing.userRole as "BUYER" | "SELLER",
          title: existing.title,
          messages: existing.messages as ConversationMessage[],
          createdAt: existing.createdAt,
          updatedAt: existing.updatedAt,
          isActive: existing.isActive,
        };
      }
    }

    // Create new session
    const newSession = await prisma.conversationSession.create({
      data: {
        userId,
        userRole,
        title: `${userRole} Chat - ${new Date().toLocaleDateString()}`,
        isActive: true,
      },
      include: { messages: true },
    });

    return {
      id: newSession.id,
      userId: newSession.userId,
      userRole: newSession.userRole as "BUYER" | "SELLER",
      title: newSession.title,
      messages: [],
      createdAt: newSession.createdAt,
      updatedAt: newSession.updatedAt,
      isActive: newSession.isActive,
    };
  } catch (error) {
    console.error("Session creation error:", error);
    throw error;
  }
}

/**
 * ADD message to conversation history
 */
export async function addMessage(
  sessionId: string,
  userId: number,
  role: "user" | "assistant",
  content: string,
  context?: any
): Promise<ConversationMessage> {
  try {
    const message = await prisma.conversationMessage.create({
      data: {
        sessionId,
        userId,
        role,
        content,
        context: context || {},
      },
    });

    return message as ConversationMessage;
  } catch (error) {
    console.error("Message creation error:", error);
    throw error;
  }
}

/**
 * GET conversation history (last N messages)
 */
export async function getConversationHistory(
  sessionId: string,
  limit: number = 20
): Promise<ConversationMessage[]> {
  try {
    const messages = await prisma.conversationMessage.findMany({
      where: { sessionId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return messages.reverse() as ConversationMessage[];
  } catch (error) {
    console.error("History retrieval error:", error);
    return [];
  }
}

/**
 * DETECT intent from user message
 * Returns: "seller_assistant" | "order_tracking" | "product_discovery" | "general"
 */
export function detectIntent(
  userMessage: string,
  userRole: "BUYER" | "SELLER"
): string {
  const msg = userMessage.toLowerCase();

  // Seller-specific intents
  if (userRole === "SELLER") {
    if (
      msg.match(
        /(add|create|list|new product|sell|inventory|stock|price|update)/
      )
    ) {
      return "seller_assistant";
    }
    if (msg.match(/(sales|revenue|analytics|insight|performance|stats)/)) {
      return "seller_assistant";
    }
  }

  // Order tracking intents (both roles)
  if (
    msg.match(
      /(where is my order|track|delivery|order status|when arrive|shipped)/
    )
  ) {
    return "order_tracking";
  }

  // Product discovery
  if (msg.match(/(find|search|looking for|recommend|suggest|product)/)) {
    return "product_discovery";
  }

  return "general";
}

/**
 * GET relevant context from database
 * Pulls seller orders, products, customer info, etc.
 */
export async function getMarketplaceContext(
  userId: number,
  userRole: "BUYER" | "SELLER",
  intent: string
): Promise<string> {
  try {
    let context = "";

    if (userRole === "SELLER" && intent === "seller_assistant") {
      // Get seller's stores and products
      const stores = await prisma.store.findMany({
        where: { ownerId: userId },
        include: {
          products: true,
        },
      });

      if (stores.length > 0) {
        context += `\n📍 YOUR STORES:\n`;
        stores.forEach((store) => {
          context += `- ${store.name} (${store.category}): ${store.products.length} products\n`;
        });
      }

      // Get recent orders
      const recentOrders = await prisma.order.findMany({
        where: {
          items: {
            some: {
              product: { store: { ownerId: userId } },
            },
          },
        },
        include: { items: true },
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      if (recentOrders.length > 0) {
        context += `\n📦 RECENT ORDERS:\n`;
        recentOrders.forEach((order) => {
          context += `- Order #${order.id}: ${order.status} (${order.items.length} items)\n`;
        });
      }
    } else if (userRole === "BUYER" && intent === "order_tracking") {
      // Get buyer's orders
      const myOrders = await prisma.order.findMany({
        where: { userId },
        include: { items: { include: { product: { include: { store: true } } } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      if (myOrders.length > 0) {
        context += `\n📦 YOUR ORDERS:\n`;
        myOrders.forEach((order) => {
          context += `- Order #${order.id}: ${order.status} (${order.items.length} items) - ${order.email}\n`;
          order.items.forEach((item: any) => {
            context += `  • ${item.product.name} x${item.quantity} from ${item.product.store.name}\n`;
          });
        });
      }
    }

    return context;
  } catch (error) {
    console.error("Context retrieval error:", error);
    return "";
  }
}

/**
 * SENSITIVITY KEYWORDS - For detecting issues needing special handling
 */
const SENSITIVITY_KEYWORDS = {
  DELIVERY_ISSUES: [
    "not delivered",
    "delivery delay",
    "where is my order",
    "lost package",
    "missing item",
    "damaged product",
    "wrong item",
  ],
  PAYMENT_ISSUES: [
    "payment failed",
    "charged twice",
    "refund",
    "money back",
    "payment problem",
    "billing issue",
  ],
  COMPLAINT: [
    "disappointed",
    "unhappy",
    "poor quality",
    "bad experience",
    "very angry",
    "frustrated",
    "scam",
    "fraud",
  ],
  URGENT: ["emergency", "urgent", "immediately", "asap", "critical", "help"],
};

/**
 * Detect if message contains sensitive topics
 */
export function detectSensitiveTopics(message: string): {
  hasSensitive: boolean;
  type?: string;
  severity?: "low" | "medium" | "high";
} {
  const messageLower = message.toLowerCase();

  if (
    SENSITIVITY_KEYWORDS.URGENT.some((keyword) =>
      messageLower.includes(keyword)
    )
  ) {
    return { hasSensitive: true, type: "URGENT", severity: "high" };
  }

  if (
    SENSITIVITY_KEYWORDS.COMPLAINT.some((keyword) =>
      messageLower.includes(keyword)
    )
  ) {
    return { hasSensitive: true, type: "COMPLAINT", severity: "medium" };
  }

  if (
    SENSITIVITY_KEYWORDS.DELIVERY_ISSUES.some((keyword) =>
      messageLower.includes(keyword)
    )
  ) {
    return { hasSensitive: true, type: "DELIVERY_ISSUE", severity: "medium" };
  }

  if (
    SENSITIVITY_KEYWORDS.PAYMENT_ISSUES.some((keyword) =>
      messageLower.includes(keyword)
    )
  ) {
    return { hasSensitive: true, type: "PAYMENT_ISSUE", severity: "high" };
  }

  return { hasSensitive: false };
}

/**
 * Get sensitivity footer to append when issues detected
 */
export function getSensitivityFooter(
  sensitivity: { hasSensitive: boolean; type?: string; severity?: string }
): string {
  if (!sensitivity.hasSensitive) return "";

  const footers: Record<string, string> = {
    URGENT: `\n\n⚠️ **We detected this is urgent.** Please reach out directly to the store owner or contact our support team for fastest resolution.`,
    COMPLAINT: `\n\n💙 **We care about your experience.** Your feedback helps us improve. Please let us know how we can make this right, or contact the store owner directly.`,
    DELIVERY_ISSUE: `\n\n📦 **For package tracking**, check your order details. If unresolved, contact the store owner or our support team immediately.`,
    PAYMENT_ISSUE: `\n\n💳 **Payment concerns are sensitive.** Please contact the relevant store or our support team right away for assistance.`,
  };

  return footers[sensitivity.type || ""] || "";
}

/**
 * PREDEFINED QUESTIONS - Built-in chatbot templates
 */
export const PREDEFINED_QUESTIONS = [
  {
    id: "nearest_store",
    label: "🗺️ What is the nearest store?",
    query: "nearest_store",
    description: "Find stores closest to your location",
    forRole: "BUYER",
  },
  {
    id: "expensive_products",
    label: "💎 What is the most expensive product?",
    query: "most_expensive",
    description: "Show premium/high-value items",
    forRole: "BUYER",
  },
  {
    id: "cheapest_products",
    label: "💰 What is the cheapest product?",
    query: "cheapest",
    description: "Find budget-friendly items",
    forRole: "BUYER",
  },
  {
    id: "all_stores",
    label: "🏪 List all available stores",
    query: "all_stores",
    description: "Browse all stores in the marketplace",
    forRole: "BUYER",
  },
  {
    id: "stores_by_category",
    label: "📂 Show stores by category",
    query: "stores_by_category",
    description: "Filter stores by their category",
    forRole: "BUYER",
  },
  {
    id: "my_orders",
    label: "📦 Show my recent orders",
    query: "my_orders",
    description: "View your order history",
    forRole: "BUYER",
  },
  {
    id: "pending_orders",
    label: "📋 Show my pending orders",
    query: "pending_orders",
    description: "View orders at your stores",
    forRole: "SELLER",
  },
];

/**
 * GET NEAREST STORES based on coordinates
 * Calculates distance using Haversine formula
 */
export async function getNearestStores(
  userLatitude?: number,
  userLongitude?: number,
  limit: number = 5
): Promise<string> {
  try {
    const stores = await prisma.store.findMany({
      include: { products: true },
    });

    if (stores.length === 0) {
      return "🏪 No stores available yet.";
    }

    // If no user location, just return top stores
    if (!userLatitude || !userLongitude) {
      const storesList = stores
        .slice(0, limit)
        .map((s) => `- **${s.name}** (${s.category}) - ${s.products.length} products`)
        .join("\n");
      return `🗺️ **Top Stores:**\n\n${storesList}`;
    }

    // Calculate distances
    const storesWithDistance = stores.map((store) => {
      const distance = haversineDistance(
        userLatitude,
        userLongitude,
        store.latitude,
        store.longitude
      );
      return { ...store, distance };
    });

    // Sort by distance
    const nearest = storesWithDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    const formattedStores = nearest
      .map(
        (s) =>
          `- **${s.name}** (${s.category})\n  📍 ${s.distance.toFixed(2)} km away\n  📦 ${s.products.length} products`
      )
      .join("\n");

    return `📍 **Nearest Stores to You:**\n\n${formattedStores}`;
  } catch (error) {
    console.error("Error getting nearest stores:", error);
    return "❌ Could not fetch store information.";
  }
}

/**
 * GET MOST EXPENSIVE PRODUCTS
 */
export async function getMostExpensiveProducts(limit: number = 5): Promise<string> {
  try {
    const products = await prisma.product.findMany({
      include: { store: true },
      orderBy: { price: "desc" },
      take: limit,
    });

    if (products.length === 0) {
      return "📦 No products available.";
    }

    const formatted = products
      .map(
        (p) =>
          `- **${p.name}** - ₱${p.price.toLocaleString()} (${p.store.name})`
      )
      .join("\n");

    return `💎 **Most Expensive Products:**\n\n${formatted}`;
  } catch (error) {
    console.error("Error getting expensive products:", error);
    return "❌ Could not fetch product information.";
  }
}

/**
 * GET CHEAPEST PRODUCTS
 */
export async function getCheapestProducts(limit: number = 5): Promise<string> {
  try {
    const products = await prisma.product.findMany({
      include: { store: true },
      orderBy: { price: "asc" },
      take: limit,
    });

    if (products.length === 0) {
      return "📦 No products available.";
    }

    const formatted = products
      .map(
        (p) =>
          `- **${p.name}** - ₱${p.price.toLocaleString()} (${p.store.name})`
      )
      .join("\n");

    return `💰 **Cheapest Products:**\n\n${formatted}`;
  } catch (error) {
    console.error("Error getting cheapest products:", error);
    return "❌ Could not fetch product information.";
  }
}

/**
 * GET ALL STORES
 */
export async function getAllStores(): Promise<string> {
  try {
    const stores = await prisma.store.findMany({
      include: { products: true },
      orderBy: { name: "asc" },
    });

    if (stores.length === 0) {
      return "🏪 No stores available yet.";
    }

    const formatted = stores
      .map(
        (s) =>
          `- **${s.name}** (${s.category})\n  📍 ${s.products.length} products`
      )
      .join("\n");

    return `🏪 **All Available Stores (${stores.length}):**\n\n${formatted}`;
  } catch (error) {
    console.error("Error getting all stores:", error);
    return "❌ Could not fetch store information.";
  }
}

/**
 * GET STORES BY CATEGORY
 */
export async function getStoresByCategory(): Promise<string> {
  try {
    const stores = await prisma.store.findMany({
      include: { products: true },
    });

    if (stores.length === 0) {
      return "🏪 No stores available.";
    }

    // Group by category
    const grouped: Record<string, any[]> = {};
    stores.forEach((store) => {
      if (!grouped[store.category]) {
        grouped[store.category] = [];
      }
      grouped[store.category].push(store);
    });

    const formatted = Object.entries(grouped)
      .map(
        ([category, storesList]) =>
          `**${category}** (${storesList.length})\n${storesList
            .map((s) => `- ${s.name} - ${s.products.length} products`)
            .join("\n")}`
      )
      .join("\n\n");

    return `📂 **Stores by Category:**\n\n${formatted}`;
  } catch (error) {
    console.error("Error getting stores by category:", error);
    return "❌ Could not fetch store information.";
  }
}

/**
 * GET USER'S RECENT ORDERS (for buyers)
 */
export async function getRecentOrders(userId: number, limit: number = 10): Promise<string> {
  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    if (orders.length === 0) {
      return "📦 No orders yet. Start shopping!";
    }

    const formatted = orders
      .map(
        (o) =>
          `- **Order #${o.id}** - ${o.status}\n  📅 ${new Date(o.createdAt).toLocaleDateString()}\n  💰 ₱${o.total?.toLocaleString() || "0"}\n  📍 Items: ${o.items.length}`
      )
      .join("\n");

    return `📦 **Your Recent Orders:**\n\n${formatted}`;
  } catch (error) {
    console.error("Error getting recent orders:", error);
    return "❌ Could not fetch order information.";
  }
}

/**
 * GET PENDING ORDERS AT SELLER'S STORES
 */
export async function getPendingSellerOrders(
  sellerId: number,
  limit: number = 10
): Promise<string> {
  try {
    // Get all stores owned by this seller
    const stores = await prisma.store.findMany({
      where: { ownerId: sellerId },
      include: {
        products: true,
      },
    });

    if (stores.length === 0) {
      return "🏪 You don't have any stores yet.";
    }

    // Get all product IDs from seller's stores
    const productIds = stores.flatMap((store) => store.products.map((p) => p.id));

    if (productIds.length === 0) {
      return "📦 Your stores don't have any products yet.";
    }

    // Get all pending/processing orders that contain items from seller's products
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            productId: {
              in: productIds,
            },
          },
        },
        status: {
          in: ["PENDING", "CONFIRMED", "PROCESSING"],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
          where: {
            productId: {
              in: productIds,
            },
          },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    if (orders.length === 0) {
      return "📋 No pending orders. Your stores are all caught up!";
    }

    const formatted = orders
      .map((o) => {
        const itemsList = o.items
          .map((item) => `  • ${item.product.name} x${item.quantity}`)
          .join("\n");
        return `- **Order #${o.id}** - ${o.status}\n  👤 ${o.user.username || o.email}\n  📅 ${new Date(o.createdAt).toLocaleDateString()}\n  💰 ₱${o.total?.toLocaleString() || "0"}\n  📦 Items:\n${itemsList}`;
      })
      .join("\n\n");

    return `📋 **Your Pending Orders:**\n\n${formatted}`;
  } catch (error) {
    console.error("Error getting pending orders:", error);
    return "❌ Could not fetch order information.";
  }
}

/**
 * HAVERSINE FORMULA - Calculate distance between two coordinates
 * Returns distance in kilometers
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

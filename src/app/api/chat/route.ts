import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getOrCreateSession,
  addMessage,
  PREDEFINED_QUESTIONS,
  getNearestStores,
  getMostExpensiveProducts,
  getCheapestProducts,
  getAllStores,
  getStoresByCategory,
  getRecentOrders,
  getPendingSellerOrders,
} from "@/lib/conversationAI";

/**
 * POST /api/chat
 * Send a message and get a response from built-in chatbot
 *
 * Request body:
 * {
 *   message: string
 *   sessionId?: string (optional, creates new if not provided)
 *   userLocation?: { lat: number, lng: number }
 * }
 *
 * Response:
 * {
 *   sessionId: string
 *   role: string
 *   message: string
 *   context: { type }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message, sessionId, userLocation } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get or create session
    const userRole = user.role === "SELLER" ? "SELLER" : "BUYER";
    const session = await getOrCreateSession(
      user.id,
      userRole,
      sessionId
    );

    // Store user message
    await addMessage(session.id, user.id, "user", message);

    // Detect which predefined question this is
    const response = await handlePredefinedQuestion(
      message,
      user.id,
      userRole,
      userLocation
    );

    // Store AI response
    await addMessage(session.id, user.id, "assistant", response);

    // Return response
    return NextResponse.json({
      sessionId: session.id,
      role: userRole,
      message: response,
      context: { type: "predefined_question" },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Match user message to predefined questions and return database-backed response
 */
async function handlePredefinedQuestion(
  userMessage: string,
  userId: number,
  userRole: "BUYER" | "SELLER",
  userLocation?: { lat: number; lng: number }
): Promise<string> {
  const msgLower = userMessage.toLowerCase();

  // Check for nearest store question
  if (
    msgLower.includes("nearest") ||
    msgLower.includes("closest") ||
    msgLower.includes("near me") ||
    msgLower.includes("nearby") ||
    msgLower.includes("how far")
  ) {
    return await getNearestStores(
      userLocation?.lat,
      userLocation?.lng,
      5
    );
  }

  // Check for most expensive product
  if (
    msgLower.includes("most expensive") ||
    msgLower.includes("premium") ||
    msgLower.includes("highest price") ||
    msgLower.includes("luxury")
  ) {
    return await getMostExpensiveProducts(5);
  }

  // Check for cheapest product
  if (
    msgLower.includes("cheapest") ||
    msgLower.includes("most affordable") ||
    msgLower.includes("budget") ||
    msgLower.includes("lowest price") ||
    msgLower.includes("discount")
  ) {
    return await getCheapestProducts(5);
  }

  // Check for all stores
  if (
    msgLower.includes("all stores") ||
    msgLower.includes("list all") ||
    msgLower.includes("show me stores") ||
    msgLower.includes("available stores")
  ) {
    return await getAllStores();
  }

  // Check for stores by category
  if (
    msgLower.includes("by category") ||
    msgLower.includes("categories") ||
    msgLower.includes("category")
  ) {
    return await getStoresByCategory();
  }

  // Check for user's recent orders (buyers)
  if (
    msgLower.includes("my orders") ||
    msgLower.includes("recent orders") ||
    msgLower.includes("my purchases") ||
    msgLower.includes("order history")
  ) {
    return await getRecentOrders(userId, 10);
  }

  // Check for pending orders at seller's stores
  if (
    msgLower.includes("pending orders") ||
    msgLower.includes("pending") ||
    msgLower.includes("processing orders")
  ) {
    return await getPendingSellerOrders(userId, 10);
  }

  // Default: show available questions
  return getAvailableQuestionsResponse(userRole);
}

/**
 * Show user the available predefined questions
 */
function getAvailableQuestionsResponse(userRole: "BUYER" | "SELLER"): string {
  const questions = PREDEFINED_QUESTIONS.filter((q) => {
    // Show questions based on user role
    return q.forRole === userRole;
  });

  const questionsList = questions
    .map((q) => `• ${q.label}\n  _${q.description}_`)
    .join("\n");

  return `👋 **Hello! I'm your local marketplace assistant.**\n\nHere are the questions I can help you with:\n\n${questionsList}\n\n💡 **Just type your question naturally** - I'll understand what you're looking for!`;
}


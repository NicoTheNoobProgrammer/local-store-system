"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { PREDEFINED_QUESTIONS } from "@/lib/conversationAI";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasSensitiveContext?: boolean;
}

type UserRole = "BUYER" | "SELLER" | null;

export default function UnifiedChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [userRole, setUserRole] = useState<UserRole>("BUYER"); // Default to guest/buyer
  const [userName, setUserName] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = checking, true = logged in, false = not logged in
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user role and name on mount (optional - works for guests too)
  useEffect(() => {
    // ✅ First check if user exists in localStorage
    const userData = localStorage.getItem("user");
    if (!userData) {
      // User not logged in - don't show chatbot
      setIsAuthenticated(false);
      return;
    }

    // User is logged in, fetch their info
    setIsAuthenticated(true);

    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role === "SELLER" ? "SELLER" : "BUYER");
          setUserName(data.username || data.email || "");
        } else {
          // User not logged in - hide chatbot
          setIsAuthenticated(false);
          setUserRole("BUYER");
          setUserName("");
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        setIsAuthenticated(false);
        setUserRole("BUYER");
      }
    };
    fetchUserInfo();

    // ✅ Listen for logout (when user is removed from localStorage)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" && !e.newValue) {
        // User logged out - close chatbox and reset state
        setIsOpen(false);
        setMessages([]);
        setInput("");
        setSessionId("");
        setUserRole("BUYER");
        setUserName("");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get initial message based on role
  const getInitialMessage = () => {
    if (userRole === "SELLER") {
      return "👋 Hi! I can help you find stores, products, and place orders.";
    }
    return "👋 Hi! I can help you find products, check store info, and manage your orders.";
  };

  // Get 3 random predefined questions
  const getRandomQuestions = () => {
    const shuffled = [...PREDEFINED_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    // Add user message to UI
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          sessionId: sessionId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.details || errorData.error || "Failed to get response";
        console.error("API Error:", errorMsg);
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // Store session ID for future messages
      if (!sessionId) {
        setSessionId(data.sessionId);
      }

      // Add AI response
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to get response";
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ Error: ${errorMsg}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hide chatbot if user is not authenticated
  if (isAuthenticated === false) {
    return null;
  }

  if (!userRole) {
    return (
      <button
        disabled
        className="fixed bottom-24 right-6 p-4 bg-gray-400 text-white rounded-full shadow-lg cursor-not-allowed"
        title="Loading..."
      >
        <span className="text-2xl">⏳</span>
      </button>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-[9999]"
        title="Open Assistant"
      >
        <span className="text-2xl">🤖</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 sm:w-[650px] h-screen sm:h-[750px] bg-white dark:bg-gray-900 shadow-2xl rounded-lg flex flex-col z-[10000] border dark:border-gray-700">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-bold">🤖 Local Store Assistant</h3>
          <p className="text-xs opacity-90">
            {userRole === "SELLER" ? "Store Manager" : "Smart Shopping"}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
        >
          ✕
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-full px-4">
            <p className="text-3xl mb-3">
              {userRole === "SELLER" ? "🏪" : "🛍️"}
            </p>
            <p className="text-sm font-semibold mb-6">{getInitialMessage()}</p>
            
            {/* QUICK SELECT BUTTONS */}
            <div className="w-full space-y-2 text-left">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 px-2 mb-3">
                ⚡ Choose a question:
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {PREDEFINED_QUESTIONS.filter((q) => q.forRole === userRole).map((q) => (
                  <button
                    key={q.id}
                    onClick={() => sendMessage(q.label.replace(/^[🗺️💎💰🏪📂📦📋]\s/, ""))}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-800 dark:hover:to-purple-800 border border-blue-200 dark:border-blue-700 text-gray-800 dark:text-white transition"
                  >
                    <div className="font-medium">{q.label}</div>
                    <div className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                      {q.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div key={msg.id}>
                <div
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-lg text-sm ${
                      msg.role === "user"
                        ? "max-w-xs bg-blue-500 text-white rounded-br-none"
                        : "max-w-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="space-y-1">
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => <p className="mb-1 last:mb-0 text-sm leading-relaxed" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-1 pl-1" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-0.5 text-sm" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                            em: ({ node, ...props }) => <em className="italic" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="font-bold text-sm mt-1 mb-1" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="font-semibold text-sm mt-0.5 mb-0.5" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{msg.content}</p>
                    )}
                    <p
                      className={`text-xs mt-2 ${
                        msg.role === "user"
                          ? "text-blue-100"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Show predefined questions after assistant messages */}
                {msg.role === "assistant" && index === messages.length - 1 && (
                  <div className="mt-4 px-2">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      Try another question:
                    </p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {PREDEFINED_QUESTIONS.filter((q) => q.forRole === userRole).map((q) => (
                        <button
                          key={q.id}
                          onClick={() => sendMessage(q.label.replace(/^[🗺️💎💰🏪📂📦📋]\s/, ""))}
                          className="w-full text-left text-xs px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 border border-blue-200 dark:border-blue-700 text-gray-800 dark:text-white transition"
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg rounded-bl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="border-t dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type your question..."
            disabled={loading}
            className="flex-1 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg px-4 py-2 text-sm font-medium transition"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

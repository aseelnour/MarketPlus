import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/apiClient";
import {
  ArrowLeft,
  Send,
  Package,
  MessageSquare,
  User,
  Clock,
  ExternalLink,
  Search,
  CheckCheck,
} from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  _id: string;
  content: string;
  senderId: string;
  senderType: "customer" | "seller";
  createdAt: string;
  isRead: boolean;
}

interface Conversation {
  _id: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  storeName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadSeller: number;
  status: "active" | "closed";
}

export const SellerMessagesPage = () => {
  const { t } = useTranslation();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(
    conversationId || null,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getStoreId = () => {
    return new URLSearchParams(window.location.search).get("storeId") || "";
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const storeId = getStoreId();
        const res = await api.get(
          `/seller/messages/seller/conversations?storeId=${storeId}`,
        );
        if (res.data.success) {
          const fetchedConvs: Conversation[] =
            res.data.data.conversations || [];
          setConversations(fetchedConvs);

          if (conversationId) {
            setSelectedConv(conversationId);
          } else if (fetchedConvs.length > 0 && !selectedConv) {
            setSelectedConv(fetchedConvs[0]._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        toast.error(t("messages.loadError") || "Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [conversationId, t]);

  useEffect(() => {
    if (!selectedConv) return;

    const fetchMessages = async () => {
      try {
        const storeId = getStoreId();
        const res = await api.get(
          `/seller/messages/seller/${selectedConv}/messages?storeId=${storeId}`,
          {
            params: { userType: "seller" },
          },
        );
        if (res.data.success) {
          setMessages(res.data.data.messages || []);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) return;

    const messageText = newMessage.trim();
    setSending(true);
    try {
      const storeId = getStoreId();
      const res = await api.post(
        `/seller/messages/seller/${selectedConv}/messages?storeId=${storeId}`,
        {
          content: messageText,
          senderType: "seller",
        },
      );

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data.message]);
        setNewMessage("");

        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === selectedConv
              ? {
                  ...conv,
                  lastMessage: messageText,
                  lastMessageAt: new Date().toISOString(),
                  unreadSeller: 0,
                }
              : conv,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(t("messages.sendError") || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const selectConversation = (convId: string) => {
    setSelectedConv(convId);
    navigate(`/seller/messages/${convId}?storeId=${getStoreId()}`);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return formatTime(date);
    if (d.toDateString() === yesterday.toDateString())
      return t("common.yesterday") || "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeConversation = conversations.find((c) => c._id === selectedConv);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-dark-400">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-7xl mx-auto space-y-4">
      {}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {t("messages.title")}
          </h1>
          <p className="text-xs text-dark-400">{t("messages.subtitle")}</p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-4 flex-1 bg-dark-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {}
        <div
          className={`md:col-span-5 lg:col-span-4 border-r border-white/10 flex flex-col bg-dark-800/40 ${
            selectedConv ? "hidden md:flex" : "flex"
          }`}
        >
          {}
          <div className="p-3.5 border-b border-white/10 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder={t("messages.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-dark-400 focus:outline-none focus:border-primary/50 transition"
              />
            </div>
          </div>

          {}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-16 px-4 text-dark-400 space-y-2">
                <MessageSquare className="w-10 h-10 mx-auto opacity-20" />
                <p className="text-sm font-medium">
                  {t("messages.noConversations")}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConv === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => selectConversation(conv._id)}
                    className={`w-full p-4 text-left transition-all duration-200 relative group flex gap-3 items-start ${
                      isSelected
                        ? "bg-primary/10 border-l-4 border-primary"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/30 to-purple-500/30 border border-white/10 flex items-center justify-center text-white font-semibold text-sm">
                        {conv.customerName ? (
                          conv.customerName[0].toUpperCase()
                        ) : (
                          <User size={16} />
                        )}
                      </div>
                    </div>

                    {}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-xs font-semibold text-white truncate group-hover:text-primary transition-colors">
                          {conv.customerName}
                        </h3>
                        <span className="text-[10px] text-dark-400 flex items-center gap-1">
                          <Clock size={10} />
                          {formatDate(conv.lastMessageAt)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                          #{conv.orderNumber}
                        </span>
                        {conv.unreadSeller > 0 && (
                          <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-primary text-white rounded-full min-w-[18px]">
                            {conv.unreadSeller}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-dark-400 truncate mt-1.5 line-clamp-1">
                        {conv.lastMessage || t("messages.noMessagesYet")}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {}
        <div
          className={`md:col-span-7 lg:col-span-8 flex flex-col bg-dark-900/60 ${
            !selectedConv ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedConv && activeConversation ? (
            <>
              {}
              <div className="p-3.5 px-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  {}
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="md:hidden p-1.5 text-dark-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold text-sm">
                    {activeConversation.customerName[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                      {activeConversation.customerName}
                    </h2>
                    <p className="text-[11px] text-dark-400">
                      {t("messages.order")}:{" "}
                      <span className="text-white font-medium">
                        #{activeConversation.orderNumber}
                      </span>
                    </p>
                  </div>
                </div>

                {}
                <button
                  onClick={() => {
                    const storeId = getStoreId();
                    navigate(
                      `/orders/${activeConversation.orderId}?storeId=${storeId}`,
                    );
                  }}
                  className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 px-3 py-1.5 rounded-lg transition font-medium"
                >
                  <span>{t("messages.orderDetails")}</span>
                  <ExternalLink size={14} />
                </button>
              </div>

              {}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-dark-400 space-y-2 opacity-60">
                    <Package className="w-12 h-12 stroke-[1.5]" />
                    <p className="text-xs">{t("messages.noMessagesYet")}</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSeller = msg.senderType === "seller";
                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isSeller ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[80%] md:max-w-[70%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isSeller
                              ? "bg-primary text-white rounded-br-xs shadow-lg shadow-primary/20"
                              : "bg-white/10 text-slate-100 rounded-bl-xs border border-white/5"
                          }`}
                        >
                          <p className="break-words whitespace-pre-wrap">
                            {msg.content}
                          </p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              isSeller ? "text-white/80" : "text-dark-400"
                            }`}
                          >
                            <span>{formatTime(msg.createdAt)}</span>
                            {isSeller && (
                              <CheckCheck size={12} className="opacity-80" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {}
              <div className="p-3.5 border-t border-white/10 bg-white/[0.01]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t("messages.typeMessage")}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-dark-400 focus:outline-none focus:border-primary/50 transition"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-dark-400 p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <MessageSquare className="w-8 h-8 opacity-40 text-primary" />
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-white font-semibold text-base">
                  {t("messages.emptyState.title")}
                </h3>
                <p className="text-xs text-dark-400 mt-1">
                  {t("messages.emptyState.subtitle")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

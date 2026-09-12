
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import { generateGuestId } from "../utils/guestId";
import { ArrowLeft, Send } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  _id: string;
  content: string;
  senderId: string;
  senderType: "customer" | "seller";
  createdAt: string;
  isRead: boolean;
}

export const MessagesPage = () => {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const guestId = generateGuestId();

  useEffect(() => {
    if (!orderId) {
      navigate("/profile");
      return;
    }

    const fetchOrCreateConversation = async () => {
      try {
        
        const convRes = await api.get(`/messages/customer/conversations`, {
          headers: { "x-guest-id": guestId },
        });

        if (convRes.data.success) {
          const conversations = convRes.data.data.conversations || [];
          
          const existingConv = conversations.find(
            (conv: any) => conv.orderId === orderId,
          );

          if (existingConv) {
            
            setConversationId(existingConv._id);

            const msgRes = await api.get(
              `/messages/${existingConv._id}/messages`,
              {
                params: { userId: guestId, userType: "customer" },
                headers: { "x-guest-id": guestId },
              },
            );
            if (msgRes.data.success) {
              setMessages(msgRes.data.data.messages || []);
            }
          } else {
            
            setConversationId(null);
            
            setMessages([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateConversation();
  }, [orderId, navigate, guestId]);

  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${conversationId}/messages`, {
          params: { userType: "customer" },
          headers: { "x-guest-id": guestId },
        });
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
  }, [conversationId, guestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !orderId) return;

    setSending(true);
    try {
      const res = await api.post(
        `/messages/${orderId}/messages`, 
        {
          content: newMessage,
        },
        {
          headers: { "x-guest-id": guestId },
        },
      );

      if (res.data.success) {
        
        if (res.data.data.conversation) {
          setConversationId(res.data.data.conversation);
        }

        setMessages((prev) => [...prev, res.data.data.message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      { }
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <h1 className="text-xl font-extrabold text-foreground">Messages</h1>
      </div>

      { }
      <div className="bg-card rounded-2xl border border-border shadow-sm p-4">
        <div className="h-[400px] overflow-y-auto space-y-2 mb-4">
          {messages.length === 0 && conversationId === null ? (
            
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-semibold text-foreground">
                💬 Start a Conversation
              </p>
              <p className="text-sm mt-1">
                Send a message to the seller about your order
              </p>
              <p className="text-xs mt-4 text-muted-foreground/70">
                Your message will start the conversation
              </p>
            </div>
          ) : messages.length === 0 && conversationId ? (
            
            <div className="text-center py-20 text-muted-foreground">
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation with the seller</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`p-3 rounded-xl max-w-[80%] ${
                  msg.senderType === "customer"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-secondary/70 text-foreground"
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
                <p className="text-[10px] opacity-70 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        { }
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

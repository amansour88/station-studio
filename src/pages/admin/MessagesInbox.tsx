import { useEffect, useState } from "react";
import {
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Search,
  Phone,
  Calendar,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

const MessagesInbox = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await api.get<Message[]>("/messages/list.php", { filter });
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في تحميل الرسائل",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (message: Message) => {
    if (message.is_read) return;

    try {
      await api.put("/messages/update.php", { id: message.id, is_read: true });

      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m))
      );
      if (selectedMessage?.id === message.id) {
        setSelectedMessage({ ...message, is_read: true });
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const toggleArchive = async (message: Message) => {
    try {
      await api.put("/messages/update.php", {
        id: message.id,
        is_archived: !message.is_archived,
      });

      toast({
        title: message.is_archived ? "تم إلغاء الأرشفة" : "تم الأرشفة",
        description: message.is_archived
          ? "تم نقل الرسالة إلى البريد الوارد"
          : "تم نقل الرسالة إلى الأرشيف",
      });

      fetchMessages();
      if (selectedMessage?.id === message.id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Error archiving message:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ",
      });
    }
  };

  const deleteMessage = async (message: Message) => {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;

    try {
      await api.delete("/messages/delete.php", { id: message.id });

      toast({
        title: "تم الحذف",
        description: "تم حذف الرسالة بنجاح",
      });

      fetchMessages();
      if (selectedMessage?.id === message.id) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في حذف الرسالة",
      });
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.subject && m.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <AdminLayout title="الرسائل الواردة">
      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-card rounded-2xl border border-border/50 flex flex-col overflow-hidden">
          {/* Search & Filter */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في الرسائل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-muted/50"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                الكل
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                غير مقروءة
              </Button>
              <Button
                variant={filter === "archived" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("archived")}
              >
                الأرشيف
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchMessages}
                className="mr-auto"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد رسائل</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredMessages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      markAsRead(message);
                    }}
                    className={cn(
                      "w-full text-right p-4 hover:bg-muted/50 transition-colors",
                      selectedMessage?.id === message.id && "bg-muted",
                      !message.is_read && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                          message.is_read ? "bg-muted-foreground/30" : "bg-primary"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={cn(
                              "font-medium truncate",
                              !message.is_read && "text-foreground font-bold"
                            )}
                          >
                            {message.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(message.created_at).split("،")[0]}
                          </span>
                        </div>
                        {message.subject && (
                          <p className="text-sm text-muted-foreground truncate mb-1">
                            {message.subject}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground truncate">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border/50 flex flex-col overflow-hidden">
          {selectedMessage ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">
                      {selectedMessage.name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="hover:text-primary"
                      >
                        {selectedMessage.email}
                      </a>
                      {selectedMessage.phone && (
                        <a
                          href={`tel:${selectedMessage.phone}`}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <Phone className="w-3 h-3" />
                          <span dir="ltr">{selectedMessage.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleArchive(selectedMessage)}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMessage(selectedMessage)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {selectedMessage.subject && (
                  <h3 className="text-lg font-medium text-foreground">
                    {selectedMessage.subject}
                  </h3>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedMessage.created_at)}</span>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 p-6 overflow-y-auto">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Quick Reply */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=رد: ${selectedMessage.subject || "رسالتك"}`}
                    className="flex-1"
                  >
                    <Button className="w-full" variant="outline">
                      <Mail className="w-4 h-4 ml-2" />
                      الرد بالبريد الإلكتروني
                    </Button>
                  </a>
                  {selectedMessage.phone && (
                    <a href={`tel:${selectedMessage.phone}`}>
                      <Button variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MailOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>اختر رسالة لعرضها</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default MessagesInbox;

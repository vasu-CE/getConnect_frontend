import {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Send as SendIcon,
  UserPlus,
  ArrowLeft,
  MessagesSquare,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { receiveMessage, sendMessage } from "../../config/socket";
import { useChatSocket } from "@/auth/ChatProvider";
import TypingIndicator from "./ReactBeats/TypingIndicator";

export default function ChatPage() {
  const me = useSelector((state) => state.auth.user);
  const onlineUsers = useSelector((state) => state.chat.onlineUsers);
  const socket = useChatSocket();
  const navigate = useNavigate();

  // UI state
  const [isMobile, setIsMobile] = useState(false);
  const [showUserList, setShowUserList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Chat data
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Refs
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const prevScrollHeight = useRef(0);
  const typingTimeout = useRef(null);

  // Responsive
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Fetch users list
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_URL}/render/users`,
          { withCredentials: true }
        );
        const list = data.users || [];
        setUsers(list.filter((u) => u._id !== me._id));
      } catch (err) {
        toast.error(err.response?.data?.message || "Error fetching users");
      }
    })();
  }, [me._id]);

  // Reset on user switch
  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    setLoading(false);
  }, [selectedUser?._id]);

  // Fetch messages for current page
  useEffect(() => {
    if (!selectedUser?._id) return;
    // console.log("hy")
    setLoading(true);

    axios
      .get(
        `${import.meta.env.VITE_URL}/messages/all/${selectedUser._id}`,
        {
          withCredentials: true,
          params: { page, limit: 20 },
        }
      )
      .then(({ data }) => {
        if (data.success) {
          setMessages((prev) => [...data.messages, ...prev]);
          setHasMore(data.hasMore);
        } else {
          setHasMore(false);
        }
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || "Error fetching messages")
      )
      .finally(() => setLoading(false));
  }, [selectedUser?._id, page]);

  // Preserve scroll position on load / prepend
  useLayoutEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;

    if (page === 1) {
      // first load → scroll to bottom
      el.scrollTop = el.scrollHeight;
    } else {
      // after loading more → maintain viewport
      el.scrollTop = el.scrollHeight - prevScrollHeight.current;
    }
    prevScrollHeight.current = el.scrollHeight;
  }, [messages, page]);

  // Scroll handler
  const handleScroll = useCallback(
    (e) => {
      const el = e.target;
      if (el.scrollTop <= 50 && !loading && hasMore) {
        setPage((p) => p + 1);
      }
    },
    [loading, hasMore]
  );

  // Socket: receive new messages & typing
  useEffect(() => {
    if (!selectedUser?._id || !socket) return;

    const onMsg = (msg) => setMessages((prev) => [...prev, msg]);
    const onTyping = ({ senderId }) => {
      if (senderId === selectedUser._id) setIsTyping(true);
    };
    const onStop = ({ senderId }) => {
      if (senderId === selectedUser._id) setIsTyping(false);
    };

    receiveMessage(socket, "typing", onTyping);
    receiveMessage(socket, "stopTyping", onStop);
    receiveMessage(socket, "user-message", onMsg);

    return () => {
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStop);
      socket.off("user-message", onMsg);
    };
  }, [selectedUser?._id, socket]);

  // Send a new message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser?._id) return;

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/messages/send/${selectedUser._id}`,
        { textMessage: newMessage },
        { withCredentials: true }
      );
      sendMessage(socket, "user-message", {
        message: newMessage,
        recipientId: selectedUser._id,
      });
      setMessages((prev) => [...prev, data.newMessage]);
      setNewMessage("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending message");
    }
  };

  // Typing indicator
  const handleTyping = () => {
    clearTimeout(typingTimeout.current);
    sendMessage(socket, "typing", { recipientId: selectedUser._id });
    typingTimeout.current = setTimeout(() => {
      sendMessage(socket, "stopTyping", { recipientId: selectedUser._id });
    }, 1000);
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if(page == 1){
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, selectedUser?._id]);

  // Filtered user list
  const filtered = users.filter((u) =>
    u.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Select a user
  const selectAndNav = (u) => {
    setSelectedUser(u);
    if (isMobile) setShowUserList(false);
    navigate(`/render/chat/${u._id}`);
  };

  const viewProfile = (u) => navigate(`/view/${u._id}/profile`);

  return (
    <div className="flex flex-col md:flex-row h-[90vh] bg-gray-100">
      {/* User list */}
      <Card
        className={cn(
          "flex flex-col w-full md:w-80 h-full border-r",
          isMobile && !showUserList && "hidden md:flex"
        )}
      >
        <CardHeader className="p-4 space-y-2">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-4 md:hidden"
              onClick={() => setShowUserList(true)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <CardTitle>Chats</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((u) => (
            <div
              key={u._id}
              className={cn(
                "flex items-center p-4 cursor-pointer",
                selectedUser?._id === u._id
                  ? "bg-secondary"
                  : "hover:bg-secondary/50"
              )}
              onClick={() => selectAndNav(u)}
            >
              <div className="relative h-10 w-10 rounded-full">
                <img
                  src={u.profilePicture}
                  alt={u.userName}
                  className="object-cover w-full h-full rounded-full"
                  crossOrigin="anonymous"
                />
                {onlineUsers.includes(u._id) && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border border-white bg-green-500" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium flex items-center gap-1">
                  {u.userName}
                  {onlineUsers.includes(u._id) && (
                    <span className="text-green-500 text-xs">(Online)</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {u.bio || "No bio"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col bg-gray-100">
      {(!isMobile || !showUserList) && 
        (!selectedUser ? (
          <Card className="flex-1 flex items-center justify-center">
            <CardContent className="text-center space-y-3">
              <MessagesSquare className="mx-auto h-10 w-10 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Select a user to chat</h2>
              <p className="text-sm text-muted-foreground">
                Choose someone from the list.
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  toast.warning(
                    "Please select a user from the sidebar to begin."
                  )
                }
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Need help?
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Header */}
            <Card className="rounded-none border-b sticky top-12 z-10 ">
              <CardHeader className="p-4 flex flex-row items-center justify-between ">
                <div className="flex items-center space-x-4">
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setShowUserList(true)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  )}
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => viewProfile(selectedUser)}
                  >
                    <div className="relative h-10 w-10 rounded-full">
                      <img
                        src={selectedUser?.profilePicture}
                        alt={selectedUser?.userName}
                        className="object-cover w-full h-full rounded-full"
                        crossOrigin="anonymous"
                      />
                      {onlineUsers.includes(selectedUser._id) && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border border-white bg-green-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h2 className="text-lg font-semibold">
                        {selectedUser.userName}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.bio || "No bio"}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => viewProfile(selectedUser)}
                >
                  <UserPlus className="h-5 w-5" />
                </Button>
              </CardHeader>
            </Card>

            {/* Messages */}
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col bg-gray-100"
            >
              {loading && page > 1 && (
                <div className="flex justify-center text-gray-900 animate-spin">
                  <Loader2 className="w-7 h-7"/>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex",
                    msg.senderId === me._id
                      ? "justify-end"
                      : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-lg p-3 group",
                      msg.senderId === me._id
                        ? "bg-gray-800 text-white"
                        : "bg-white text-black"
                    )}
                  >
                    <p>{msg.message}</p>
                    <p className="text-xs opacity-70 hidden group-hover:block">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {isTyping && (
             <div className="ml-5">
             <div>
               <TypingIndicator />
             </div>
           </div>
            )}

            <Separator />

            {/* Input */}
            <CardFooter className="p-4">
              <form onSubmit={handleSend} className="flex w-full space-x-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onBlur={() => clearTimeout(typingTimeout.current)}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <SendIcon className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          </>
        ))}
      </div>
    </div>
  );
}
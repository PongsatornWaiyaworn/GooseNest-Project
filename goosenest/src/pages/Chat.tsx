import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import UserProfileView from "@/components/UserProfileView";
import { useLocation, useNavigate } from "react-router-dom";
import ConfirmDialog from "@/components/ConfirmDialog";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;

const Chat = () => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [memberProfiles, setMemberProfiles] = useState({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const currentEmail = localStorage.getItem("email");

  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (location.state?.group_id) {
      handleSelectTeam(location.state.group_id);
      window.history.replaceState({}, document.title);
    }
  }, []);

  const fetchAndSetProfiles = async (teams) => {
    const uniqueEmails = new Set<string>();
  
    teams.forEach(team => {
      team.members.forEach((email: string) => {
        if (email !== currentEmail) {
          uniqueEmails.add(email);
        }
      });
    });
  
    const profiles = {};
  
    await Promise.all(
      Array.from(uniqueEmails).map(async (email) => {
        try {
          const res = await fetch(`${BASE_URL}/user/profile/${email}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (!res.ok) throw new Error("Failed to fetch profile");
  
          const data = await res.json();
          profiles[email] = data;
        } catch (error) {
          console.error(`Error loading profile for ${email}:`, error);
        }
      })
    );
  
    setMemberProfiles(profiles); 
  };  

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${BASE_URL}/chat/groups`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }

      const data = await response.json();

      const sortedTeams = data.sort((a, b) => {
        const aTime = a.last_message_at || a.created_at;
        const bTime = b.last_message_at || b.created_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setTeams(sortedTeams);
      fetchAndSetProfiles(sortedTeams);

    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [selectedTeam]);

  useEffect(() => {
    if (!currentEmail) return;
  
    const ws = new WebSocket(`${WS_BASE_URL}/ws/watch-new-groups?email=${currentEmail}`);
    console.log("Connected to new group listener");
  
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("New group message received:", message);
  
      if (message.type === "new_group_created") {
        const newGroup = {
          id: message.group.id,
          name: message.group.name,
          product_id: message.group.product_id,
          cover_image: message.group.cover_image,
          created_at: message.group.created_at,
          last_message_at: message.group.last_message_at || message.group.created_at,
          members: message.group.members || [],
          read_status: message.group.read_status || {},
        };
  
        setTeams(prevTeams => {
          const isDuplicate = prevTeams.some(t => t.id === newGroup.id);
          if (isDuplicate) return prevTeams;
  
          return [newGroup, ...prevTeams].sort((a, b) =>
            new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
          );
        });
  
        fetchAndSetProfiles([newGroup]);
      }
    };
  
    ws.onerror = (err) => console.error("New group WebSocket error", err);
    ws.onclose = () => console.log("New group listener disconnected");
  
    return () => {
      ws.close();
    };
  }, [currentEmail]);   

  useEffect(() => {
    if (!currentEmail) return;
  
    const ws = new WebSocket(`${WS_BASE_URL}/ws/listen?email=${currentEmail}`);
    console.log("Connected to global message listener");
  
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === "new_message_notification") {
        setTeams((prevTeams) =>
          prevTeams
            .map(team =>
              team.id === message.group_id
                ? {
                    ...team,
                    last_message_at: message.timestamp,
                  }
                : team
            )
            .sort((a, b) =>
              new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
            )
        );
      } else {
        setTeams((prevTeams) =>
          prevTeams
            .map(team =>
              team.id === message.group_id
                ? {
                    ...team,
                    messages: [...(team.messages || []), message],
                    last_message_at: message.timestamp,
                  }
                : team
            )
            .sort((a, b) =>
              new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
            )
        );
      }
    };
  
    ws.onerror = (err) => console.error("Global WebSocket error", err);
    ws.onclose = () => console.log("Global message listener disconnected");
  
    return () => ws.close();
  }, [currentEmail]);  

  useEffect(() => {
    if (!selectedTeam) return;
  
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  
    const ws = new WebSocket(`${WS_BASE_URL}/ws/chat?group_id=${selectedTeam}&email=${currentEmail}`);
    socketRef.current = ws;
  
    ws.onopen = () => {
      console.log("WebSocket connected to group");
    };
  
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Group message received:");
  
      setTeams((prevTeams) => {
        const updatedTeams = [...prevTeams];
        const teamIndex = updatedTeams.findIndex(team => team.id === message.group_id);
  
        if (teamIndex === -1) return prevTeams;
  
        const updatedTeam = { ...updatedTeams[teamIndex] };
  
        updatedTeam.messages = [...(updatedTeam.messages || []), message];
        updatedTeam.last_message_at = message.timestamp; 
  
        updatedTeams[teamIndex] = updatedTeam;
  
        return updatedTeams.sort((a, b) =>
          new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        );
      });
  
      scrollToBottom();
    };
  
    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };
  
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  
    return () => {
      ws.close();
    };
  }, [selectedTeam]);  

  const selectedTeamData = teams.find(team => team.id === selectedTeam);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedTeamData?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!newMessage.trim()) return;
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected");
      return;
    }
  
    const messageToSend = {
      content: newMessage.trim(),
      group_id: selectedTeam,
      timestamp: new Date().toISOString(),
      senderEmail: currentEmail,
    };
  
    const encodedEmail = encodeEmailKey(currentEmail);
    setTeams(prevTeams =>
      prevTeams
        .map(team =>
          team.id === selectedTeam
            ? {
                ...team,
                messages: [...(team.messages || []), messageToSend],
                last_message_at: messageToSend.timestamp,
                read_status: {
                  ...(team.read_status || {}),
                  [encodedEmail]: messageToSend.timestamp, 
                },
              }
            : team
        )
        .sort((a, b) =>
          new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime()
        )
    );
  
    socketRef.current.send(JSON.stringify(messageToSend));
    setNewMessage("");
  
    scrollToBottom();
  };

  const handleConfirmAndNavigate = async () => {
    try {
       
      const response = await fetch(`${BASE_URL}/chat/groups/${selectedTeamData.id}/confirm`, {
        method: "PATCH", 
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmed: true,
        }),
      });      
      console.log(response)

      navigate("/purchase", {
        state: {
          id: selectedTeamData.product_id,
        },
      });
    } catch (error) {
      console.error("ยืนยันไม่สำเร็จ:", error);
    }
  };
  
  const fetchMessages = async (selectedTeam) => {
    try {
      const response = await fetch(`${BASE_URL}/chat/messages/${selectedTeam}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const messages = await response.json();
    
      setTeams((prevTeams) =>
        prevTeams.map((team) =>
          team.id === selectedTeam ? { ...team, messages } : team
        )
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (!selectedTeam) return;
    fetchMessages(selectedTeam); 
  }, [selectedTeam]);  

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Image selected:", file.name);
    }
  };

  const handleViewProfile = (email) => {
    const profile = memberProfiles[email];
  
    if (!profile) return;
  
    setSelectedUser(profile);
    setUserProducts([]); 
    setShowUserModal(true);
  };  

  const sendMessage = async (groupId: string, content: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket is not connected");
      return;
    }
  
    const messageToSend = {
      content,
      group_id: groupId,
      timestamp: new Date().toISOString(),
      senderEmail: currentEmail,
    };
  
    socketRef.current.send(JSON.stringify(messageToSend));
  
    setTeams(prevTeams =>
      prevTeams.map(team =>
        team.id === groupId
          ? {
              ...team,
              messages: [...(team.messages || []), messageToSend],
              last_message_at: messageToSend.timestamp,
            }
          : team
      )
    );
  
    scrollToBottom();
  };  

  // const handleConfirmUseCentralSystem = (groupId: string) => {
  //   setShowConfirmDialog(true);

  //   setGroupIdToConfirm(groupId);
  // };

  const [groupIdToConfirm, setGroupIdToConfirm] = useState<string | null>(null);

  const CONFIRM_MESSAGE = import.meta.env.VITE_CONFIRM_MESSAGE;

  const confirmUseCentralSystem = async () => {
    if (!groupIdToConfirm) return;

    try {
      const response = await fetch(`${BASE_URL}/chat/groups/${groupIdToConfirm}/confirm`, {
        method: "PATCH", 
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmed: true,
        }),
      });      

      if (!response.ok) {
        throw new Error("ไม่สามารถยืนยันการใช้ระบบกลางได้");
      }

      await sendMessage(groupIdToConfirm, CONFIRM_MESSAGE);

      setShowConfirmDialog(false);
      setGroupIdToConfirm(null);

    } catch (error) {
      console.error(error);
    }
  };

  const updateReadStatus = async (groupId) => {
    try {
      const res = await fetch(`${BASE_URL}/chat/groups/${groupId}/read-status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to update read status");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectTeam = async (teamId) => {
    await updateReadStatus(teamId);
    await fetchMessages(teamId);
    await setSelectedTeam(teamId);
  
    const encodedEmail = encodeEmailKey(currentEmail);
  
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            read_status: {
              ...(team.read_status || {}),
              [encodedEmail]: new Date().toISOString(),
            },
          };
        }
        return team;
      })
    );
  };  

  const encodeEmailKey = (email: string) => {
    return email.replace(/\./g, "_dot_").replace(/\$/g, "_dollar_");
  };  

  const formatShortDateThai = (isoString: string) => {
    const date = new Date(isoString);
    return date
      .toLocaleString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(" ", "");
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950">
      {/* Sidebar Toggle Button - Only visible on mobile */}
      {isMobile && (
        <motion.button
          className={`
            fixed top-1/2 transform -translate-y-1/2 z-50
            bg-gradient-to-r from-cyan-500 to-blue-600 
            hover:from-cyan-600 hover:to-blue-700
            text-white border border-cyan-400/30
            h-12 w-10 
            shadow-lg hover:shadow-xl
            focus:outline-none
            transition-all duration-300 ease-in-out
            flex items-center justify-center
            backdrop-blur-sm
            ${isSidebarOpen ? 'left-80 rounded-r-xl' : 'left-0 rounded-r-xl'}
          `}
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </motion.button>
      )}

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <motion.div
          className={`
            h-screen w-80
            bg-gray-800/90 backdrop-blur-lg border-r border-gray-700/50
            flex flex-col
            ${isMobile ? 'fixed z-40 top-0 left-0' : 'static'}
            ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          `}
          initial={isMobile ? { x: -320 } : { x: 0 }}
          animate={isMobile ? { x: isSidebarOpen ? 0 : -320 } : { x: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Sidebar Header */}
          <motion.div 
            className="p-5 border-b border-gray-700/50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text flex items-center gap-2">
              <MessageSquare size={24} className="text-cyan-400" />
              แชทของฉัน
            </h2>
          </motion.div>

          {/* Teams List */}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
            {teams.map((team, index) => {
              const encodedEmail = encodeEmailKey(currentEmail);
              const userReadTime = team.read_status?.[encodedEmail]
                ? new Date(team.read_status[encodedEmail]).getTime()
                : 0;

              const lastMessageTime = team.last_message_at
                ? new Date(team.last_message_at).getTime()
                : 0;

              const hasUnread =
                lastMessageTime > userReadTime && selectedTeam !== team.id;

              const otherMembers = team.members.filter((member) => member !== currentEmail);
              const firstOtherMember = otherMembers.length > 0 ? otherMembers[0] : null;

              const profile = firstOtherMember ? memberProfiles[firstOtherMember] : null;

              const displayName =
                profile
                  ? (profile.NameStore || `${profile.FristName || ''} ${profile.LastName || ''}`).trim()
                  : "ไม่ระบุผู้ติดต่อ";

              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={`w-full cursor-pointer transition-all duration-300 border rounded-2xl ${
                      selectedTeam === team.id
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 shadow-md shadow-cyan-500/30"
                        : "bg-gray-900/70 hover:bg-gray-800/90 border-gray-700/50 hover:border-gray-600/50"
                    }`}
                    onClick={() => handleSelectTeam(team.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <motion.img
                          src={team?.cover_image || "/LOGO.png"}
                          alt="Img"
                          className="w-12 h-12 rounded-xl object-cover border border-gray-600/50"
                          whileHover={{ rotate: 3 }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-100 text-sm truncate max-w-[180px]">
                                {team.name}
                              </h3>
                              <p className="text-xs text-gray-400 truncate max-w-[180px]">
                                {displayName}
                              </p>
                            </div>
                            {hasUnread && (
                              <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold text-white bg-red-600 rounded-full whitespace-nowrap">
                                ● ข้อความใหม่
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          </ScrollArea>
        </motion.div>
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className={`flex-1 flex overflow-hidden transition-all duration-300 ${!isMobile || isSidebarOpen ? '' : ''}`}>
        <div className="flex-1 flex flex-col bg-gray-900/90 backdrop-blur-lg relative max-h-screen">
        {selectedTeamData ? (
          <>
            {/* Chat Header */}
            <motion.header 
              className="p-5 border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm relative"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
                {selectedTeamData.name}
              </h2>

              {/* ปุ่มยืนยันใช้ระบบกลาง (เฉพาะ seller) */}
              {/* {selectedTeamData.seller === currentEmail && (
                <button
                  onClick={() => handleConfirmUseCentralSystem(selectedTeamData.id)}
                  className="absolute top-5 right-5 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded-md text-sm shadow-md transition-colors"
                  title="ยืนยันใช้ระบบกลาง GooseNest"
                >
                  ใช้ระบบกลาง
                </button>
              )} */}

              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {selectedTeamData.members
                  .filter((member) => member !== currentEmail)  
                  .map((member) => {
                    const profile = memberProfiles[member];
                    return (
                      <motion.button
                        key={member}
                        onClick={() => handleViewProfile(member)}
                        className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                        whileHover={{ scale: 1.05 }}
                      >
                        @{profile?.Username ||
                          profile?.NameStore ||
                          (profile?.FirstName && profile?.LastName
                            ? profile.FirstName + " " + profile.LastName
                            : member)}
                      </motion.button>
                    );
                  })}
              </div>
            </motion.header>

              {/* Messages Area */}
              <div
                ref={scrollAreaRef}
                className="flex-1 p-4 space-y-4 overflow-y-auto"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <AnimatePresence>
                  {selectedTeamData.messages && selectedTeamData.messages.length > 0 ? (
                    selectedTeamData.messages.map((message, index) => {
                      const isMyMessage = message.senderEmail === currentEmail;
                      const profile = memberProfiles[message.senderEmail];

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`flex px-2 my-2 ${
                            isMyMessage ? "justify-end" : "justify-start"
                          }`}
                        > 
                          {!isMyMessage && (
                            <div className="pt-4">
                              <motion.img
                                src={profile?.Image || "/default.jpg"}
                                alt={profile?.Username || "Unknown"}
                                className="w-12 h-12 rounded-full border-2 border-gray-700 mr-2 cursor-pointer hover:border-cyan-500 transition-all duration-200"
                                title={profile?.Username || "Unknown"}
                                onClick={() => handleViewProfile(message.senderEmail)}
                                whileHover={{ scale: 1.1 }}
                              />                        
                            </div>
                          )}

                          <div className="flex flex-col max-w-[70%]">
                            {/* Sender name for other users */}
                            {!isMyMessage && (
                              <p className="text-xs font-semibold mb-1 text-gray-400">
                                {profile.FirstName + " " + profile.LastName}
                              </p>
                            )}

                            {/* Message bubble */}
                            <motion.div
                              className={`relative p-3 rounded-xl break-words whitespace-pre-wrap shadow-lg ${
                                (isMyMessage
                                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-none ml-auto"
                                  : "bg-gray-800/80 text-gray-200 rounded-tl-none border border-gray-700/50 mr-auto")
                              }`}
                              whileHover={{ scale: 1.02 }}
                            >
                              {message.content.startsWith("https://goosenest.s3.ap-southeast-2.amazonaws.com/") ? (
                                <motion.img
                                  onClick={() => {
                                    // setFullImageSrc_message(message.content);
                                    // setShowFullImage_message(true);
                                  }}
                                  onLoad={scrollToBottom}
                                  src={message.content}
                                  alt="uploaded"
                                  className="max-w-[200px] max-h-[200px] w-auto h-auto rounded-lg border border-gray-700/50 cursor-pointer transition-opacity hover:opacity-90"
                                  whileHover={{ scale: 1.05 }}
                                />
                              ) : message.content === CONFIRM_MESSAGE ? (
                                <div className="border-2 border-amber-500 rounded-xl p-4 bg-amber-100/10 shadow-lg space-y-3 text-sm">
                                  <div className="flex items-center space-x-2 text-amber-400 font-semibold">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-amber-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4 -4" />
                                    </svg>
                                    <span>มีการยืนยันจะใช้ระบบซื้อขายกลาง</span>
                                  </div>

                                  {currentEmail === selectedTeamData.buyer ? (
                                    <div className="text-green-300">
                                      <p>ผู้ขายได้ยืนยันแล้วว่าต้องการใช้ระบบซื้อขายกลาง</p>
                                      <button
                                        onClick={handleConfirmAndNavigate}
                                        className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg shadow-md transition duration-300"
                                      >
                                        ไปที่ระบบซื้อขายกลาง
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl shadow-md text-yellow-800 space-x-2 flex items-start">
                                      <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                          fillRule="evenodd"
                                          d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9V5h2v4H9zm0 4h2v2H9v-2z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      <p className="font-medium">คุณได้ส่งการยืนยันว่าจะใช้ระบบซื้อขายกลางเรียบร้อยแล้ว</p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-sm leading-relaxed">{message.content}</p>
                              )}

                            </motion.div>

                            {/* Timestamp */}
                            {message.timestamp && (
                              <p
                                className={`text-[10px] mt-1 ${
                                  isMyMessage ? "text-gray-300 self-end" : "text-gray-400"
                                }`}
                              >
                                {formatShortDateThai(message.timestamp)}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center h-full"
                    >
                      <p className="text-center text-gray-500">ยังไม่มีข้อความ</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Message Input */}
              <motion.form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-gray-700/50 flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Input
                  placeholder="พิมพ์ข้อความ..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="bg-gray-800/80 text-gray-100 border-gray-700/50 focus:border-cyan-500/50 backdrop-blur-sm"
                  autoComplete="off"
                  spellCheck={false}
                />
                
                <Button
                  type="button"
                  onClick={handleImageUploadClick}
                  className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300"
                >
                  <ImageIcon size={20} />
                </Button>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                />

                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`px-4 py-3 font-medium rounded-lg transition-all duration-300 ${
                    newMessage.trim() 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg' 
                      : 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Send size={20} />
                </Button>
              </motion.form>
            </>
          ) : (
            <motion.div 
              className="flex-1 flex items-center justify-center text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center">
                <MessageSquare size={64} className="mx-auto mb-4 text-gray-600" />
                <p className="text-xl">กรุณาเลือกทีมเพื่อเริ่มแชท</p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      {showUserModal && selectedUser && (
        <UserProfileView
          open={showUserModal}
          onClose={() => setShowUserModal(false)}
          user={selectedUser}
          userProducts={userProducts}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="ยืนยันการใช้ระบบกลาง GooseNest"
        message="คุณแน่ใจหรือไม่ว่าต้องการยืนยันการใช้ระบบซื้อขายกลางของ GooseNest?"
        confirmText="ยืนยัน"
        cancelText="ยกเลิก"
        confirmColor="green"
        onConfirm={confirmUseCentralSystem}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </div>
  );
};

export default Chat;
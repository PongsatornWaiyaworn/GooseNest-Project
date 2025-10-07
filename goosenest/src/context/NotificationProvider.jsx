import React, { createContext, useContext, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");
  const location = useLocation();
  const navigate = useNavigate();
  const wsRef = useRef(null);

  useEffect(() => {
    if (!email || !token) {
      console.warn("NotificationProvider: missing email or token");
      return;
    }

    if (!WS_BASE_URL || !WS_BASE_URL.startsWith("ws")) {
      console.error("Invalid WS_BASE_URL:", WS_BASE_URL);
      return;
    }

    const wsUrl = `${WS_BASE_URL}/ws/listen?email=${encodeURIComponent(email)}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("✅ Connected to global message listener");
    };

    wsRef.current.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);

        if (
          message.type === "new_message_notification" &&
          location.pathname !== "/chat"
        ) {
          const res = await fetch(`${BASE_URL}/chat/groups/${message.group_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!res.ok) {
            console.warn("⚠️ Failed to fetch group info");
            return;
          }

          const group = await res.json();

          const audio = new Audio("/level-up-191997.mp3");
          audio.play().catch((e) => console.warn("Audio play failed", e));

          toast.custom(
            (t) => (
              <div
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate("/chat", { state: { group_id: message.group_id } });
                }}
                className="cursor-pointer flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg w-80 hover:bg-gray-50 transition duration-200"
              >
                <img
                  src={group.cover_image || "/default.jpg"}
                  alt="Group Cover"
                  className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                />

                <div className="flex-1">
                  <div className="text-sm text-gray-600">📨 มีข้อความใหม่จากแชท</div>
                  <div className="font-semibold text-gray-800 truncate w-full max-w-[220px]">
                    {group.name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">กรุณาเข้าดู</div>
                </div>
              </div>

            ),
            {
              duration: 5000,
              position: "top-right",
            }
          );
        }
      } catch (error) {
        console.error("❌ Error handling WebSocket message:", error);
      }
    };

    wsRef.current.onerror = (err) => {
      console.error("❌ WebSocket error", err);
    };

    wsRef.current.onclose = (event) => {
      console.log("❌ WebSocket disconnected", event);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [email, token, location.pathname, navigate]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

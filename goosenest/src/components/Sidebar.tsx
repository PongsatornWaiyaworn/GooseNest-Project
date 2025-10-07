import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  MessageSquare,
  User,
  Settings,
  Menu,
  ChevronLeft,
  LogOut,
  ShoppingCart,
  Tag,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmDialog from "@/components/ConfirmDialog";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsActive(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isActive]);

  const handleClick = () => {
    setIsActive(true);
    setIsMobileMenuOpen(true);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        if (!isCollapsed) setIsCollapsed(true);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCollapsed, isMobileMenuOpen]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/profile`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const menuItems = [
    { icon: Home, label: "หน้าแรก", path: "/" },
    { icon: ShoppingCart, label: "ซื้อรหัสเกม", path: "/buy" },
    { icon: Tag, label: "ขายรหัสเกม", path: "/sell" },
    { icon: MessageSquare, label: "แชทซื้อขาย", path: "/chat" },
    { icon: User, label: "โปรไฟล์", path: "/profile" },
    { icon: AlertCircle, label: "แจ้งปัญหา", path: "/report-issue" },
    { icon: FileText, label: "วิธีใช้งาน และกฎระเบียบ", path: "/instructions-and-rules" },
    { icon: Settings, label: "ตั้งค่า", path: "/settings" },
  ];

  const handleNavigation = (path: string) => {
    if (!isLoggedIn && path !== "/") return;
    navigate(path);
    setIsCollapsed(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/");
    setShowConfirmLogout(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-[99]">
        <Button
          variant="ghost"
          className={
            "text-cyan-400 bg-black/80 hover:bg-gray-900 transition-opacity duration-700 " +
            (isActive ? "opacity-100" : "opacity-40")
          }
          onClick={handleClick}
        >
          <Menu size={24} />
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <motion.div
        ref={sidebarRef}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        animate={{ width: isCollapsed ? 64 : 256 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        className={cn(
          "fixed top-0 left-0 h-full z-[9999] bg-gradient-to-b from-gray-900 via-black to-gray-900 text-cyan-300 backdrop-blur-md bg-opacity-80 border-r border-cyan-700/30 shadow-[0_0_15px_#00ffff33] hidden lg:flex flex-col"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-cyan-700 flex items-center justify-between">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-xl font-extrabold tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgb(22,255,255)] max-w-[180px] overflow-hidden whitespace-nowrap text-ellipsis"
          >
            {isLoggedIn && user ? (
              <>
                <img
                  src={user.Image || "/default.jpg"}
                  alt="Profile"
                  className="w-12 h-12 rounded-full border border-cyan-300 shrink-0"
                />
                <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                  {user.NameStore || `${user.FirstName} ${user.LastName}`}
                </span>
              </>
            ) : (
              <>GooseNest</>
            )}
          </motion.span>
        )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-cyan-400 hover:bg-cyan-900"
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            const disabled = !isLoggedIn && item.path !== "/";

            return (
              <Button
                key={item.path}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left hover:bg-cyan-900 transition-colors",
                  isActive &&
                    "bg-cyan-800 border-l-4 border-cyan-400 shadow-[0_0_10px_cyan]",
                  isCollapsed ? "px-2" : "px-3",
                  disabled
                    ? "opacity-40 cursor-not-allowed hover:bg-transparent"
                    : ""
                )}
                onClick={() => handleNavigation(item.path)}
                title={isCollapsed ? item.label : undefined}
                disabled={disabled}
              >
                <Icon size={20} className={cn(isCollapsed ? "mx-auto" : "mr-3")} />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>

        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 border-t border-cyan-700"
          >
            <div className="text-center mb-3">
              <p className="text-sm text-cyan-400">GooseNest v1.0</p>
              <p className="text-xs text-cyan-600">มั่นใจทุกธุรกรรม ปลอดภัยทุกการซื้อขาย</p>
            </div>
            {isLoggedIn && (
              <Button
                variant="ghost"
                className="w-full justify-center text-left hover:bg-red-900 text-red-500 border border-red-500"
                onClick={() => setShowConfirmLogout(true)}
              >
                <LogOut size={20} className="mr-2" />
                ออกจากระบบ
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-80 z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              ref={sidebarRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-gradient-to-b from-gray-900 via-black to-gray-900 backdrop-blur-md bg-opacity-80 border-r border-cyan-700/30 shadow-[0_0_15px_#00ffff33] p-4 z-[9999] text-cyan-300"
            >
              <div className="flex justify-between items-center mb-4">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 text-xl font-extrabold tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgb(22,255,255)] max-w-[180px] overflow-hidden whitespace-nowrap text-ellipsis"
              >
                {isLoggedIn && user ? (
                  <>
                    <img
                      src={user.Image || "/default.jpg"}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border border-cyan-300 shrink-0"
                    />
                    <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                      {user.NameStore || `${user.FirstName} ${user.LastName}`}
                    </span>
                  </>
                ) : (
                  <>GooseNest</>
                )}
              </motion.span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-cyan-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ChevronLeft />
                </Button>
              </div>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const disabled = !isLoggedIn && item.path !== "/";

                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left hover:bg-cyan-900 transition-colors",
                      isActive && "bg-cyan-800 border-l-4 border-cyan-400",
                      disabled &&
                        "opacity-40 cursor-not-allowed hover:bg-transparent"
                    )}
                    onClick={() => {
                      handleNavigation(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={disabled}
                  >
                    <Icon size={20} className="mr-3" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
              {isLoggedIn && (
                <div className="mt-6 border-t border-cyan-700 pt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:bg-red-900"
                    onClick={() => {
                      setShowConfirmLogout(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut size={20} className="mr-3" />
                    ออกจากระบบ
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirm Logout Modal */}
      <AnimatePresence>
        {showConfirmLogout && (
          <ConfirmDialog
            isOpen={showConfirmLogout}
            title="ยืนยันการออกจากระบบ"
            message="คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?"
            confirmText="ออกจากระบบ"
            cancelText="ยกเลิก"
            confirmColor="red"
            onConfirm={confirmLogout}
            onCancel={() => setShowConfirmLogout(false)}
          />        
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

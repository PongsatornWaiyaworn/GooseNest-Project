import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star, ShoppingCart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from '@/components/ui/use-toast'; 
import ConfirmDialog from "./ConfirmDialog";
import { useNavigate } from "react-router-dom";
import ReportPostPopup from "./ReportPostPopup";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const gameCategories = [
    { id: 'favorite', name: 'รายการโปรด', icon: '⭐', color: 'from-yellow-400 to-yellow-600' },
    { id: 'all', name: 'ทั้งหมด', icon: '🎮', color: 'from-cyan-500 to-blue-500' },
    { id: 'ROV', name: 'ROV', icon: 'https://cdn-webth.garenanow.com/webth/rov/mainsite/v2/logo_rov.png', color: 'from-red-500 to-orange-500' },
    { id: 'Free Fire', name: 'Free Fire', icon: 'https://www.mmaglobal.com/files/logos/garena_-_free_fire.png', color: 'from-yellow-500 to-red-500' },
    { id: 'Roblox', name: 'Roblox', icon: 'https://vectorified.com/images/roblox-icon-18.png', color: 'from-green-500 to-emerald-500' },
    { id: 'FIFA Online 4', name: 'FIFA Online 4', icon: 'https://img-cdn.2game.vn/pictures/2game/2018/06/08/d01b7992-2game-logo-fifa-online-4-1.png', color: 'from-blue-500 to-indigo-500' },
    { id: 'FC Mobile', name: 'FC Mobile', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/ac/78/cb/ac78cbaa-bcb9-cc6c-f54d-cd7597d11f95/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.jpg', color: 'from-pink-500 to-purple-500' },
    { id: 'efootball™ (PES)', name: 'efootball™', icon: '/efootball_2024_icon.png', color: 'from-purple-500 to-indigo-500' },
    { id: 'อื่นๆ', name: 'อื่นๆ', icon: '❓', color: 'from-gray-500 to-gray-700' },
];

export default function ProductCard({
  product,
  index,
  mainImages,
  setMainImages,
  likedPosts,
  toggleLike,
  openFullImage,
  openUserProfile,
  toggleMenu,
  openMenuId,
  setOpenMenuId,
  // handleReportClick,
  handlePurchase
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const description = product.listing.description || "";
  const title = product.listing.title || "";
  const [showContactConfirm, setShowContactConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const navigate = useNavigate();

  const maxLength = 360;
  const shouldTruncate = description.length > maxLength;
  const displayedText = !isExpanded && shouldTruncate
    ? description.slice(0, maxLength) + "..."
    : description;

  const displayDate = (() => {
    const now = new Date();
    const created = new Date(product.listing.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHour / 24);

    if (diffSec < 60) return "ไม่กี่วินาทีที่แล้ว";
    if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
    if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
    if (diffDays < 7) return `${diffDays} วันก่อน`;

    return created.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  })();

  async function createChatGroup() {
    setLoading(true);
  
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(BASE_URL + "/chat/group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({
          name: `${product.listing.title}`,
          members: [product.user.email],
          product_id: product.listing.id,
          cover_image: product.listing.images[0],
        }),
      });
  
      if (res.status === 409) {
        const errorData = await res.json();
        setLoading(false);
        setShowContactConfirm(false);
  
        navigate("/chat", { state: { group_id: errorData.group_id } });
        return;
      }
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create group");
      }

      const data = await res.json();
  
      setShowContactConfirm(false);
      setLoading(false);
      toast({
        title: "สร้างแชทสำเร็จ",
        description: "คุณได้สร้างกลุ่มใหม่เรียบร้อยแล้ว",
      });

      navigate("/chat", { state: { group_id: data.group_id } });
  
    } catch (error) {
      setLoading(false);
      setShowContactConfirm(false);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: (error as Error).message,
        variant: "destructive",
      });
      console.error(error);
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-gray-800 border border-gray-700 rounded-xl">
        <CardContent className="p-0">
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between mb-3 cursor-pointer">
              <div
                className="flex items-center space-x-3"
                onClick={() => openUserProfile(product.user)}
              >
                <img
                  src={product.user.image || "/default-profile.png"}
                  alt={product.user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400"
                />
                <div className="flex flex-col">
                  <span className="text-cyan-400 font-semibold text-base leading-tight">
                    {product.user.namestore || `${product.user.firstName} ${product.user.lastName}`}
                  </span>
                  <span className="text-gray-400 text-xs leading-tight mt-0.5">
                    โพสต์เมื่อ {displayDate}
                  </span>
                </div>
              </div>

              <div className="relative inline-block text-left">
                <button
                  onClick={(e) => toggleMenu(e, product.listing.id)}
                  className="text-gray-400 hover:text-white p-1 rounded-full transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM10 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM10 14a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                  </svg>
                </button>
                {openMenuId === product.listing.id && (
                  <div
                    className="absolute right-0 top-5 mt-2 w-36 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(null);
                        setShowReportPopup(true);
                      }}                      
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-800 hover:text-white rounded-md"
                    >
                      รายงานโพสต์
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
              <h2 className="text-xl font-bold text-white mb-2 truncate">{title}</h2>
              {product.listing.game && (() => {
                const game = gameCategories.find(c => c.id === product.listing.game);
                if (!game) return null; // ไม่เจอเกม ให้ไม่แสดงอะไร

                return (
                <p className="text-sm text-cyan-300 mb-2 font-medium flex items-center gap-2">
                    {game.icon.startsWith('http') || game.icon.startsWith('/') ? (
                    <img src={game.icon} alt={game.name} className="w-5 h-5 object-contain" />
                    ) : (
                    <span>{game.icon}</span>
                    )}
                    <span>{game.name}</span>
                </p>
                );
            })()}
              <p className="text-gray-300 whitespace-pre-wrap break-words break-keep">{displayedText}</p>
              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-cyan-400 mt-2 text-sm hover:underline"
                >
                  {isExpanded ? "ดูข้อความน้อยลง" : "ดูเพิ่มเติม"}
                </button>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden">
              <img
                src={
                  mainImages[product.listing.id] ||
                  (product.listing.images?.length > 0 ? product.listing.images[0] : "")
                }
                alt={product.listing.title}
                className="w-full h-96 object-cover rounded-xl cursor-pointer"
                onClick={() =>
                  openFullImage(
                    mainImages[product.listing.id] || product.listing.images[0],
                    product.listing.title
                  )
                }
              />

              {product.listing.images?.length > 1 && (
                <div className="flex space-x-2 mt-3 overflow-x-auto">
                  {product.listing.images.map((img: string, i: number) => (
                    <img
                      key={i}
                      src={img}
                      alt={`${product.listing.title} image ${i + 1}`}
                      className={cn(
                        "w-16 h-16 object-cover rounded-lg cursor-pointer border-2",
                        img === (mainImages[product.listing.id] || product.listing.images[0])
                          ? "border-cyan-400"
                          : "border-transparent hover:border-gray-400"
                      )}
                      onClick={() =>
                        setMainImages((prev) => ({
                          ...prev,
                          [product.listing.id]: img,
                        }))
                      }
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike(product.listing.id)}
                  className={cn(
                    "flex items-center space-x-2",
                    likedPosts?.includes?.(product.listing.id)
                      ? "text-yellow-400"
                      : "text-gray-400 hover:text-yellow-400"
                  )}
                >
                  <Star
                    size={18}
                    className={
                      likedPosts?.includes?.(product.listing.id) ? "fill-current" : ""
                    }
                  />
                  <span>
                    {(() => {
                      const favorites = product.listing.favorites ?? 0;
                      const isLiked = likedPosts?.includes?.(product.listing.id) ? 1 : 0;
                      if (favorites === 1 && isLiked === 1) return 1;
                      return Math.max(favorites - 1, 0) + isLiked;
                    })()}
                  </span>
                </Button>

                <div className="flex space-x-2">
                  <Button 
                    className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl px-6 py-2 font-semibold text-white"
                    onClick={() => setShowContactConfirm(true)}
                  >
                    <MessageCircle size={16} className="mr-2" />
                    ติดต่อทันที
                  </Button>

                  {product.listing.formType === "auto" && (
                    <Button
                      onClick={() => handlePurchase(product)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl px-6 py-2 font-semibold text-white"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      ซื้อเลย
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {showContactConfirm && (
            <ConfirmDialog
              isOpen={showContactConfirm}
              title="ต้องการติดต่อผู้ขายใช่หรือไม่?"
              confirmText={loading ? "กำลังส่ง..." : "ยืนยัน"}
              cancelText="ยกเลิก"
              confirmColor="green"
              onConfirm={createChatGroup}
              onCancel={() => !loading && setShowContactConfirm(false)}
            />
          )}

          <ReportPostPopup
            isOpen={showReportPopup}
            onClose={() => setShowReportPopup(false)}
            listingId={product.listing.id}
            reportedEmail={product.user.email}  
          />

        </CardContent>
      </Card>
    </motion.div>
  );
}

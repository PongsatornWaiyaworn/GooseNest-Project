import React from "react";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, ExternalLink, Users, Facebook, Instagram, MessageSquare } from "lucide-react";
import { FaDiscord } from "react-icons/fa";

const UserProfileView = ({
  open,
  onClose,
  user,
  userProducts = [],
}) => {
  if (!user) return null;

  const displayName =
    user.namestore || user.NameStore || `${user.firstName || user.FirstName || ""} ${user.lastName || user.LastName || ""}`.trim();

  const fullName =
    `${user.firstName || user.FirstName || ""} ${user.lastName || user.LastName || ""}`.trim();

  const username = user.username || user.Username || "ไม่ระบุ";

  const email = user.email || user.Email || "ไม่ระบุ";
  const phone = user.phone || user.Phone || "ไม่ระบุ";
  const address = user.address || user.Address || "ไม่ระบุ";
  const bio = user.bio || user.Bio || "";
  const image = user.image || user.Image || "/default.jpg";
  const games = user.games || user.Games || [];
  const other = user.other || user.Other || null;

  const socialLinks = [
    {
      platform: "Facebook",
      value: user.facebook || user.Facebook,
      icon: Facebook,
      color: "from-blue-600 to-blue-400",
    },
    {
      platform: "Instagram",
      value: user.instagram || user.Instagram,
      icon: Instagram,
      color: "from-pink-500 to-pink-400",
    },
    {
      platform: "Line",
      value: user.line || user.Line,
      icon: MessageSquare,
      color: "from-green-500 to-green-400",
    },
    {
      platform: "Discord",
      value: user.discord || user.Discord,
      icon: FaDiscord,
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  const sortedProducts = [...userProducts].sort(
    (a, b) =>
      new Date(b.listing.updatedAt).getTime() -
      new Date(a.listing.updatedAt).getTime()
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
    >
      <Dialog.Panel className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-xl bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6 shadow-2xl">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 space-y-6">
          {/* Profile Header */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-400/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative">
                  <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
                    <img
                      src={image}
                      alt="Profile"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.5)]"
                    />
                  </motion.div>
                  <div className="absolute bottom-4 right-2 translate-x-1/4 translate-y-1/4 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                    <Users size={16} className="text-white" />
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {displayName}
                  </h2>

                  {user.namestore || user.NameStore ? (
                    <p className="text-purple-300 font-medium">{fullName}</p>
                  ) : (
                    <p className="text-lg text-cyan-300 mb-1">@{username}</p>
                  )}

                  <p className="text-gray-300 text-sm sm:text-base">{bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact + Social */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact */}
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-cyan-400/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400 flex items-center gap-2">
                  <Mail size={20} /> ข้อมูลติดต่อ
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3">
                    <Mail size={16} className="text-cyan-400" />
                    <span className="text-gray-300">{email}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-800/30 rounded-lg p-3">
                    <Phone size={16} className="text-green-400" />
                    <span className="text-gray-300">{phone}</span>
                  </div>
                  <div className="flex items-start gap-3 bg-gray-800/30 rounded-lg p-3">
                    <MapPin size={16} className="text-red-400 mt-1" />
                    <span className="text-gray-300">{address}</span>
                  </div>
                  {other && (
                    <div className="flex items-start gap-3 bg-gray-800/30 rounded-lg p-3">
                      <ExternalLink size={16} className="text-purple-400 mt-1" />
                      <span className="text-gray-300">{other}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-cyan-400/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400 flex items-center gap-2">
                  <Users size={20} /> โซเชียลมีเดีย
                </h3>
                <div className="space-y-3 text-sm">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    if (!social.value) return null;

                    let url = "";
                    if (social.platform === "Facebook") {
                      url = `https://web.facebook.com/search/top/?q=${social.value}`;
                    } else if (social.platform === "Instagram") {
                      url = `https://www.instagram.com/${social.value}`;
                    } else if (social.platform === "Line") {
                      url = `https://line.me/ti/p/~${social.value}`;
                    } else if (social.platform === "Discord") {
                      url = `https://discord.com/login`;
                    }

                    return (
                      <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center gap-3 p-3 bg-gradient-to-r ${social.color} bg-opacity-10 rounded-lg border border-gray-600 hover:border-opacity-50`}
                        >
                          <Icon size={16} className="text-white" />
                          <span className="text-white font-medium">{social.platform}:</span>
                          <span className="text-gray-200">{social.value}</span>
                        </motion.div>
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Games */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">เกมที่ซื้อขาย</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                {Array.isArray(games) && games.length > 0 ? (
                  games.map((game, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/30 px-3 py-1"
                      >
                        {game}
                      </Badge>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-gray-400">ไม่ได้ระบุเกมที่ซื้อขาย</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          {sortedProducts.length > 0 ? (
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400">สินค้าทั้งหมดของผู้ใช้รายนี้</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
                  {sortedProducts.map((item) => (
                    <div key={item.listing.id} className="flex gap-3 items-start bg-gray-800/40 p-3 rounded-lg">
                      <img
                        src={item.listing.images?.[0] || "/default.jpg"}
                        alt={item.listing.title}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-600 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-base sm:text-lg truncate">{item.listing.title}</h4>
                        <p className="text-cyan-400 text-sm font-bold mb-1">
                          ราคา: ฿{item.listing.price?.toLocaleString() || "ไม่ระบุ"}
                        </p>
                        <p className="text-sm text-gray-400 truncate">เกม: {item.listing.game}</p>
                        <p className="text-sm text-gray-300 line-clamp-2">{item.listing.description}</p>
                        <div className="flex flex-wrap items-center text-xs text-gray-500 mt-2 gap-2">
                          <span className="flex items-center gap-1 text-yellow-400">
                            ⭐ {item.listing.favorites || 0} คนถูกใจ
                          </span>
                          <span className="text-gray-400">📅 {new Date(item.listing.createdAt).toLocaleDateString()}</span>
                          <span className={item.listing.status === "active" ? "text-green-400" : "text-red-400"}>
                            {item.listing.status === "active" ? "พร้อมขาย" : "ขายแล้ว"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div></div>
          )}

          {/* ปุ่มปิด */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="bg-cyan-500 hover:bg-cyan-600 text-white rounded px-6 py-2 font-semibold"
            >
              ปิด
            </button>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default UserProfileView;
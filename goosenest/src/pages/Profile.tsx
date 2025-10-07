import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Edit, Mail, Phone, MapPin, Facebook, Instagram, MessageSquare, ExternalLink, Store, Users } from 'lucide-react';
import { FaDiscord } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import FullImageModal from '../components/FullImageModal';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = () => {
  const [showFullImage, setShowFullImage] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/profile`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        });
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleEditProfile = () => {
    navigate('/profile/edit', { state: { user } });
  };

  if (!user) return <p className="text-center mt-10">กำลังโหลดข้อมูล...</p>;

  const socialLinks = [
    { platform: 'Facebook', value: user.Facebook, icon: Facebook, color: 'from-blue-500 to-blue-600' },
    { platform: 'Instagram', value: user.Instagram, icon: Instagram, color: 'from-pink-500 to-purple-600' },
    { platform: 'Line', value: user.Line, icon: MessageSquare, color: 'from-green-500 to-green-600' },
    { platform: 'Discord', value: user.Discord, icon: FaDiscord, color: 'from-indigo-500 to-indigo-600' },
  ];  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6 sm:p-12 justify-center">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            โปรไฟล์ของฉัน
          </h1>
        </div>
      </nav>

      {/* Profile Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Profile Header */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-400/30 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer inline-block"
                >
                  <img
                    onClick={() => setShowFullImage(true)}
                    src={user.Image || "/default.jpg"}
                    alt="Profile"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.5)]"
                  />
                </motion.div>

                <div className="absolute bottom-4 right-2 translate-x-1/4 translate-y-1/4 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <User size={16} className="text-white" />
                </div>
              </div>


                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {user.FirstName} {user.LastName}
                  </h2>
                  <p className="text-lg text-cyan-300 mb-1">@{user.Username}</p>
                  {user.NameStore && (
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                      <Store size={16} className="text-purple-400" />
                      <span className="text-purple-300 font-medium">{user.NameStore}</span>
                    </div>
                  )}
                  <p className="text-gray-300 max-w-2xl leading-relaxed">{user.Bio}</p>
                </div>

                <Button
                  onClick={handleEditProfile}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] transition-all duration-300"
                >
                  <Edit size={16} className="mr-2" />
                  แก้ไขโปรไฟล์
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Contact Information */}
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400 flex items-center gap-2">
                  <Mail size={20} />
                  ข้อมูลติดต่อ
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                    <Mail size={16} className="text-cyan-400" />
                    <span className="text-gray-300">{user.Email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                    <Phone size={16} className="text-green-400" />
                    <span className="text-gray-300">{user.Phone}</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
                    <MapPin size={16} className="text-red-400 mt-1" />
                    <span className="text-gray-300">{user.Address}</span>
                  </div>
                  {user.Other && (
                    <div className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg">
                      <ExternalLink size={16} className="text-purple-400 mt-1" />
                      <span className="text-gray-300">{user.Other}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-cyan-400 flex items-center gap-2">
                  <Users size={20} />
                  โซเชียลมีเดีย
                </h3>
                <div className="space-y-3">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;

                    let url = '';
                    if (social.platform === 'Facebook') {
                      url = `https://web.facebook.com/search/top/?q=${social.value}`;
                    } else if (social.platform === 'Instagram') {
                      url = `https://www.instagram.com/${social.value}`;
                    } else if (social.platform === 'Line') {
                      url = `https://line.me/ti/p/~${social.value}`;
                    } else if (social.platform === 'Discord') {
                      url = `https://discord.com/login`;
                    }

                    return social.value ? (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`flex items-center gap-3 p-3 bg-gradient-to-r ${social.color} bg-opacity-10 rounded-lg border border-gray-600 hover:border-opacity-50`}
                        >
                          <Icon size={16} className="text-white" />
                          <span className="text-white font-medium">{social.platform}:</span>
                          <span className="text-gray-200">{social.value}</span>
                        </motion.div>
                      </a>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Games */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-cyan-400">เกมที่ซื้อขาย</h3>
              <div className="flex flex-wrap gap-2">
                {user.Games.map((game, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300 px-3 py-1"
                    >
                      {game}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      {showFullImage && (
        <FullImageModal
          imageUrl={user.Image}
          alt="Full Profile"
          onClose={() => setShowFullImage(false)}
        />
      )}
    </div>
  );
};

export default Profile;
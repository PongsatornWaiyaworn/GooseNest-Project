import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Search,
  Gamepad2,
  ChevronUp,
} from 'lucide-react';
import axios from 'axios';
import FullImageModal from '@/components/FullImageModal';
import { toast } from '@/components/ui/use-toast';
import UserProfileView from '@/components/UserProfileView';
import { useNavigate } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';

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

const Buy = () => {
  const [selectedGame, setSelectedGame] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const [purchaseStep, setPurchaseStep] = useState(1);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [products, setProducts] = useState([]);
  const [mainImages, setMainImages] = useState({});
  const [showFullImage, setShowFullImage] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState('');
  const [fullImageAlt, setFullImageAlt] = useState('');
  const openFullImage = (url, alt) => {
    setFullImageUrl(url);
    setFullImageAlt(alt);
    setShowFullImage(true);
  }; 
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  }; 

  const filteredProducts = products.filter((product) => {
    const title = product.listing.title || "";
    const description = product.listing.description || "";
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase());
  
    if (selectedGame === 'favorite') {
      console.log("like: ", likedPosts);
      return Array.isArray(likedPosts) && likedPosts.includes(product.listing.id) && matchesSearch;
    } else if (selectedGame === 'all') {
      return matchesSearch;
    } else {
      return product.listing.game === selectedGame && matchesSearch;
    }
  });  
  
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200); 
    };
  
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };  
  
  function openUserProfile(user) {
    setSelectedUser(user);
    setShowUserModal(true);
    const userItems = products.filter(p => p.user.email === user.email);
    setUserProducts(userItems);
  }
  
  useEffect(() => {
    async function fetchUserFavorites() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/user/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLikedPosts(res.data.favoritesListingIds); 
      } catch (err) {
        console.error('Failed to fetch favorites', err);
        setLikedPosts([]); 
      }
    }
  
    fetchUserFavorites();
  }, []); 

  const fallbackImage = "default.jpg";
  useEffect(() => {
    const initialMainImages = {};
    products.forEach(product => {
      initialMainImages[product.id] = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : fallbackImage;
    });
    setMainImages(initialMainImages);
  }, [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/listing/all`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        const sortedProducts = res.data.sort((a, b) => {
          return new Date(b.listing.createdAt).getTime() - new Date(a.listing.createdAt).getTime();
        });
  
        setProducts(sortedProducts);
      } catch (error) {
        console.error('โหลดข้อมูลล้มเหลว:', error);
      }
    };
  
    fetchProducts();
  }, []);  

  const handlePurchase = (product) => {
    setSelectedProduct(product);
    setShowPurchaseModal(true);
    setPurchaseStep(1);
  };

  const confirmPurchase = () => {
    navigate("/purchase", {
      state: {
        listing: selectedProduct.listing,
        user: selectedProduct.user,
      },
    });
  };  

  const toggleLike = async (productId: string) => {
    const token = localStorage.getItem('token');
  
    const alreadyLiked = likedPosts?.includes(productId);
  
    setLikedPosts((prev) =>
      alreadyLiked
        ? Array.isArray(prev) ? prev.filter((id) => id !== productId) : []
        : Array.isArray(prev) ? [...prev, productId] : [productId]
    );
  
    try {
      const response = await axios.put(
        `${BASE_URL}/listing/${productId}/favorite`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
  
      const { isFavorited } = response.data;
  
  
      toast({
        title: isFavorited ? "ถูกใจแล้ว!" : "ยกเลิกถูกใจแล้ว!",
        description: `ประกาศนี้ถูก${isFavorited ? "เพิ่มเข้า" : "ลบออกจาก"}รายการโปรด`,
        variant: "default",
      });
  
    } catch (error) {
      console.error('Toggle favorite failed:', error);
  
      setLikedPosts((prev) =>
        alreadyLiked ? [...prev, productId] : prev.filter((id) => id !== productId)
      );
  
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะรายการโปรดได้",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
    <div className="lg:ml-20 transition-all duration-200">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {/* ส่วนหัว + ปุ่ม */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold py-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  เลือกซื้อรหัสเกม
                </h1>
                <p className="text-gray-400 mt-1">ค้นพบดีลเจ๋งๆ จากเกมเมอร์คนอื่น</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="ค้นหาสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-gray-800/50 border-gray-600 focus:border-cyan-400 rounded-xl h-12"
              />
            </div>

            {/* Game Categories */}
            <div className="flex flex-wrap gap-2 pb-2">
              {gameCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedGame === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedGame(category.id)}
                  className={cn(
                    'flex-shrink-0 rounded-xl transition-all duration-200 h-10',
                    selectedGame === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'border-gray-600 text-gray-300 hover:border-cyan-400 hover:text-cyan-400 bg-gray-800/30'
                  )}
                >
                  <span className="mr-2 flex items-center">
                    {category.icon.startsWith('/efootball') || category.icon.startsWith('http') ? (
                      <img src={category.icon} alt={category.name} className="w-5 h-5 object-contain" />
                    ) : (
                      <span>{category.icon}</span>
                    )}
                  </span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

        {/* Feed */}
        <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {filteredProducts?.map((product, index) => (
          <ProductCard
            key={product.listing.id || index}
            product={product}
            index={index}
            mainImages={mainImages}
            setMainImages={setMainImages}
            likedPosts={likedPosts}
            toggleLike={toggleLike}
            openFullImage={openFullImage}
            openUserProfile={openUserProfile}
            toggleMenu={toggleMenu}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            handlePurchase={handlePurchase}
          />
        ))}

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <Gamepad2 size={64} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl text-gray-400 mb-2">ไม่พบสินค้า</h3>
              <p className="text-gray-500">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่</p>
            </div>
          )}
        </div>

        {/* Purchase Modal */}
        <AnimatePresence>
          {showPurchaseModal && selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700"
              >
                <div className="text-center">
                  <img
                    src={selectedProduct?.listing.images[0]}
                    alt={selectedProduct?.listing.title}
                    className="w-20 h-20 object-cover rounded-xl mx-auto mb-4"
                  />
                  <h3 className="text-xl font-bold text-white mb-2">{selectedProduct?.listing.title}</h3>
                  <div className="text-2xl font-bold text-cyan-400 mb-4">
                    ฿{selectedProduct?.listing.price.toLocaleString()}
                  </div>
                </div>

                {purchaseStep === 1 && (
                  <div>
                    <div className="bg-gray-700/50 rounded-xl p-4 mb-4">
                      <h4 className="font-semibold text-cyan-400 mb-2">รายละเอียดการซื้อ</h4>
                      <div className="space-y-1 text-sm text-gray-300">
                        <div>เกม: {selectedProduct?.listing.game}</div>
                        <div>ชื่อสินค้า: {selectedProduct?.listing.title}</div>
                        <div>ราคา: ฿{selectedProduct?.listing.price.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-xl p-3 mb-4 text-sm text-yellow-200">
                      <div className="font-semibold mb-1">ขั้นตอนการซื้อ:</div>
                      <div>1. ยืนยันการซื้อ</div>
                      <div>2. รหัสเกมจะถูกส่งมาที่บัญชีแอพของคุณ</div>
                      <div>3. ตรวจสอบและยืนยันรหัส</div>
                      <div>4. เงินจะถูกโอนให้ผู้ขาย</div>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={confirmPurchase}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl"
                      >
                        ยืนยันการซื้อ
                      </Button>
                      <Button
                        onClick={() => setShowPurchaseModal(false)}
                        variant="outline"
                        className="flex-1 border-gray-600 text-gray-300 rounded-xl"
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  </div>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-cyan-400/20 hover:bg-cyan-500/30 text-white backdrop-blur-md shadow-[0_0_20px_4px_rgba(34,211,238,0.4)] transition-all duration-300"
              aria-label="เลื่อนขึ้นด้านบน"
            >
              <ChevronUp className="w-6 h-6 text-cyan-200 drop-shadow-md" />
            </motion.button>
          )}
        </AnimatePresence>

      </div>
      {showFullImage && (
        <FullImageModal
          imageUrl={fullImageUrl}
          alt={fullImageAlt}
          onClose={() => setShowFullImage(false)}
        />
      )}
      {showUserModal && selectedUser && (
        <UserProfileView
          open={showUserModal}
          onClose={() => setShowUserModal(false)}
          user={selectedUser}
          userProducts={userProducts}
        />
      )}
    </div>
  );
};

export default Buy;
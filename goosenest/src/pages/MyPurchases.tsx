import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Search,
  ChevronUp,
  Eye,
  EyeOff,
  MessageCircle,
  Copy,
  CheckCircle,
  Calendar,
  Tag,
  User,
  ShoppingBag,
  Clock,
  Star
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface PurchaseItem {
  id: string;
  listing: {
    id: string;
    title: string;
    game: string;
    price: number;
    images: string[];
    description: string;
  };
  seller: {
    id: string;
    email: string;
    username: string;
    avatar?: string;
  };
  gameCode: string;
  status: 'pending' | 'completed' | 'disputed';
  purchaseDate: string;
  isCodeRevealed: boolean;
}

const MyPurchases = () => {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [revealedCodes, setRevealedCodes] = useState<Set<string>>(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  const statusOptions = [
    { id: 'all', name: 'ทั้งหมด', color: 'from-cyan-500 to-blue-500', icon: '📦' },
    { id: 'completed', name: 'สำเร็จ', color: 'from-green-500 to-emerald-500', icon: '✅' },
    { id: 'pending', name: 'รอดำเนินการ', color: 'from-yellow-500 to-orange-500', icon: '⏳' },
    { id: 'disputed', name: 'มีปัญหา', color: 'from-red-500 to-pink-500', icon: '⚠️' },
  ];

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

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        // Simulated API call - replace with actual endpoint
        const mockPurchases: PurchaseItem[] = [
          {
            id: '1',
            listing: {
              id: 'l1',
              title: 'ROV Voucher 100 เพชร',
              game: 'ROV',
              price: 85,
              images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400'],
              description: 'Voucher ROV 100 เพชร แท้ 100%'
            },
            seller: {
              id: 's1',
              email: 'seller1@example.com',
              username: 'GameMaster99',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
            },
            gameCode: 'ROV-ABC123-DEF456-GHI789',
            status: 'completed',
            purchaseDate: '2024-01-15T10:30:00Z',
            isCodeRevealed: false
          },
          {
            id: '2',
            listing: {
              id: 'l2',
              title: 'Free Fire Diamond 500 เพชร',
              game: 'Free Fire',
              price: 159,
              images: ['https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400'],
              description: 'Free Fire Diamond 500 เพชร พร้อมโบนัส'
            },
            seller: {
              id: 's2',
              email: 'seller2@example.com',
              username: 'ProGamer2024',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
            },
            gameCode: 'FF-XYZ789-ABC123-DEF456',
            status: 'pending',
            purchaseDate: '2024-01-16T14:15:00Z',
            isCodeRevealed: false
          },
          {
            id: '3',
            listing: {
              id: 'l3',
              title: 'Roblox Robux 800',
              game: 'Roblox',
              price: 299,
              images: ['https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'],
              description: 'Roblox Robux 800 แท้ 100% ไม่มีปัญหา'
            },
            seller: {
              id: 's3',
              email: 'seller3@example.com',
              username: 'RobloxKing',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=100'
            },
            gameCode: 'RBX-123456-789012-345678',
            status: 'completed',
            purchaseDate: '2024-01-10T09:45:00Z',
            isCodeRevealed: false
          }
        ];
        
        setPurchases(mockPurchases);
      } catch (error) {
        console.error('Failed to fetch purchases:', error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลการซื้อได้",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch = 
      purchase.listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.listing.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.seller.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || purchase.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const toggleCodeReveal = (purchaseId: string) => {
    setRevealedCodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(purchaseId)) {
        newSet.delete(purchaseId);
      } else {
        newSet.add(purchaseId);
      }
      return newSet;
    });
  };

  const copyGameCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "คัดลอกแล้ว!",
      description: "รหัสเกมถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
      variant: "default",
    });
  };

  const openChat = (purchase: PurchaseItem) => {
    // Navigate to chat with seller
    navigate(`/chat/${purchase.seller.id}`, {
      state: {
        seller: purchase.seller,
        purchase: purchase
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { text: 'สำเร็จ', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      pending: { text: 'รอดำเนินการ', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      disputed: { text: 'มีปัญหา', className: 'bg-red-500/20 text-red-400 border-red-500/30' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.className} border rounded-full px-3 py-1`}>
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="lg:ml-20 transition-all duration-200">
        {/* Header */}
        <div className="sticky top-0 z-40 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="space-y-4">
              {/* Title & Stats */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    การซื้อของฉัน
                  </h1>
                  <p className="text-gray-400 mt-1">
                    รายการสินค้าที่คุณซื้อทั้งหมด ({filteredPurchases.length} รายการ)
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">
                      ฿{purchases.reduce((sum, p) => sum + p.listing.price, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">ยอดซื้อทั้งหมด</div>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-cyan-400" />
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="ค้นหาการซื้อ, เกม, หรือผู้ขาย..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:border-cyan-400 focus:outline-none transition"
                />
              </div>

              {/* Status Filter */}
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <Button
                    key={status.id}
                    variant={selectedStatus === status.id ? 'default' : 'outline'}
                    onClick={() => setSelectedStatus(status.id)}
                    className={cn(
                      'flex-shrink-0 rounded-xl transition-all duration-200 h-10',
                      selectedStatus === status.id
                        ? `bg-gradient-to-r ${status.color} text-white shadow-lg`
                        : 'border-gray-600 text-gray-300 hover:border-cyan-400 hover:text-cyan-400 bg-gray-800/30'
                    )}
                  >
                    <span className="mr-2">{status.icon}</span>
                    {status.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Purchase List */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          {filteredPurchases.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag size={64} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl text-gray-400 mb-2">
                {searchTerm || selectedStatus !== 'all' ? 'ไม่พบรายการที่ค้นหา' : 'คุณยังไม่มีการซื้อ'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง' 
                  : 'เริ่มซื้อเกมโค้ดจากเกมเมอร์คนอื่นกันเถอะ'
                }
              </p>
              {!searchTerm && selectedStatus === 'all' && (
                <Button 
                  onClick={() => navigate('/buy')}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl"
                >
                  เริ่มซื้อเลย
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPurchases.map((purchase, index) => (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700 p-6 hover:border-cyan-400/50 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Product Image & Info */}
                      <div className="flex gap-4 flex-1">
                        <img
                          src={purchase.listing.images[0]}
                          alt={purchase.listing.title}
                          className="w-20 h-20 rounded-xl object-cover border border-gray-600"
                        />
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-white">
                                {purchase.listing.title}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Tag className="w-4 h-4" />
                                <span>{purchase.listing.game}</span>
                                <span>•</span>
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(purchase.purchaseDate)}</span>
                              </div>
                            </div>
                            {getStatusBadge(purchase.status)}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-300">
                              <User className="w-4 h-4" />
                              <span>ผู้ขาย: {purchase.seller.username}</span>
                            </div>
                            <div className="text-2xl font-bold text-cyan-400">
                              ฿{purchase.listing.price.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Game Code Section */}
                      {purchase.status === 'completed' && (
                        <div className="lg:w-80 space-y-3">
                          <div className="bg-gray-700/50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-cyan-400">รหัสเกม</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCodeReveal(purchase.id)}
                                className="text-gray-400 hover:text-white p-1 h-auto"
                              >
                                {revealedCodes.has(purchase.id) ? 
                                  <EyeOff className="w-4 h-4" /> : 
                                  <Eye className="w-4 h-4" />
                                }
                              </Button>
                            </div>
                            
                            <div className="font-mono text-sm bg-gray-800 rounded-lg p-3 border border-gray-600">
                              {revealedCodes.has(purchase.id) ? (
                                <div className="flex items-center justify-between">
                                  <span className="text-green-400">{purchase.gameCode}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyGameCode(purchase.gameCode)}
                                    className="text-gray-400 hover:text-white p-1 h-auto ml-2"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-gray-500">••••••••••••••••••••</span>
                              )}
                            </div>
                            
                            {revealedCodes.has(purchase.id) && (
                              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                รหัสพร้อมใช้งาน
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {purchase.status === 'pending' && (
                        <div className="lg:w-80 flex items-center justify-center">
                          <div className="text-center p-4">
                            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                            <div className="text-sm text-yellow-400 font-medium">รอผู้ขายส่งรหัส</div>
                            <div className="text-xs text-gray-400 mt-1">กรุณารอสักครู่</div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col gap-2 lg:w-32">
                        <Button
                          onClick={() => openChat(purchase)}
                          variant="outline"
                          className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 rounded-xl flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          แชท
                        </Button>
                        
                        {purchase.status === 'completed' && (
                          <Button
                            variant="outline"
                            className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 rounded-xl flex items-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            รีวิว
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Scroll to Top Button */}
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
    </div>
  );
};

export default MyPurchases;
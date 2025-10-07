import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import ImageUpload from '@/components/ImageUpload';
import BankAccountManager from '@/components/BankAccountManager';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CreditCard, 
  Edit, 
  Eye, 
  EyeOff, 
  Gamepad2, 
  Plus, 
  Settings, 
  Star, 
  Tag, 
  Trash2, 
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ImageTypeFile {
  type: 'file';
  file: File;
}

interface ImageTypeUrl {
  type: 'url';
  url: string;
}

type ImageType = ImageTypeFile | ImageTypeUrl;

const gamesList = [
  'ROV',
  'Free Fire',
  'Roblox',
  'FIFA Online 4',
  'FC Mobile',
  'efootball™ (PES)',
  'อื่นๆ'
];

interface BankAccount {
  id: string; 
  type: 'bank' | 'promptpay';
  bankName?: string;
  accountNo: string;
  accountName: string;
  isDefault?: boolean;
}

interface Listing {
  id: string;
  game: string;
  title: string;
  price: number;
  description: string;
  images: string[];
  status: string;
  bankAccount: string;
  createdAt: string;
  views: number;
  favorites: number;
  formType: 'simple' | 'auto'; 
  username?: string;        
  password?: string;
  secondPassword?: string;  
}

const Sell = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageType[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [showBankManager, setShowBankManager] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formType, setFormType] = useState('simple');
  const [bankAccountsMap, setBankAccountsMap] = useState<Record<string, BankAccount>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showSecondPassword, setShowSecondPassword] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [formData, setFormData] = useState({
    game: '',
    title: '',
    price: '',
    description: '',
    username: '',
    password: '',
    secondPassword: '',
    formType: formType,
  });

  const fetchAllBankAccounts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/bank-account/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      const map: Record<string, BankAccount> = {};
      res.data.forEach((acc: BankAccount) => {
        map[acc.id] = acc;
      });
  
      setBankAccountsMap(map);
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
    }
  };

  const handleEditListing = async (listing: Listing) => {
    handleCancelForm();
    setEditingListing(listing);
    setFormData({
      game: listing.game || '',
      title: listing.title || '',
      price: listing.price?.toString() || '',
      description: listing.description || '',
      username: listing.username || '',
      password: listing.password || '',
      secondPassword: listing.secondPassword || '',
      formType: listing.formType || 'simple',
    });
      
    try {
      const res = await axios.get(`${BASE_URL}/bank/${listing.bankAccount}`);
      setSelectedAccount(res.data);
    } catch (err) {
      console.error('Failed to fetch bank account:', err);
      toast({
        title: 'โหลดบัญชีธนาคารล้มเหลว',
        description: 'ไม่สามารถโหลดบัญชีธนาคารที่เชื่อมกับโพสต์นี้ได้',
        variant: 'destructive',
      });
    }
  
    setSelectedImages(
      (listing.images || []).map(url => ({ type: 'url', url }))
    );
  
    setShowAddForm(true);

    setTimeout(() => {
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };  

  const handleAdd = async () => {
    handleCancelForm();
    setShowAddForm(!showAddForm);
  };  

  const fetchDefaultAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token');
  
      const response = await axios.get(`${BASE_URL}/bank-account/default`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      return response.data as BankAccount;
    } catch (err) {
      console.error('Error fetching default account:', err);
      return null;
    }
  };  

  useEffect(() => {
    const initDefaultAccount = async () => {
      const defaultAcc = await fetchDefaultAccount();
      if (defaultAcc) {
        setSelectedAccount(defaultAcc);
      }
    };
  
    if (!selectedAccount && !editingListing) {
      initDefaultAccount();
    }
  }, [selectedAccount]);  

  const fetchListings = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/listing/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      const sortedListings = res.data.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  
      setMyListings(sortedListings);
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };  

  useEffect(() => {
    fetchListings();
    fetchAllBankAccounts();
  }, []);

  const handleImageUpload = (images: ImageType[]) => {
    setSelectedImages(images);
  };  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

  if (!selectedAccount) {
    toast({
      title: 'ยังไม่ได้เลือกบัญชีรับเงิน',
      description: 'กรุณาเลือกบัญชีที่จะรับเงิน และดำเนินการต่อ',
      variant: 'destructive',
    });
    return;
  }

  const uploadedImageURLs: string[] = [];

  for (const img of selectedImages) {
    if (img.type === 'file') {
      const imageForm = new FormData();
      imageForm.append('image', img.file);

      try {
        const uploadRes = await fetch(`${BASE_URL}/upload/s3`, {
          method: 'POST',
          body: imageForm,
        });

        const text = await uploadRes.text();
        const data = JSON.parse(text);

        if (data.url) {
          uploadedImageURLs.push(data.url);
        } else {
          throw new Error(data.error || 'อัปโหลดรูปภาพไม่สำเร็จ');
        }
      } catch {
        setIsSubmitting(false);
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: 'ไม่สามารถอัปโหลดรูปภาพได้',
          variant: 'destructive',
        });
        return;
      }
    } else if (img.type === 'url') {
      uploadedImageURLs.push(img.url);
    }
  }
  
  const newListing = {
    game: formData.game,
    title: formData.title,
    price: parseInt(formData.price),
    description: formData.description,
    images: uploadedImageURLs,
    status: 'active',
    bankAccount: selectedAccount.id,
    formType: formData.formType,            
    username: formData.username || '',        
    password: formData.password || '',
    secondPassword: formData.secondPassword || '',
  };  
  
    try {
      let res;
      if (editingListing) {
        res = await axios.put(`${BASE_URL}/listing/${editingListing.id}`, newListing, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
      } else {
        res = await axios.post(`${BASE_URL}/listing/`, newListing, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
      }
  
      toast({
        title: editingListing ? 'แก้ไขสินค้าสำเร็จ' : 'อัพโหลดสินค้าสำเร็จ',
        description: 'ข้อมูลสินค้าของคุณถูกบันทึกเรียบร้อย',
      });

      setIsSubmitting(false);

      setMyListings(
        editingListing
          ? myListings.map((item) => (item.id === editingListing.id ? res.data : item))
          : [res.data, ...myListings]
      );
  
      setShowAddForm(false);
      setFormData({ game: '', title: '', price: '', description: '',username: '', password: '', secondPassword: '', formType: 'simple',});
      setSelectedImages([]);
      setSelectedAccount(null);
      setEditingListing(null);
      window.location.reload();
      fetchListings();
    } catch (err) {
      setIsSubmitting(false);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: err.response?.data?.error || 'ไม่สามารถบันทึกสินค้าได้',
        variant: 'destructive',
      });
    }
  };  

  const handleSelectChange = (e) => {
    handleInputChange(e); 
    setFormType(e.target.value); 
  };  

  const handleDelete = async (listingId: string) => {
    const confirmDelete = confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?');
    if (!confirmDelete) return;
  
    try {
      const res = await axios.delete(`${BASE_URL}/listing/${listingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log(res)
  
      toast({
        title: 'ลบสินค้าสำเร็จ',
        description: 'รายการสินค้าถูกลบเรียบร้อยแล้ว',
      });
  
      setMyListings(myListings.filter((item) => item.id !== listingId));
    } catch (err) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: err.response?.data?.error || 'ไม่สามารถลบสินค้าได้',
        variant: 'destructive',
      });
    }
  };  

  const handleRefundAction = async (listingId: string, action: 'approve' | 'reject') => {
    try {
      await axios.put(`${BASE_URL}/listing/${listingId}/refund`, 
        { action },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      toast({
        title: action === 'approve' ? 'อนุมัติการคืนเงินแล้ว' : 'ปฏิเสธการคืนเงินแล้ว',
        description: action === 'approve' ? 'เงินจะถูกโอนคืนให้ลูกค้า' : 'การขอคืนเงินถูกปฏิเสธ',
      });

      fetchListings();
    } catch {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถดำเนินการได้',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setFormType(formData.formType)
  };  

  const handleCancelForm = () => {
    setShowAddForm(false);
    setSelectedAccount(null);
    setFormData({ game: '', title: '', price: '', description: '',username: '', password: '', secondPassword: '', formType: 'simple', });
    setSelectedImages([]);
    setEditingListing(null);
  };  

  const filteredListings = myListings.filter(listing => {
    if (selectedFilter === 'all') return true;
    return listing.status === selectedFilter;
  });

  const canEdit = (status: string) => status === 'active';
  const canDelete = (status: string) => status === 'active' || status === 'inactive';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      
      <div className="lg:ml-20 transition-all duration-200">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-transparent backdrop-blur-none border-b border-transparent">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  ขายรหัสเกม
                </h1>
                <p className="text-gray-400 mt-1">จัดการและเพิ่มสินค้าของคุณ</p>
              </div>
              <div className="flex space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handleAdd()}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="mr-2" size={20} />
                    เพิ่มสินค้าใหม่
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {showAddForm ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-2xl overflow-hidden">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-cyan-400">
                    {editingListing ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="game" className="text-gray-300">
                        เกม
                      </Label>
                      <select
                        id="game"
                        name="game"
                        value={formData.game}
                        onChange={handleInputChange}
                        className="w-full mt-2 bg-gray-700 border border-gray-600 rounded-xl p-3 text-white"
                        required
                      >
                        <option value="" disabled>
                          เลือกเกม
                        </option>
                        {gamesList.map((game) => (
                          <option key={game} value={game}>
                            {game}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="title" className="text-gray-300">
                        ชื่อสินค้า
                      </Label>
                      <Input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="bg-gray-700 border border-gray-600 rounded-xl text-white"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="price" className="text-gray-300">
                        ราคา
                      </Label>
                      <Input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="bg-gray-700 border border-gray-600 rounded-xl text-white"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-gray-300">
                        รายละเอียด
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="bg-gray-700 border border-gray-600 rounded-xl text-white resize-none"
                        required
                      />
                    </div>

                    <div>
                      <Label className="text-gray-300">รูปภาพ</Label>
                      <ImageUpload onImagesChange={handleImageUpload} initialUrls={editingListing?.images} />
                    </div>

                    <div>
                      <Label htmlFor="formType" className="text-gray-300">
                        ประเภทฟอร์ม
                      </Label>
                      <select
                        id="formType"
                        name="formType"
                        value={formData.formType}
                        onChange={handleSelectChange}
                        className="w-full mt-2 bg-gray-700 border border-gray-600 rounded-xl p-3 text-white"
                        required
                      >
                        <option value="simple">ติดต่อก่อนซื้อ</option>
                        <option value="auto" disabled className="text-gray-400 cursor-not-allowed">ขายอัตโนมัติ (ยังไม่เปิดใช้งาน)</option>
                      </select>
                    </div>

                    {formType === 'auto' && (
                    <>
                    <div>
                      <Label className="text-gray-300">บัญชีรับเงิน</Label>
                      <div className="flex items-center space-x-4">
                        {selectedAccount ? (
                          <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-xl">
                            <CreditCard className="text-cyan-400" size={20} />
                            <div>
                              <p className="font-semibold text-white">{selectedAccount.accountName}</p>
                              <p className="text-sm text-gray-400">
                                {selectedAccount.accountNo} ({selectedAccount.bankName || 'พร้อมเพย์'})
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-400">ยังไม่ได้เลือกบัญชี</p>
                        )}
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setShowBankManager(true)}
                        >
                          <Settings className="mr-2" size={16} />
                          จัดการบัญชี
                        </Button>
                      </div>
                    </div>
                        <div>
                          <Label htmlFor="username" className="text-gray-300">
                            ชื่อผู้ใช้
                          </Label>
                          <Input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="bg-gray-700 border border-gray-600 rounded-xl text-white"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="password" className="text-gray-300">
                            รหัสผ่าน
                          </Label>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              id="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              className="bg-gray-700 border border-gray-600 rounded-xl text-white pr-10"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="secondPassword" className="text-gray-300">
                            รหัสผ่านสำรอง
                          </Label>
                          <div className="relative">
                            <Input
                              type={showSecondPassword ? 'text' : 'password'}
                              id="secondPassword"
                              name="secondPassword"
                              value={formData.secondPassword}
                              onChange={handleInputChange}
                              className="bg-gray-700 border border-gray-600 rounded-xl text-white pr-10"
                              required
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowSecondPassword(!showSecondPassword)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            >
                              {showSecondPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-end space-x-4">
                      <Button variant="ghost" onClick={handleCancelForm}>
                        ยกเลิก
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            กำลังบันทึก...
                            <Clock className="ml-2 h-4 w-4 animate-spin" />
                          </>
                        ) : (
                          editingListing ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}

          {/* My Listings */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-cyan-400 flex items-center">
                <TrendingUp className="mr-3" size={24} />
                สินค้าของฉัน ({filteredListings?.length})
              </h2>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-8">
              {filterOptions.map((filter) => {
                const Icon = filter.icon;
                return (
                  <Button
                    key={filter.id}
                    variant={selectedFilter === filter.id ? 'default' : 'outline'}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={cn(
                      'flex-shrink-0 rounded-xl transition-all duration-200 h-10',
                      selectedFilter === filter.id
                        ? `bg-gradient-to-r ${filter.color} text-white shadow-lg`
                        : 'border-gray-600 text-gray-300 hover:border-cyan-400 hover:text-cyan-400 bg-gray-800/30'
                    )}
                  >
                    <Icon className="mr-2" size={16} />
                    {filter.name}
                  </Button>
                );
              })}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings?.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-cyan-400/50 transition-all duration-300 rounded-2xl overflow-hidden h-full">
                    <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={
                          Array.isArray(listing.images) && listing.images.length > 0
                            ? listing.images[0]
                            : "/fallback-image.jpg"
                        }
                        alt={listing?.title ?? "No title"}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      <div className="absolute top-3 right-3 space-y-1 flex flex-col items-end">
                        <div
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
                            listing.status === "active"
                              ? "bg-green-500/80 text-white"
                              : listing.status === "sold"
                              ? "bg-blue-500/80 text-white"
                              : listing.status === "refund"
                              ? "bg-yellow-500/80 text-white"
                              : "bg-red-500/80 text-white"
                          )}
                        >
                          {listing.status === "active" ? "พร้อมขาย" 
                           : listing.status === "sold" ? "ขายแล้ว"
                           : listing.status === "refund" ? "ขอเงินคืน"
                           : "โดนระงับ"}
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-blue-500/80 text-white">
                          {listing.formType === "auto" ? "ขายอัตโนมัติ" : "ติดต่อก่อนซื้อ"}
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center text-xs text-white/80">
                          <Gamepad2 size={14} className="mr-1" />
                          {listing.game}
                        </div>
                      </div>
                    </div>

                      <div className="p-4 space-y-3">
                        <h3 className="font-bold text-white text-lg leading-tight">{listing.title}</h3>
                        <p className="text-sm text-gray-300 line-clamp-2">{listing.description}</p>
                        
                        <div className="flex items-center justify-between">
                        <div className="flex items-center text-cyan-400 font-bold text-xl">
                          <Tag size={18} className="mr-1" />
                          ฿{typeof listing.price === 'number' ? listing.price.toLocaleString() : 'ไม่ระบุ'}
                        </div>
                        <div className="flex items-start text-xs text-gray-400 leading-snug">
                          <CreditCard size={14} className="mr-2 mt-0.5 shrink-0 text-cyan-400" />
                          <div className="flex flex-col">
                            <span className="font-medium text-white">
                              {bankAccountsMap[listing.bankAccount]?.accountName || 'ไม่พบชื่อบัญชี'}
                            </span>
                            <span>
                              {bankAccountsMap[listing.bankAccount]
                                ? `${bankAccountsMap[listing.bankAccount].accountNo} ${bankAccountsMap[listing.bankAccount].bankName || "พร้อมเพย์"}`
                                : 'ไม่พบเลขบัญชีหรือธนาคาร'}
                            </span>
                          </div>
                        </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-700">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                              <Star size={12} className="mr-1" />
                              {listing.favorites}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Clock size={12} className="mr-1" />
                            {listing.createdAt}
                          </div>
                        </div>

                        {/* Conditional Action Buttons */}
                        <div className="flex space-x-2 pt-3">
                          {listing.status === 'refund' ? (
                            <>
                              <Button
                                size="sm"
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                                onClick={() => handleRefundAction(listing.id, 'approve')}
                              >
                                <CheckCircle size={14} className="mr-1" />
                                อนุมัติคืนเงิน
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-red-400 text-red-400 hover:bg-red-400 hover:text-white rounded-lg"
                                onClick={() => handleRefundAction(listing.id, 'reject')}
                              >
                                <XCircle size={14} className="mr-1" />
                                ปฏิเสธ
                              </Button>
                            </>
                          ) : (
                            <>
                              {canEdit(listing.status) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black rounded-lg"
                                  onClick={() => handleEditListing(listing)}
                                >
                                  <Edit size={14} className="mr-1" />
                                  แก้ไข
                                </Button>
                              )}
                              {canDelete(listing.status) && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex-1 border-red-400 text-red-400 hover:bg-red-400 hover:text-white rounded-lg"
                                  onClick={() => handleDelete(listing.id)}
                                >
                                  <Trash2 size={14} className="mr-1" />
                                  ลบ
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredListings.length === 0 && (
              <div className="text-center py-16">
                <AlertTriangle size={64} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl text-gray-400 mb-2">ไม่พบสินค้าในหมวดหมู่นี้</h3>
                <p className="text-gray-500">ลองเปลี่ยนตัวกรองหรือเพิ่มสินค้าใหม่</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bank Account Manager Modal */}
      {showBankManager && (
        <BankAccountManager
          onClose={() => setShowBankManager(false)}
          onAccountSelect={(account) => {
            setSelectedAccount(account);
            setShowBankManager(false); 
          }}
          selectedAccount={selectedAccount}
        />
      )}
    </div>
  );
};

export default Sell;

const filterOptions = [
  { id: 'all', name: 'ทั้งหมด', icon: Package, color: 'from-gray-500 to-gray-600' },
  { id: 'active', name: 'กำลังขาย', icon: ShoppingCart, color: 'from-green-500 to-emerald-600' },
  { id: 'sold', name: 'ขายออกแล้ว', icon: CheckCircle, color: 'from-blue-500 to-indigo-600' },
  { id: 'refund', name: 'ขอเงินคืน', icon: RefreshCw, color: 'from-yellow-500 to-orange-600' },
  { id: 'inactive', name: 'โดนระงับการขาย', icon: XCircle, color: 'from-red-500 to-pink-600' },
];
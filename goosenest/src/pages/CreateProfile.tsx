import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Upload, User, Phone, MapPin, Save, Store, MessageCircleMore, Instagram, Facebook, Loader2 } from 'lucide-react'; 
import { useToast } from '@/hooks/use-toast';
import ImageCropper from '@/components/ImageCropper'
import FullImageModal from '../components/FullImageModal';
import { useAuth } from '@/context/AuthContext';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const gamesList = [
    'ROV',
    'Free Fire',
    'Roblox',
    'FIFA Online 4',
    'FC Mobile',
    'efootball™ (PES)',
    'อื่นๆ'
  ];
  
  type LocationState = {
    email?: string;
    username?: string;
    password?: string;
  };
  
  const CreateProfile = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [showFullImage, setShowFullImage] = useState(false);
    const state = location.state as LocationState;
    const { login } = useAuth();  
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      image: '',
      namestore: '',
      email: '',
      username: '',
      password: '',
      phone: '',
      address: '',
      facebook: '',
      instagram: '',
      line: '',
      discord: '',
      bio: '',
      games: [] as string[],
    });
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | string | null>(null);
    const [rawImage, setRawImage] = useState(null);
    const [cropping, setCropping] = useState(false);
    
    const handleCropDone = (croppedUrl) => {
      setProfileImage(croppedUrl);
      setCropping(false);
    };
    
    const handleCropCancel = () => {
      setCropping(false);
    };
    
    useEffect(() => {
      if (!state || !state.email) {
        navigate("/login");
      } else {
        setFormData((prev) => ({
          ...prev,
          email: state.email || '',
          username: state.username || '',
          password: state.password || '',
        }));
      }
    }, [state, navigate]);

    useEffect(() => {
      if (cropping) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    
      return () => {
        document.body.style.overflow = '';
      };
    }, [cropping]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
    
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "ขนาดไฟล์ใหญ่เกินไป",
          description: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB",
          variant: "destructive",
        });
        return;
      }
    
      const reader = new FileReader();
    
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string") {
          setRawImage(reader.result);
          setCropping(true);
          setImageFile(file);
        }
      };
    
      reader.readAsDataURL(file);
    };    

  const handleGameChange = (game: string) => {
    setFormData(prev => {
      const games = prev.games.includes(game)
        ? prev.games.filter(g => g !== game)
        : [...prev.games, game];
      return {
        ...prev,
        games
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true)
  
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "ชื่อ นามสกุล และอีเมลเป็นข้อมูลที่จำเป็น",
        variant: "destructive"
      });
      setIsLoading(false)
      return;
    }
  
    try {
      let imageUrl = "";
  
      if (imageFile) {
        let fileToUpload: File;
  
        if (typeof imageFile === "string" && imageFile.startsWith("blob:")) {
          const blob = await fetch(imageFile).then(res => res.blob());
          fileToUpload = new File([blob], "profile.jpg", { type: blob.type });
        } else {
          fileToUpload = imageFile as File;
        }
  
        const imageForm = new FormData();
        imageForm.append("image", fileToUpload);
  
        const uploadRes = await fetch(`${BASE_URL}/upload/s3`, {
          method: "POST",
          body: imageForm
        });
  
        type UploadResponse = {
          url?: string;
          error?: string;
        };
        
        let uploadData: UploadResponse = {};
  
        const text = await uploadRes.text(); 
  
        try {
          uploadData = JSON.parse(text); 
          setIsLoading(false)
        } catch (e) {
          setIsLoading(false)
          console.error("JSON parse failed", e);
          console.error("Response is not JSON:", text);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "รูปภาพอัปโหลดสำเร็จหรือไม่ก็ไม่แน่ใจ เพราะเซิร์ฟเวอร์ไม่ตอบกลับ JSON",
            variant: "destructive"
          });
          return;
        }
  
        if (!uploadRes.ok) {
          setIsLoading(false)
          toast({
            title: "อัปโหลดรูปไม่สำเร็จ",
            description: uploadData?.error || "เกิดข้อผิดพลาดขณะอัปโหลดรูป",
            variant: "destructive"
          });
          return;
        }
  
        imageUrl = uploadData.url || "";
      }
  
      const form = new FormData();
  
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "games" && Array.isArray(value)) {
          value.forEach(game => form.append("games", game));
        } else if (key === "image") {
          form.append("image", imageUrl);
        } else if (typeof value === "string") {
          form.append(key, value);
        }
      });
  
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        body: form
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        setIsLoading(false)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: data?.error || "ไม่สามารถสร้างโปรไฟล์ได้",
          variant: "destructive"
        });
      } else {
        setIsLoading(false)
        toast({
          title: "สร้างโปรไฟล์สำเร็จ!",
          description: "โปรไฟล์ของคุณได้ถูกสร้างเรียบร้อยแล้ว"
        });
        localStorage.setItem("token", data.token);
        login();
        navigate("/");
      }
  
    } catch (error) {
      setIsLoading(false)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        variant: "destructive"
      });
      console.error("Register error:", error);
    }
  };  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center px-4 py-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Back to Home Button */}
        <Link to="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          กลับหน้าหลัก
        </Link>

        <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              สร้างโปรไฟล์
            </CardTitle>
            <p className="text-gray-300 text-sm">กรอกข้อมูลเพื่อสร้างโปรไฟล์ของคุณ</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-24 h-24 cursor-pointer rounded-full border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                    <AvatarImage src={profileImage || "/default.jpg"} onClick={() => setShowFullImage(true) }/>
                    <AvatarFallback className="bg-gray-700 text-cyan-400">
                      <User size={32} />
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-image"
                    className="absolute -bottom-1 -right-2 bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg"
                  >
                    <Upload size={26} />
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-white mt-2 text-center font-medium">
                    {formData.namestore
                    ? formData.namestore
                    : `${formData.firstName} ${formData.lastName}`}
                </p>
                <p className="text-xs text-gray-400 text-center">
                  คลิกที่ปุ่มอัพโหลดเพื่อเพิ่มรูปโปรไฟล์ (ขนาดไม่เกิน 5MB)
                </p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300">ชื่อ *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="กรอกชื่อของคุณ"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300">นามสกุล *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="กรอกนามสกุลของคุณ"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Name store */}
              <div className="space-y-2">
                <Label htmlFor="namestore" className="text-gray-300">ชื่อร้าน</Label>
                <div className="relative">
                    <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                    id="namestore"
                    name="namestore"
                    type="text"
                    placeholder="กรอกชื่อร้านของคุณ (ถ้ามี)"
                    value={formData.namestore}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                    />
                </div>
                </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-300">แนะนำตัว</Label>
                <textarea
                  id="bio"
                  name="bio"
                  placeholder="เขียนแนะนำตัวสั้นๆ..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400 focus:outline-none resize-none"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">เบอร์โทรศัพท์</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="กรอกเบอร์โทรศัพท์ของคุณ"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-gray-300">ที่อยู่</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="กรอกที่อยู่ของคุณ"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-gray-300">Facebook</Label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="facebook"
                    name="facebook"
                    type="text"
                    placeholder="กรอก Facebook ของคุณ (ถ้ามี)"
                    value={formData.facebook}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-gray-300">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="instagram"
                    name="instagram"
                    type="text"
                    placeholder="กรอก Instagram ของคุณ (ถ้ามี)"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="line" className="text-gray-300">Line</Label>
                <div className="relative">
                  <MessageCircleMore className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="line"
                    name="line"
                    type="text"
                    placeholder="กรอก Line ของคุณ (ถ้ามี)"
                    value={formData.line}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discord" className="text-gray-300">Discord</Label>
                <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 245 240"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M104.4 104.2c-5.7 0-10.2 5-10.2 11.2s4.5 11.3 10.2 11.3c5.6 0 10.2-5.1 10.2-11.3.1-6.2-4.5-11.2-10.2-11.2zm36.3 0c-5.7 0-10.2 5-10.2 11.2s4.5 11.3 10.2 11.3c5.6 0 10.2-5.1 10.2-11.3s-4.5-11.2-10.2-11.2z"/><path d="M189.5 20H55.2C42.3 20 32 30.4 32 43.3v140.6c0 12.9 10.3 23.3 23.2 23.3h111.2l-5.2-18.1 12.6 11.7 11.9 11 21.1 18.4V43.3c.1-12.9-10.2-23.3-23.1-23.3zM161.3 154.6s-5.3-6.3-9.7-11.9c19.3-5.4 26.6-17.3 26.6-17.3-6 3.9-11.7 6.6-16.8 8.4-7.3 3.1-14.3 5.1-21.1 6.3-14 2.6-26.8 1.9-37.9-.1-8.3-1.6-15.4-3.9-21.3-6.3-3.3-1.3-6.9-2.9-10.5-4.9-.4-.2-.8-.4-1.2-.6-.3-.2-.5-.3-.7-.5-3.1-1.7-4.8-2.9-4.8-2.9s7.1 11.8 25.8 17.3c-4.4 5.6-9.8 12.2-9.8 12.2-32.3-1-44.6-22.2-44.6-22.2 0-47 21-85.1 21-85.1 21-15.8 40.9-15.3 40.9-15.3l1.5 1.8c-26.3 7.6-38.4 19.1-38.4 19.1s3.2-1.8 8.6-4.3c15.6-6.9 27.9-8.8 33-9.2.8-.1 1.4-.2 2.1-.2 7.6-1 16.2-1.2 25.1-.2 11.8 1.3 24.4 4.6 37.3 11.3 0 0-11.5-10.9-36.4-18.5l2.1-2.4s19.9-.5 40.9 15.3c0 0 21 38.1 21 85.1 0-.1-12.5 21.1-44.8 22.1z"/>
                </svg>
                  <Input
                    id="discord"
                    name="discord"
                    type="text"
                    placeholder="กรอก Discord ของคุณ (ถ้ามี)"
                    value={formData.discord}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Games Multi-Select */}
              <div className="space-y-2">
                <Label className="text-gray-300">เกมที่ซื้อชาย (เลือกได้มากกว่า 1 เกม)</Label>
                <div className="flex flex-wrap gap-4">
                  {gamesList.map(game => (
                    <label
                      key={game}
                      className="inline-flex items-center space-x-2 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={formData.games.includes(game)}
                        onChange={() => handleGameChange(game)}
                        className="form-checkbox text-cyan-500"
                      />
                      <span>{game}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={18} />
                    กำลังสร้าง...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={18} />
                    สร้างโปรไฟล์
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-gray-300 text-sm">
                มีบัญชีอยู่แล้ว?{' '}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {cropping && (
        <ImageCropper
          image={rawImage}
          onCropDone={handleCropDone}
          onCancel={handleCropCancel}
          size={300} 
        />
      )}
      {showFullImage && (
        <FullImageModal
          imageUrl={profileImage || "/default.jpg"}
          alt="Full Profile"
          onClose={() => setShowFullImage(false)}
        />
      )}
    </div>
  );
};

export default CreateProfile;
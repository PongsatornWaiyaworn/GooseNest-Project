import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLocation, useNavigate } from 'react-router-dom';
import { Save, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FullImageModal from '../components/FullImageModal';
import ImageCropper from '@/components/ImageCropper'
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

interface UserData {
  FirstName: string;
  LastName: string;
  NameStore: string;
  Email: string;
  Username: string;
  Phone: string;
  Address: string;
  Facebook: string;
  Instagram: string;
  Line: string;
  Discord: string;
  Bio: string;
  Games: string[];
  Image: string;
}

const ProfileEdit: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | string | null>(null);
  const [rawImage, setRawImage] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const userFromState = location.state?.user as UserData | undefined;

  const [userData, setUserData] = useState<UserData | null>(userFromState);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userFromState) {
      setUserData(userFromState);
    } else {
      navigate("/profile");
    }
  },[]);  

  const handleInputChange = (field: keyof UserData, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCropDone = (croppedUrl) => {
    setProfileImage(croppedUrl);
    setCropping(false);
  };  
  
  const handleCropCancel = () => {
    setCropping(false);
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
        setRawImage(result); 
        setCropping(true);
        setImageFile(file);
      }
    };
  
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      let imageUrl = "";

      if (imageFile) {
        let fileToUpload: File;

        if (typeof imageFile === "string" && imageFile.startsWith("blob:")) {
          const blob = await fetch(imageFile).then((res) => res.blob());
          fileToUpload = new File([blob], "profile.jpg", { type: blob.type });
        } else {
          fileToUpload = imageFile as File;
        }

        const imageForm = new FormData();
        imageForm.append("image", fileToUpload);

        const uploadRes = await fetch(`${BASE_URL}/upload/s3`, {
          method: "POST",
          body: imageForm,
        });

        const text = await uploadRes.text();
        let uploadData: { url?: string; error?: string } = {};

        try {
          uploadData = JSON.parse(text);
        } catch {
          console.error("Response is not valid JSON:", text);
          toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถแปลงข้อมูลรูปภาพจากเซิร์ฟเวอร์ได้",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (!uploadRes.ok || !uploadData.url) {
          toast({
            title: "อัปโหลดรูปไม่สำเร็จ",
            description: uploadData.error || "เกิดข้อผิดพลาดระหว่างอัปโหลด",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        imageUrl = uploadData.url;
      }

      if(!imageUrl){
        imageUrl = userData.Image;
      }

      function lowerFirstChar(str) {
        if (!str) return str;
        if (str === "NameStore") return str.toLowerCase();
        return str.charAt(0).toLowerCase() + str.slice(1);
      }

      const form = new FormData();

      Object.entries(userData).forEach(([key, value]) => {
        if (key === "Games" && Array.isArray(value)) {
          value.forEach((game) => form.append("games", game)); 
        } else if (key === "Image") {
          form.append("image", imageUrl); 
        } else if (typeof value === "string") {
          form.append(lowerFirstChar(key), value); 
        }
      });   

      const res = await fetch(`${BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, 
        },
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: data?.error || "ไม่สามารถอัปเดตโปรไฟล์ได้",
          variant: "destructive",
        });
      } else {
        toast({
          title: "อัปเดตโปรไฟล์สำเร็จ",
          description: "ข้อมูลโปรไฟล์ของคุณถูกบันทึกแล้ว",
        });
        navigate("/profile"); 
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Update profile error:", err);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  const inputGroups = [
    {
      title: "ข้อมูลส่วนตัว",
      fields: [
        { key: "FirstName", label: "ชื่อ", type: "text" },
        { key: "LastName", label: "นามสกุล", type: "text" },
        { key: "Username", label: "ชื่อผู้ใช้", type: "text", disabled: true },
        { key: "NameStore", label: "ชื่อร้านค้า", type: "text" },
      ]
    },
    {
      title: "ข้อมูลติดต่อ",
      fields: [
        { key: "Email", label: "อีเมล", type: "email" },
        { key: "Phone", label: "เบอร์โทรศัพท์", type: "tel" },
        { key: "Address", label: "ที่อยู่", type: "textarea" },
      ]
    },
    {
      title: "โซเชียลมีเดีย",
      fields: [
        { key: "Facebook", label: "Facebook", type: "text" },
        { key: "Instagram", label: "Instagram", type: "text" },
        { key: "Line", label: "Line", type: "text" },
        { key: "Discord", label: "Discord", type: "text" },
      ]
    }
  ];

  const handleGameChange = (game: string) => {
    setUserData(prev => {
      if (!prev) return prev;
      const alreadySelected = prev.Games.includes(game);
      const updatedGames = alreadySelected
        ? prev.Games.filter(g => g !== game)
        : [...prev.Games, game];
      return {
        ...prev,
        Games: updatedGames
      };
    });
  };

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
            แก้ไขโปรไฟล์
          </h1>
        </div>
      </nav>

      {/* Edit Form */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Profile Image */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-400/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={profileImage || userData.Image || "/default.jpg"}
                    onClick={() => setShowFullImage(true)}
                    alt="Profile"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-cyan-400/50 cursor-pointer"
                  />
                  <label
                    htmlFor="profile-image"
                    className="absolute -bottom-1 -right-2 bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg"
                  >
                    <Upload size={32} />
                  </label>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-gray-400">คลิกที่ปุ่มอัพโหลดเพื่อเปลี่ยนรูปโปรไฟล์ (ขนาดไม่เกิน 5MB)</p>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400">เกี่ยวกับฉัน</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={userData.Bio}
                onChange={(e) => handleInputChange("Bio", e.target.value)}
                placeholder="บอกเล่าเกี่ยวกับตัวคุณหรือร้านค้าของคุณ..."
                className="bg-gray-800/50 border-gray-600 focus:border-cyan-400 text-white placeholder-gray-400"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Form Groups */}
          {inputGroups.map((group, groupIndex) => (
            <Card key={groupIndex} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-cyan-400">{group.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {group.fields.map((field) => (
                    <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                      <Label htmlFor={field.key} className="text-gray-300 mb-2 block">
                        {field.label}
                      </Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          id={field.key}
                          value={userData[field.key as keyof typeof userData] as string}
                          onChange={(e) => handleInputChange(field.key as keyof UserData, e.target.value)}
                          className="bg-gray-800/50 border-gray-600 focus:border-cyan-400 text-white placeholder-gray-400"
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={field.key}
                          type={field.type}
                          value={userData[field.key as keyof typeof userData] as string}
                          onChange={(e) => handleInputChange(field.key as keyof UserData, e.target.value)}
                          disabled={field.disabled ?? false}  // disable username
                          className="bg-gray-800/50 border-gray-600 focus:border-cyan-400 text-white placeholder-gray-400"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Games */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-cyan-400">เกมที่สนใจ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-white">
              {gamesList.map(game => (
                <label
                  key={game}
                  className="inline-flex items-center space-x-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={userData?.Games.includes(game)}
                    onChange={() => handleGameChange(game)}
                    className="form-checkbox text-cyan-500"
                  />
                  <span>{game}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-cyan-500 hover:bg-cyan-600"
            >
              {isLoading ? "กำลังบันทึก..." : (
                <>
                  <Save size={16} className="mr-2" /> บันทึก
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
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
          imageUrl={profileImage || userData.Image || "/default.jpg"}
          alt="Full Profile"
          onClose={() => setShowFullImage(false)}
        />
      )}
    </div>
  );
};

export default ProfileEdit;

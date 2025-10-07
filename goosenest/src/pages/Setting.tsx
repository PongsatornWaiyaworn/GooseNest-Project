import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Lock, 
  Palette, 
  Globe, 
  Shield, 
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button
            onClick={handleGoBack}
            variant="ghost"
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10"
          >
            <ArrowLeft className="mr-2" size={16} />
            กลับหน้าหลัก
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            ตั้งค่า
          </h1>
          <div className="w-20"></div>
        </div>
      </nav>

      {/* Settings Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Account Settings */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-400/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <SettingsIcon size={20} />
                การตั้งค่าบัญชี
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">โปรไฟล์สาธารณะ</h3>
                  <p className="text-sm text-gray-400">แสดงโปรไฟล์ของคุณให้ผู้ใช้อื่นเห็น</p>
                </div>
                <Switch 
                  checked={publicProfile} 
                  onCheckedChange={setPublicProfile}
                />
              </div>
              <Separator className="bg-gray-700" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">การยืนยันตัวตนสองขั้นตอน</h3>
                  <p className="text-sm text-gray-400">เพิ่มความปลอดภัยให้กับบัญชีของคุณ</p>
                </div>
                <Switch 
                  checked={twoFactor} 
                  onCheckedChange={setTwoFactor}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-400/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Bell size={20} />
                การแจ้งเตือน
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">แจ้งเตือนทั่วไป</h3>
                  <p className="text-sm text-gray-400">รับการแจ้งเตือนเกี่ยวกับกิจกรรมในบัญชี</p>
                </div>
                <Switch 
                  checked={notifications} 
                  onCheckedChange={setNotifications}
                />
              </div>
              <Separator className="bg-gray-700" />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">อัปเดตทางอีเมล</h3>
                  <p className="text-sm text-gray-400">รับข่าวสารและโปรโมชั่นทางอีเมล</p>
                </div>
                <Switch 
                  checked={emailUpdates} 
                  onCheckedChange={setEmailUpdates}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-400/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Palette size={20} />
                การแสดงผล
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">โหมดมืด</h3>
                  <p className="text-sm text-gray-400">เปลี่ยนธีมของแอปพลิเคชัน</p>
                </div>
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={setDarkMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-400/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Shield size={20} />
                ความเป็นส่วนตัวและความปลอดภัย
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Lock className="mr-2" size={16} />
                เปลี่ยนรหัสผ่าน
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Globe className="mr-2" size={16} />
                ดาวน์โหลดข้อมูลของฉัน
              </Button>
            </CardContent>
          </Card>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center pt-6"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] transition-all duration-300 px-8"
            >
              บันทึกการตั้งค่า
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
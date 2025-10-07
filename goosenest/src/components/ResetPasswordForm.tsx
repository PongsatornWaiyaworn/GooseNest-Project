import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react'; // ไอคอนจาก lucide-react

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ResetPasswordFormProps {
  email?: string;
  onSuccess?: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ email: propEmail, onSuccess }) => {
  const location = useLocation();
  const email = propEmail || location.state?.email || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'รหัสผ่านไม่ตรงกัน',
        description: 'กรุณาตรวจสอบให้แน่ใจว่าทั้งสองรหัสผ่านตรงกัน'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      }

      toast({
        variant: 'default',
        title: 'เปลี่ยนรหัสผ่านสำเร็จ',
        description: 'คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว'
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'เกิดข้อผิดพลาด',
        description: (error as Error).message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.3)] max-w-md mx-auto">
      <CardHeader className="text-center px-4 py-8">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          ตั้งรหัสผ่านใหม่
        </CardTitle>
        <p className="text-gray-300 text-sm mt-1">สำหรับอีเมล: <span className="font-semibold">{email}</span></p>
      </CardHeader>

      <CardContent className="space-y-6 px-4 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Label htmlFor="newPassword" className="text-gray-300">รหัสผ่านใหม่</Label>
            <Input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-800/60 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute top-8 right-2 text-gray-400 hover:text-white"
              tabIndex={-1}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <Label htmlFor="confirmPassword" className="text-gray-300">ยืนยันรหัสผ่านใหม่</Label>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-gray-800/60 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute top-8 right-2 text-gray-400 hover:text-white"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 transition-shadow shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] disabled:opacity-60"
            >
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResetPasswordForm;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import OTPVerification from '../components/OtpVerification';
import ResetPasswordForm from '../components/ResetPasswordForm'; 
import { toast } from '@/components/ui/use-toast'; 

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const otpRes = await fetch(`${BASE_URL}/otp/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    });

    const otpData = await otpRes.json();

    if (!otpRes.ok) {
      setIsLoading(false);
      toast({
        title: "ส่ง OTP ไม่สำเร็จ",
        description: otpData.error || "ไม่สามารถส่งรหัส OTP ได้",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "ส่ง OTP สำเร็จ",
      description: "กรุณาตรวจสอบอีเมลของคุณ",
    });

    setStep('otp'); 
    setIsLoading(false);
  };

  const handleOTPCancel = () => {
    setStep('email');
  };

  const handleOTPVerified = () => {
    setStep('reset'); // ไปขั้นตอนตั้งรหัสผ่าน
  };

  const handleResetSuccess = () => {
    navigate('/login'); // ไปหน้า login หลังตั้งรหัสผ่านเสร็จ
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >

        {/* Step 1: Email Input */}
        {step === 'email' && (
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                ลืมรหัสผ่าน
              </CardTitle>
              <p className="text-gray-300 text-sm">กรอกอีเมลเพื่อรีเซ็ตรหัสผ่าน</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">อีเมล</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="กรอกอีเมลของคุณ"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                      required
                    />
                  </div>
                </div>

                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <p className="text-gray-300 text-sm">
                    💡 เราจะส่ง OTP สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณ
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'กำลังส่ง...' : 'ส่ง OTP รีเซ็ตรหัสผ่าน'}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-gray-300 text-sm">
                  จำรหัสผ่านได้แล้ว?{' '}
                  <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                    เข้าสู่ระบบ
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: OTP Verification */}
        {step === 'otp' && (
          <OTPVerification
            email={email}
            onVerified={handleOTPVerified}
            onCancel={handleOTPCancel}
          />
        )}

        {/* Step 3: Reset Password */}
        {step === 'reset' && (
          <ResetPasswordForm
            email={email}
            onSuccess={handleResetSuccess}
          />
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

import OTPVerification from '../components/OtpVerification'; 
import { useAuth } from '@/context/AuthContext';

declare global {
  interface Window {
    FB?: FacebookSDK;
    fbAsyncInit?: () => void;
    google?: {
      accounts: {
        id: {
          initialize: (params: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement | null,
            options: {
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              locale?: string;
            }
          ) => void;
          prompt?: () => void;
        };
      };
    };
  }
}

declare global {
  interface FacebookSDK {
    init: (params: {
      appId: string;
      cookie: boolean;
      xfbml: boolean;
      version: string;
    }) => void;
    login: (
      callback: (response: FacebookLoginResponse) => void,
      options?: { scope: string }
    ) => void;
    api: (
      path: string,
      params: { fields: string },
      callback: (userInfo: FacebookUserInfo) => void
    ) => void;
  }
}

interface GoogleCredentialResponse {
  credential: string;
  clientId?: string;
  select_by?: string;
}

interface FacebookAuthResponse {
  accessToken: string;
  userID: string;
}

interface FacebookLoginResponse {
  status: string;
  authResponse?: FacebookAuthResponse;
}

interface FacebookUserInfo {
  id: string;
  name: string;
  email?: string;
}

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showOTP, setShowOTP] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: "กรอกข้อมูลไม่ครบ",
        description: "กรุณากรอก ชื่อผู้ใช้, อีเมล และ รหัสผ่าน ให้ครบ",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "รหัสผ่านไม่ตรงกัน",
        description: "กรุณายืนยันรหัสผ่านให้ถูกต้อง",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
  
    try {
      const checkRes = await fetch(`${BASE_URL}/auth/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
        }),
      });
  
      const checkData = await checkRes.json();
      if (!checkRes.ok) {
        toast({
          title: "ไม่สามารถดำเนินการต่อได้",
          description: checkData.error || "เกิดข้อผิดพลาดในการตรวจสอบข้อมูล",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
  
      const otpRes = await fetch(`${BASE_URL}/otp/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
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
  
      setShowOTP(true); 
  
    } catch (error) {
      console.error("Error during check or sending OTP:", error);
      setIsLoading(false);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        variant: "destructive"
      });
    }
  };  

  const handleOTPCancle = () => {
    setIsLoading(false);
    setShowOTP(false);
    return;
  }

  const handleOTPVerified = () => {
    if (!formData.email || !formData.username || !formData.password) {
      toast({
        title: "ข้อมูลไม่ครบ",
        description: "กรุณากรอกข้อมูลให้ครบถ้วนก่อนยืนยัน",
        variant: "destructive",
      });
      return;
    }
  
    setShowOTP(false);
    setIsLoading(false);
    navigate("/createprofile", {
      state: {
        email: formData.email,
        username: formData.username,
        password: formData.password,
      },
    });
  };  

  const handleCredentialResponse = (response: GoogleCredentialResponse) => {
      console.log("Google JWT:", response);
      fetch(`${BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Google login success:", data);
    
          if (data.needCompleteProfile) {
            navigate("/createprofile", {
              state: {
                email: data.user.email,
                username: data.user.username,
                password: data.user.password, 
              },
            });
          } else {
            localStorage.setItem("token", data.token);
            login();
            navigate("/");
          }
        })
        .catch((err) => console.error("Google login error:", err));
      };
  
    useEffect(() => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: "68011734434-pulmpbjn1nl5cjprs24q7a7gkcv6qjbv.apps.googleusercontent.com",
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignInDiv"),
          {
            theme: "outline",
            size: "large",
            text: "signup_with",
            shape: "rectangular",
          }
        );
        window.google.accounts.id.prompt();
      }
    }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center px-4 py-8 relative">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {!showOTP && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Back to Home Button */}
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                สมัครสมาชิก
              </CardTitle>
              <p className="text-gray-300 text-sm">เข้าร่วมกับ GooseNest วันนี้</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">ชื่อผู้ใช้</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="username"
                      type="text"
                      placeholder="กรอกชื่อผู้ใช้"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">อีเมล</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="กรอกอีเมลของคุณ"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">รหัสผ่าน</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="กรอกรหัสผ่าน"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">ยืนยันรหัสผ่าน</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="ยืนยันรหัสผ่าน"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="space-y-3">
                <label className="flex items-start space-x-3 text-sm text-gray-300">
                    <input
                        type="checkbox"
                        className="w-4 h-4 mt-0.5 text-cyan-500 bg-gray-800 border-gray-600 rounded focus:ring-cyan-500"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <span>
                        ฉันยอมรับ{' '}
                        <Link to="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                        เงื่อนไขการใช้งาน
                        </Link>{' '}
                        และ{' '}
                        <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                        นโยบายความเป็นส่วนตัว
                        </Link>
                    </span>
                    </label>
                </div>

                <Button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!termsAccepted || isLoading}
                  className={`w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] transition-all duration-300
                  ${!termsAccepted || isLoading ? 'opacity-50 cursor-not-allowed hover:from-cyan-500 hover:to-blue-600 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]' : ''}
                  `}
                >
                  {isLoading ? "กำลังส่ง OTP..." : "สมัครสมาชิก"}
                </Button>
                <div id="googleSignInDiv" style={{ marginTop: "16px" }}></div>

                {/* <Button
                  onClick={handleFacebookLogin}
                  className="w-full flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
                >
                  <span className="flex items-center w-10 h-full">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.31h3.587l-.467 3.622h-3.12V24h6.116C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z" />
                    </svg>
                  </span>
                  <span className="flex-grow text-center font-thin">ลงชื่อสมัครเข้าใช้ด้วย Facebook</span>
                </Button> */}

              </form>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-400 bg-gray-800">หรือ</span>
                </div>
              </div>

              <div className="text-center mt-6">
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
      )}

      {/* OTP Modal */}
      {showOTP && (
        <OTPVerification
          email={formData.email}
          onVerified={handleOTPVerified}
          onCancel={handleOTPCancle}
        />
      )}
    </div>
  );
};

export default Register;

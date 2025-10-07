import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast'; 

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

type OTPVerificationProps = {
  email: string;
  onVerified: () => void;
  onCancel: () => void;
};

const OTPVerification: React.FC<OTPVerificationProps> = ({ email, onVerified, onCancel }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const countdown = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(countdown);
  }, [timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/otp/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email, 
          code: otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "OTP ไม่ถูกต้อง",
          description: data.error || "กรุณาตรวจสอบรหัส OTP อีกครั้ง",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "ยืนยัน OTP สำเร็จ",
        description: "ดำเนินการต่อ",
      });

      onVerified();
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถตรวจสอบ OTP ได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/otp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'ไม่สามารถส่ง OTP ใหม่ได้');
      }
      setTimer(300);
      setCanResend(false);
      toast({
        title: "ส่ง OTP ใหม่แล้ว",
        description: `ส่งรหัส OTP ใหม่ไปยัง ${email}`,
      });
    } catch (err) {
      setError(err.message || 'ไม่สามารถส่ง OTP ใหม่ได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.3)] max-w-md mx-auto">
      <CardHeader className="relative px-4 py-8 flex justify-center items-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          ยืนยันรหัส OTP
        </CardTitle>
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-400 hover:text-cyan-400 transition-colors"
          aria-label="Close"
          disabled={loading}
        >
          <X size={24} />
        </button>
      </CardHeader>
  
      <CardContent className="space-y-6 px-4 pb-6">
        <p className="text-gray-300 text-sm">
          กรุณากรอกรหัส OTP ที่ส่งไปยังอีเมล <span className="font-semibold">{email}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="otp" className="text-gray-300">รหัส OTP</Label>
            <Input
              id="otp"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="กรอกรหัส 6 หลัก"
              className="bg-gray-800/60 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
              required
              disabled={loading}
            />
          </div>
  
          {error && <p className="text-red-500 text-sm">{error}</p>}
  
          <div className="flex justify-between items-center text-gray-400 text-sm">
            <div>เวลาที่เหลือ: {formatTime(timer)}</div>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || loading}
              className={`text-cyan-400 hover:text-cyan-300 font-semibold ${canResend && !loading ? '' : 'opacity-50 cursor-not-allowed'}`}
            >
              ส่งรหัสใหม่
            </button>
          </div>
  
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 transition-shadow shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7)]"
          >
            {loading ? 'กำลังตรวจสอบ...' : 'ยืนยัน'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
  
};

export default OTPVerification;

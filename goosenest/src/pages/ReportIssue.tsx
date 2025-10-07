import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Bug, MessageSquare, Shield, FileText, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ReportIssue = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    issueType: '',
    subject: '',
    description: '',
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const issueTypes = [
    { value: 'ข้อผิดพลาดของระบบ', label: 'ข้อผิดพลาดของระบบ', icon: Bug },
    { value: 'การทุจริต / การโกง', label: 'การทุจริต / การโกง', icon: Shield },
    { value: 'ปัญหาการชำระเงิน', label: 'ปัญหาการชำระเงิน', icon: FileText },
    { value: 'ปัญหาบัญชีผู้ใช้', label: 'ปัญหาบัญชีผู้ใช้', icon: MessageSquare },
    { value: 'อื่นๆ', label: 'อื่นๆ', icon: AlertTriangle }
  ];

  const validateForm = () => {
    return formData.issueType && formData.subject && formData.description;
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
  
      const res = await fetch(`${BASE_URL}/report/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
  
      if (!res.ok) {
        throw new Error("Failed to send report");
      }
  
      toast({
        title: "ส่งรายงานสำเร็จ",
        description: "เราได้รับรายงานของคุณแล้ว และจะติดต่อกลับภายใน 24 ชั่วโมง",
        variant: "default",
      });
  
      setFormData({
        issueType: "",
        subject: "",
        description: "",
      });
      setShowConfirm(false);
    } catch {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งรายงานได้ กรุณาลองใหม่",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };  

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
        variant: "destructive"
      });
      return;
    }
    setShowConfirm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6 sm:p-12 justify-center">
        <div className="max-w-7xl mx-auto flex justify-center items-center">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">
            แจ้งปัญหา
          </h1>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Issue Types */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-red-400/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle size={20} />
                ประเภทปัญหา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {issueTypes.map((type, index) => {
                  const Icon = type.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`
                        p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer
                        ${formData.issueType === type.value 
                          ? 'border-red-400 bg-red-400/10' 
                          : 'border-gray-600 hover:border-red-400/50 bg-gray-800/30'
                        }
                      `}
                      onClick={() => handleInputChange('issueType', type.value)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon 
                          size={20} 
                          className={formData.issueType === type.value ? 'text-red-400' : 'text-gray-400'} 
                        />
                        <span className={`font-medium ${formData.issueType === type.value ? 'text-red-400' : 'text-gray-300'}`}>
                          {type.label}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Report Form */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-red-400/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <FileText size={20} />
                รายละเอียดปัญหา
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-6">

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-gray-300">หัวข้อปัญหา *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-red-400"
                    placeholder="สรุปปัญหาที่พบ"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-300">รายละเอียดปัญหา *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-red-400 min-h-[120px]"
                    placeholder="อธิบายปัญหาที่พบเจอ รวมถึงขั้นตอนที่ทำให้เกิดปัญหา (ถ้ามี)"
                    required
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex justify-center pt-4"
                >
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.7)] transition-all duration-300 px-8"
                  >
                    <Send className="mr-2" size={16} />
                    ส่งรายงาน
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>

          {/* Urgent Help */}
          <Card className="bg-gradient-to-br from-blue-800/20 to-cyan-900/20 border border-blue-400/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <h3 className="font-bold text-blue-400 mb-2">ต้องการความช่วยเหลือเร่งด่วน?</h3>
              <p className="text-blue-200 mb-4">
                หากเป็นเรื่องเร่งด่วนหรือเกี่ยวข้องกับการทุจริต กรุณาติดต่อเราโดยตรง
              </p>
              <Button
                variant="outline"
                onClick={() => navigate('/contact')}
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
              >
                <MessageSquare className="mr-2" size={16} />
                ติดต่อ
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="ยืนยันการแจ้งปัญหา"
        confirmText={loading ? "กำลังส่ง..." : "ยืนยัน"}
        cancelText="ยกเลิก"
        confirmColor="green"
        onConfirm={handleConfirmSubmit}
        onCancel={() => !loading && setShowConfirm(false)}
      />
    </div>
  );
};

export default ReportIssue;
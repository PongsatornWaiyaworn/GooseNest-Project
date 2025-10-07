import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Bug, FileText, Shield } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const issueTypes = [
  { value: "ข้อผิดพลาดของระบบ", label: "ข้อผิดพลาดของระบบ", icon: Bug },
  { value: "การทุจริต / การโกง", label: "การทุจริต / การโกง", icon: Shield },
  { value: "เนื้อหาไม่เหมาะสม", label: "เนื้อหาไม่เหมาะสม", icon: FileText },
  { value: "การก่อกวน / ป่วนปั่น", label: "การก่อกวน / ป่วนปั่น", icon: AlertTriangle },
  { value: "อื่น ๆ", label: "อื่น ๆ", icon: AlertTriangle },
];

interface ReportPostPopupProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  reportedEmail: string;
}

export default function ReportPostPopup({
  isOpen,
  onClose,
  listingId,
  reportedEmail,
}: ReportPostPopupProps) {
  const [formData, setFormData] = useState({
    issueType: "",
    subject: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.issueType || !formData.subject || !formData.description) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกข้อมูลให้ครบทุกช่อง",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/report/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          listingId,
          reportedEmail,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "เกิดข้อผิดพลาดในการส่งรายงาน");
      }

      toast({
        title: "ส่งรายงานสำเร็จ",
        description: "ขอบคุณสำหรับการแจ้งปัญหา",
      });

      setFormData({ issueType: "", subject: "", description: "" });
      onClose();
    } catch (err) {
      toast({
        title: "ไม่สามารถส่งรายงานได้",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        if (!loading) onClose();
      }}
      className="fixed z-50 inset-0 flex items-center justify-center bg-black/50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md p-6 space-y-4 text-white"
      >
        <Dialog.Title className="text-lg font-bold text-red-400 flex items-center gap-2">
          <AlertTriangle size={20} />
          รายงานโพสต์
        </Dialog.Title>

        <div className="grid grid-cols-2 gap-3">
          {issueTypes.map((type) => {
            const Icon = type.icon;
            const selected = formData.issueType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
                  selected
                    ? "border-red-400 bg-red-400/10 text-red-400"
                    : "border-gray-600 text-gray-300 hover:border-red-300/50"
                }`}
                onClick={() => handleChange("issueType", type.value)}
                disabled={loading}
              >
                <Icon size={16} />
                <span className="text-sm">{type.label}</span>
              </button>
            );
          })}
        </div>

        <div>
          <Label htmlFor="subject" className="text-gray-300">
            หัวข้อ
          </Label>
          <Input
            id="subject"
            placeholder="หัวข้อปัญหา"
            value={formData.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            className="bg-gray-800 border-gray-600 text-white mt-1"
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-gray-300">
            รายละเอียด
          </Label>
          <Textarea
            id="description"
            placeholder="อธิบายรายละเอียดเพิ่มเติม"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="bg-gray-800 border-gray-600 text-white mt-1 min-h-[100px]"
            disabled={loading}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-red-500 to-orange-600"
          >
            {loading ? "กำลังส่ง..." : "ส่งรายงาน"}
          </Button>
        </div>
      </motion.div>
    </Dialog>
  );
}

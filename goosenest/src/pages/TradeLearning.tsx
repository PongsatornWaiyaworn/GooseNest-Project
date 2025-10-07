import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Shield, Zap } from 'lucide-react';
import { useEffect } from 'react';

const TradeLearning = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const tradeTypes = [
    {
      title: "1. การซื้อขายแบบติดต่อผู้ขาย",
      description: [
        "ผู้ซื้อจะต้องติดต่อกับผู้ขายผ่านระบบแชทของ GooseNes เพื่อพูดคุยและตกลงรายละเอียดก่อนการซื้อขายจริง",
        "ในขั้นตอนนี้ ผู้ซื้อสามารถสอบถามข้อมูลเพิ่มเติม เช่น สภาพไอดีเกม หรือเงื่อนไขการโอน เพื่อความมั่นใจก่อนตัดสินใจซื้อ",
        "เพื่อเพิ่มความปลอดภัย เราแนะนำให้ใช้ระบบกลางของ GooseNest ซึ่งจะเก็บเงินไว้ชั่วคราวจนกว่าทั้งสองฝ่ายจะยืนยันการทำธุรกรรมสำเร็จ หรือการซื้อขายพอใจทั้ง2ฝ่าย",
        "เมื่อมีผู้ซื้อส่งข้อความติดต่อเข้ามา ระบบจะส่ง Email แจ้งเตือนไปยังผู้ขาย เพื่อให้ตอบกลับรวดเร็วและไม่พลาดโอกาสในการขาย",
        "✅ ข้อดี: เหมาะสำหรับผู้ที่ต้องการความยืดหยุ่นสูง สามารถเจรจาต่อรองและตรวจสอบรายละเอียดได้อย่างละเอียด"
      ],
      icon: MessageCircle,
      color: "from-yellow-500 to-orange-500"
    },       
    {
      title: "2. ระบบซื้อขายอัตโนมัติ",
      description: [
        "เมื่อคุณเลือกใช้ระบบซื้อขายอัตโนมัติ ระบบจะดำเนินการซื้อขายให้อัตโนมัติหลังจากการชำระเงินสำเร็จ",
        "คุณจะต้องกรอก Username และ Password ของไอดีเกมที่ต้องการขายเข้าระบบ",
        "หากเป็นเกม FIFA Online 4 ระบบจะให้กรอกรหัส 2 ชั้นเพิ่มเติมเพื่อความสมบูรณ์ของข้อมูล",
        "รหัสทั้งหมดจะถูกเข้ารหัสแบบพิเศษ ทำให้แม้แต่แอดมินหรือทีมพัฒนาเองก็ไม่สามารถเข้าถึงรหัสเหล่านี้ได้ และจะไม่มีใครเข้าถึงได้แน่นอนหากยังไม่ได้ซื้อขาย",
        "ผู้ซื้อจะสามารถเห็นรหัสได้ เฉพาะหลังจากที่มีการชำระเงินเรียบร้อยแล้วเท่านั้น",
        "✅ ข้อดี: ผู้ขายไม่ต้องคอยตอบแชทหรือประสานงานกับลูกค้า เหมาะสำหรับคนที่มีเวลาจำกัด",
      ],
      icon: Zap,
      color: "from-green-500 to-emerald-500"
    }
  ];  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="py-4 text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4">
            เรียนรู้เพิ่มเติมเกี่ยวกับรูปแบบการซื้อขาย
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
            ก่อนที่คุณจะเริ่มซื้อขาย เรามี 2 รูปแบบหลักที่คุณสามารถเลือกใช้ได้ตามความสะดวกและความต้องการของคุณ
          </p>
        </motion.div>

        {/* Trade Types Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {tradeTypes.map((type, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/50 border border-gray-700/40 hover:border-red-400/30 backdrop-blur-md shadow-xl transition-all duration-300">
                <CardContent className="p-6 space-y-4">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center mb-2`}>
                    <type.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-red-400">{type.title}</h3>
                  <ul className="list-disc list-inside text-gray-300 text-sm space-y-2 pl-1">
                  {type.description.map((line, i) => (
                    <li key={i} className="leading-relaxed">
                      {typeof line === 'string' ? line : line}
                    </li>
                  ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Guarantee Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-2 border-red-500/30 backdrop-blur-sm shadow-2xl overflow-hidden">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto">
                <Shield size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">เราคือระบบที่เชื่อถือได้</h3>
              <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto pb-6">
                ไม่ว่าคุณจะเลือกซื้อขายแบบอัตโนมัติหรือแบบติดต่อผู้ขาย เราให้ความสำคัญกับความปลอดภัยสูงสุด
                รหัสผ่านและข้อมูลส่วนตัวของคุณจะถูกเก็บอย่างปลอดภัยและไม่สามารถเข้าถึงได้โดยบุคคลที่ไม่เกี่ยวข้อง
              </p>
              <span key="link">
                เพื่อความเข้าใจเพิ่มเติมเกี่ยวกับกฎการซื้อขาย กรุณาอ่านที่{" "}
                <a
                  href="http://goosenest.com/instructions-and-rules"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  goosenest.com/instructions-and-rules
                </a>
              </span>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default TradeLearning;

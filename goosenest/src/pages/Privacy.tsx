import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';

const Privacy = () => {
    const privacySections = [
        {
          title: "การเก็บรวบรวมข้อมูล",
          content: [
            "เราเก็บรวบรวมข้อมูลส่วนบุคคลที่คุณให้ไว้เมื่อสมัครสมาชิก เช่น ชื่อ อีเมล เบอร์โทรศัพท์",
            "ข้อมูลการใช้งานเว็บไซต์ของคุณผ่านคุกกี้และเทคโนโลยีคล้ายกัน",
            "ข้อมูลธุรกรรมการซื้อขายในแพลตฟอร์ม",
            "ข้อมูลบัญชีธนาคารสำหรับการโอนเงิน"
          ]
        },
        {
          title: "การใช้ข้อมูล",
          content: [
            "เพื่อให้บริการแพลตฟอร์มซื้อขายและจัดการบัญชีผู้ใช้",
            "เพื่อการติดต่อสื่อสารและแจ้งข่าวสาร",
            "เพื่อปรับปรุงและพัฒนาบริการให้ดียิ่งขึ้น",
            "เพื่อป้องกันการใช้งานที่ผิดกฎหมายและรักษาความปลอดภัย"
          ]
        },
        {
          title: "การแบ่งปันข้อมูล",
          content: [
            "เราจะไม่แบ่งปันข้อมูลส่วนบุคคลของคุณกับบุคคลภายนอก",
            "ยกเว้น กรณีที่กฎหมายกำหนดหรือเพื่อป้องกันอาชญากรรม",
            "การแบ่งปันกับผู้ให้บริการที่ช่วยดำเนินงานภายใต้ข้อตกลงรักษาความลับ",
            "ในกรณีที่มีการขายหรือโอนกิจการ"
          ]
        },
        {
          title: "คุกกี้และเทคโนโลยีติดตาม",
          content: [
            "เราใช้คุกกี้เพื่อจำการตั้งค่าของคุณและปรับปรุงประสบการณ์การใช้งาน",
            "คุกกี้วิเคราะห์เพื่อเข้าใจพฤติกรรมการใช้งานและปรับปรุงเว็บไซต์",
            "คุณสามารถปฏิเสธคุกกี้ได้ผ่านการตั้งค่าเบราว์เซอร์",
            "การปฏิเสธคุกกี้อาจส่งผลต่อการใช้งานบางฟีเจอร์"
          ]
        },
        {
          title: "ความปลอดภัยของข้อมูล",
          content: [
            "เราใช้เทคโนโลยีการเข้ารหัสและมาตรการรักษาความปลอดภัยระดับสูง",
            "การเข้าถึงข้อมูลถูกจำกัดเฉพาะบุคลากรที่มีความจำเป็น",
            "มีการสำรองข้อมูลและแผนฟื้นฟูหลายระดับ",
            "ตรวจสอบและปรับปรุงระบบความปลอดภัยอย่างสม่ำเสมอ"
          ]
        },
        {
          title: "สิทธิของผู้ใช้งาน",
          content: [
            "สิทธิในการเข้าถึงและขอสำเนาข้อมูลส่วนบุคคล",
            "สิทธิในการแก้ไขข้อมูลที่ไม่ถูกต้องหรือล้าสมัย",
            "สิทธิในการลบข้อมูลหรือยกเลิกบัญชี",
            "สิทธิในการถอนความยินยอมในการประมวลผลข้อมูล"
          ]
        },
        {
          title: "ระยะเวลาการเก็บข้อมูล",
          content: [
            "เราจะเก็บข้อมูลของคุณเท่าที่จำเป็นสำหรับวัตถุประสงค์ที่ระบุไว้ในนโยบายนี้",
            "โดยทั่วไป ข้อมูลจะถูกเก็บไม่เกิน 5 ปีหลังจากคุณยกเลิกบัญชีหรือหยุดใช้บริการ",
            "เราจะลบหรือทำให้ข้อมูลไม่สามารถระบุตัวตนได้หลังหมดความจำเป็น"
          ]
        },
        {
          title: "การโอนข้อมูลข้ามประเทศ",
          content: [
            "ข้อมูลของคุณอาจถูกโอนไปยังเซิร์ฟเวอร์ที่ตั้งอยู่นอกประเทศไทย",
            "เช่น เซิร์ฟเวอร์ของผู้ให้บริการคลาวด์หรือระบบวิเคราะห์ข้อมูล",
            "เราใช้มาตรการทางกฎหมายและทางเทคนิคเพื่อให้การโอนข้อมูลปลอดภัยตามมาตรฐานสากล"
          ]
        },
        {
          title: "ผู้ควบคุมข้อมูลและช่องทางติดต่อ",
          content: [
            "ผู้ควบคุมข้อมูล: บริษัท [ชื่อบริษัทหรือแพลตฟอร์มของคุณ]",
            "ที่อยู่: [ที่อยู่บริษัท]",
            "อีเมลสำหรับติดต่อเรื่องข้อมูลส่วนบุคคล: [email@example.com]",
            "หากคุณมีข้อสงสัยหรือร้องเรียนเกี่ยวกับข้อมูลส่วนบุคคล สามารถติดต่อเข้ามาได้ทางช่องทางดังกล่าว"
          ]
        }
    ];      

  const cookieTypes = [
    {
      name: "คุกกี้จำเป็น",
      description: "จำเป็นสำหรับการทำงานพื้นฐานของเว็บไซต์",
      color: "from-red-500 to-pink-500",
      required: true
    },
    {
      name: "คุกกี้การวิเคราะห์",
      description: "ช่วยเราเข้าใจการใช้งานและปรับปรุงเว็บไซต์",
      color: "from-blue-500 to-cyan-500",
      required: false
    },
    {
      name: "คุกกี้การตลาด",
      description: "สำหรับแสดงโฆษณาที่เกี่ยวข้องกับคุณ",
      color: "from-purple-500 to-pink-500",
      required: false
    },
    {
      name: "คุกกี้การทำงาน",
      description: "จดจำการตั้งค่าและข้อมูลส่วนตัวของคุณ",
      color: "from-green-500 to-emerald-500",
      required: false
    }
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-pink-500/8 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-emerald-500/8 rounded-full blur-2xl animate-pulse delay-300"></div>
      </div>

      {/* Animated Grid Background */}
      <div className="fixed inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl py-4 sm:text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              นโยบายความเป็นส่วนตัว
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-6"
            ></motion.div>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              เราให้ความสำคัญกับความเป็นส่วนตัวและความปลอดภัยของข้อมูลของคุณ<br />
              <span className="text-cyan-400">โปรดอ่านนโยบายนี้เพื่อเข้าใจวิธีการใช้ข้อมูลของคุณ</span>
            </p>
            <p className="text-sm text-gray-400 mt-4">
              อัปเดตล่าสุด: {new Date().toLocaleDateString('th-TH', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </motion.div>

          {/* Cookie Information Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-cyan-400 mb-6 text-center">
                  ข้อมูลเกี่ยวกับคุกกี้
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cookieTypes.map((cookie, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-gray-700/30 to-gray-800/30 border border-gray-600/30"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${cookie.color} flex items-center justify-center mb-3 mx-auto`}>
                        <MessageCircle size={20} className="text-white" />
                      </div>
                      <h4 className="font-semibold text-white mb-2 text-center">{cookie.name}</h4>
                      <p className="text-gray-300 text-sm text-center mb-3">{cookie.description}</p>
                      <div className="text-center">
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          cookie.required 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                          {cookie.required ? 'จำเป็น' : 'เลือกได้'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy Policy Sections */}
          <div className="space-y-8">
            {privacySections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 + index * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 hover:border-cyan-400/30 transition-all duration-500 backdrop-blur-sm shadow-lg">
                  <CardContent className="p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    
                    <h3 className="text-2xl font-bold text-cyan-400 mb-6">
                      {index + 1}. {section.title}
                    </h3>
                    
                    <div className="space-y-4">
                      {section.content.map((item, itemIndex) => (
                        <motion.div
                          key={itemIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.2 + itemIndex * 0.1 }}
                          className="flex items-start space-x-3"
                        >
                          <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 leading-relaxed">{item}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16"
          >
            <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm shadow-xl overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>
                
                <h3 className="text-2xl font-bold text-white mb-6 text-center">ติดต่อเราเกี่ยวกับความเป็นส่วนตัว</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-gray-700/30 to-gray-800/30 border border-gray-600/30"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail size={20} className="text-white" />
                    </div>
                    <h4 className="font-semibold text-cyan-400 mb-2">อีเมล</h4>
                    <p className="text-gray-300 text-sm">privacy@goosenest.com</p>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-gray-700/30 to-gray-800/30 border border-gray-600/30"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone size={20} className="text-white" />
                    </div>
                    <h4 className="font-semibold text-purple-400 mb-2">โทรศัพท์</h4>
                    <p className="text-gray-300 text-sm">+66 89-123-4567</p>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-gray-700/30 to-gray-800/30 border border-gray-600/30"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle size={20} className="text-white" />
                    </div>
                    <h4 className="font-semibold text-emerald-400 mb-2">การตอบกลับ</h4>
                    <p className="text-gray-300 text-sm">ภายใน 24 ชั่วโมง</p>
                  </motion.div>
                </div>
                
                <div className="mt-8 p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
                  <p className="text-center text-yellow-400 font-medium mb-2">หมายเหตุสำคัญ</p>
                  <p className="text-center text-gray-300 text-sm">
                    นโยบายนี้อาจมีการปรับปรุงเป็นครั้งคราว เราจะแจ้งให้ทราบผ่านทางเว็บไซต์และอีเมล
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;

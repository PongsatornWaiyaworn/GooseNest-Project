import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookOpen, 
  ShoppingCart, 
  Tag, 
  Shield, 
  CreditCard, 
  Users, 
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useEffect } from 'react';

const HowToUse = () => {

  const buyingSteps = [
    {
      step: 1,
      title: "ค้นหาเกมที่ต้องการ",
      description: "เลือกจากเกมยอดนิยมหรือใช้ฟีเจอร์ค้นหา",
      icon: BookOpen
    },
    {
      step: 2,
      title: "เลือกผู้ขายที่เชื่อถือได้",
      description: "ดูคะแนนและรีวิวจากผู้ซื้อคนอื่น",
      icon: Users
    },
    {
      step: 3,
      title: "ชำระเงินอย่างปลอดภัย",
      description: "ใช้ระบบชำระเงินที่มีการรับประกัน",
      icon: CreditCard
    },
    {
      step: 4,
      title: "รับรหัสเกมทันที",
      description: "ได้รับรหัสผ่านระบบแชทอย่างปลอดภัย",
      icon: CheckCircle
    }
  ];

  const sellingSteps = [
    {
      step: 1,
      title: "สร้างร้านค้าของคุณ",
      description: "ตั้งค่าโปรไฟล์และข้อมูลร้านค้า",
      icon: Tag
    },
    {
      step: 2,
      title: "เพิ่มรหัสเกม",
      description: "อัปโหลดรหัสเกมพร้อมรายละเอียด",
      icon: ShoppingCart
    },
    {
      step: 3,
      title: "รอผู้ซื้อติดต่อ",
      description: "รับการแจ้งเตือนเมื่อมีคนสนใจ",
      icon: Users
    },
    {
      step: 4,
      title: "ส่งมอบและรับเงิน",
      description: "ส่งรหัสและรับเงินอย่างปลอดภัย",
      icon: CheckCircle
    }
  ];

  const buyRules = [
    {
      title: "การซื้อที่ยุติธรรม",
      description: `- ตรวจสอบข้อมูลผู้ขาย คะแนน และรีวิวก่อนทำการซื้อ  
    - หลีกเลี่ยงการซื้อจากผู้ขายที่ไม่มีประวัติหรือรีวิวที่ไม่น่าเชื่อถือ  
    - แนะนำให้ซื้อผ่านระบบกลาง GooseNest เพื่อความปลอดภัย  
    - หากไม่ได้ใช้ระบบกลาง GooseNest กฎทั้งหมดจะถือเป็นโมฆะ และทางแพลตฟอร์มจะไม่รับผิดชอบใด ๆ`,
      type: "warning"
    },
    {
      title: "การคืนเงินสำหรับผู้ซื้อ",
      description: `- แจ้งปัญหาผ่านแพลตฟอร์มภายใน 7 วันหลังได้รับสินค้า  
  - รวบรวมหลักฐาน เช่น แคปหน้าจอการสื่อสาร หรือปัญหาการใช้งาน  
  - ระบบจะตรวจสอบภายใน 3-5 วันทำการ  
  - คืนเงินจะดำเนินการอัตโนมัติหากปัญหายืนยันได้  
  - ผู้ซื้อไม่ควรยกเลิกหรือโอนเงินนอกระบบเพื่อรับประกันความปลอดภัย`,
      type: "success"
    },
    {
      title: "ความรับผิดชอบของผู้ซื้อ",
      description: `- ผู้ซื้อควรเก็บรักษาข้อมูลและรหัสเกมไว้เป็นความลับ  
  - หลีกเลี่ยงการเปิดเผยข้อมูลส่วนตัวหรือรหัสกับบุคคลภายนอก  
  - รับผิดชอบต่อการใช้งานรหัสเกมหลังจากรับมอบ  
  - หากพบปัญหาหลังจากหมดระยะเวลารับประกัน ขอให้ติดต่อผู้ขายโดยตรง`,
      type: "info"
    },
    {
      title: "การประเมินผู้ขาย",
      description: `- ให้คะแนนและรีวิวผู้ขายหลังการซื้อ  
  - รีวิวควรตรงไปตรงมาและสุภาพ  
  - ช่วยให้ผู้ซื้อรายอื่นตัดสินใจได้ง่ายขึ้น  
  - หลีกเลี่ยงการรีวิวเท็จหรือใส่ร้ายผู้ขาย`,
      type: "info"
    },
    {
      title: "คำแนะนำในการซื้อ",
      description: `- แนะนำให้ซื้อผ่านระบบกลาง GooseNest เพื่อความปลอดภัยและรับประกันการซื้อขาย  
  - ระมัดระวังการโอนเงินหรือทำธุรกรรมนอกระบบ เพราะทางแพลตฟอร์มจะไม่รับผิดชอบ  
  - ตรวจสอบประวัติและรีวิวของผู้ขายอย่างละเอียดก่อนตัดสินใจซื้อ  
  - หากพบพฤติกรรมผิดปกติหรือสงสัย ให้แจ้งทีมงานทันทีเพื่อความปลอดภัย`,
      type: "warning"
    }
  ];  
  
  const sellRules = [
    {
      title: "การขายที่ซื่อสัตย์",
      description: `- ห้ามขายรหัสปลอมหรือรหัสที่ใช้แล้ว  
  - ต้องลงรายละเอียดสินค้าครบถ้วน เช่น ประเภทเกม เวอร์ชัน หรือเงื่อนไขอื่น ๆ  
  - ไม่อนุญาตให้เปลี่ยนรายละเอียดหลังจากลงขายโดยไม่ได้แจ้งผู้ซื้อ  
  - หากตรวจพบการฝ่าฝืนจะถูกแบนถาวร`,
      type: "warning"
    },
    {
      title: "การจัดส่งที่รวดเร็วและชัดเจน",
      description: `- ส่งรหัสเกมทันทีหลังได้รับการชำระเงิน  
  - แจ้งสถานะการส่งมอบผ่านระบบอย่างชัดเจน  
  - ตอบคำถามและช่วยแก้ปัญหาอย่างรวดเร็ว  
  - หลีกเลี่ยงการสื่อสารนอกระบบเพื่อป้องกันการหลอกลวง`,
      type: "info"
    },
    {
      title: "ความรับผิดชอบของผู้ขาย",
      description: `- เก็บหลักฐานการขายและการส่งมอบอย่างดี  
  - ดูแลความปลอดภัยของบัญชีและข้อมูลส่วนตัว  
  - ไม่ขายรหัสซ้ำซ้อนหรือรหัสที่ไม่ได้รับอนุญาต  
  - ร่วมมือกับทีมงานหากมีการร้องเรียนหรือข้อพิพาท`,
      type: "info"
    },
    {
      title: "นโยบายการยกเลิกและคืนสินค้า",
      description: `- กรณีผู้ซื้อขอยกเลิก ต้องแจ้งก่อนการส่งมอบรหัส  
  - ไม่อนุญาตให้ยกเลิกหลังจากส่งมอบรหัสแล้ว  
  - กรณีมีข้อผิดพลาดจากผู้ขาย ให้ความร่วมมือในการแก้ไขหรือคืนเงินตามนโยบาย`,
      type: "warning"
    },
    {
      title: "การรับเงินและการแก้ไขข้อพิพาท",
      description: `- ผู้ขายจะได้รับเงินหลังจากผู้ซื้อยืนยันว่าสินค้าได้รับและถูกต้อง  
  - หากผู้ซื้อขอคืนเงิน ระบบจะส่งคำขอยินยอมคืนเงินไปยังผู้ขายทันที  
  - หากผู้ขายยินยอม ระบบคืนเงินจะดำเนินการคืนเงินโดยอัตโนมัติให้ผู้ซื้อ
  - หากผู้ขายไม่ยินยอม แอดมินจะเข้าตรวจสอบข้อมูลจากทั้งสองฝ่ายอย่างละเอียดเพื่อคุ้มครองสิทธิของผู้ขายเอง กรณีที่ผู้ซื้อมีการโกง  
  - หากผลการตรวจสอบชี้ชัดว่าผู้ขายถูกโกง ผู้ขายจะได้รับเงินส่วนนี้ทันที 
  - การพิจารณาข้อพิพาทจะขึ้นอยู่กับดุลยพินิจของแอดมินเพื่อความยุติธรรม`,
      type: "warning"
    },
    {
      title: "การใช้ระบบกลาง GooseNest",
      description: `- การซื้อขายทั้งหมดควรดำเนินผ่านระบบกลางของ GooseNest เพื่อความปลอดภัยและความน่าเชื่อถือ  
  - ระบบจะโอนเงินผ่านบัญชีกลางของ GooseNest หลังผู้ซื้อยืนยันการรับสินค้าแล้ว  
  - หากมีการซื้อขายนอกระบบ GooseNest ทางแพลตฟอร์มจะไม่รับผิดชอบในทุกกรณี  
  - กรุณาอย่าทำธุรกรรมใด ๆ นอกระบบเพื่อป้องกันการถูกโกงและปัญหาต่าง ๆ`,
      type: "warning"
    }
  ];   
  
  const communityRules = [
    {
      title: "การรายงานปัญหาและการป้องกันการทุจริต",
      description: `- แจ้งปัญหาทุจริตหรือพฤติกรรมผิดกฎผ่านช่องทางที่กำหนด  
  - ให้ข้อมูลหรือหลักฐานที่ชัดเจนเพื่อช่วยทีมงานตรวจสอบ  
  - หลีกเลี่ยงการแก้ไขปัญหาด้วยตนเองที่อาจก่อให้เกิดความเสียหาย  
  - ร่วมมือกับทีมงานเพื่อรักษาความปลอดภัยของชุมชน`,
      type: "warning"
    },
    {
      title: "ความปลอดภัยของข้อมูลส่วนบุคคล",
      description: `- ไม่เผยแพร่ข้อมูลส่วนตัวของตนเองหรือผู้อื่นในที่สาธารณะ  
  - ระมัดระวังการแชร์ข้อมูลกับบุคคลที่ไม่น่าเชื่อถือ  
  - ใช้ระบบภายในแพลตฟอร์มในการติดต่อสื่อสาร  
  - หากพบการละเมิดข้อมูล โปรดแจ้งทีมงานทันที`,
      type: "warning"
    },
    {
      title: "การปฏิบัติตามกฎอย่างเคร่งครัด",
      description: `- ปฏิบัติตามกฎของแพลตฟอร์มและเงื่อนไขที่ตกลงไว้  
    - ห้ามแอบอ้าง หลีกเลี่ยง หรือโกงระบบในทุกรูปแบบ  
    - หากมีข้อสงสัยเกี่ยวกับกฎ ควรสอบถามทีมงานก่อนดำเนินการ  
    - การละเมิดกฎจะมีผลต่อความน่าเชื่อถือและอาจถูกระงับบัญชี`,
      type: "warning"
    },
    {
      title: "การสื่อสารอย่างเหมาะสม",
      description: `- พูดคุยด้วยความสุภาพ ไม่ใช้ถ้อยคำหยาบคายหรือกดดันคู่ค้า  
    - เคารพความคิดเห็นของอีกฝ่าย แม้จะมีความเห็นไม่ตรงกัน  
    - หลีกเลี่ยงการโต้เถียงหรือแสดงอารมณ์ในเชิงลบ  
    - หากเกิดปัญหา ให้ใช้เหตุผลและความสุภาพในการแก้ไข`,
      type: "info"
    },
  ];    

  useEffect(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

  const RuleItem = ({ rule }: { rule: { title: string; description: string; type: string } }) => {
    const icons = {
      warning: <AlertTriangle className="text-orange-400 mt-1" size={20} />,
      info: <Info className="text-blue-400 mt-1" size={20} />,
      success: <CheckCircle className="text-green-400 mt-1" size={20} />
    };
  
    const badgeLabels = {
      warning: 'ข้อควรระวัง',
      info: 'ข้อมูล',
      success: 'ประโยชน์'
    };
  
    const descriptionLines = rule.description
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^-+\s*/, ''));
  
    return (
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-lg"
      >
        {icons[rule.type]}
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-1">{rule.title}</h3>
          <ul className="text-gray-300 text-sm list-disc list-inside space-y-1">
            {descriptionLines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold
            ${
              rule.type === 'warning' ? 'bg-orange-500/20 text-orange-300' :
              rule.type === 'info' ? 'bg-blue-500/20 text-blue-300' :
              'bg-green-500/20 text-green-300'
            }
          `}
        >
          {badgeLabels[rule.type]}
        </span>
      </motion.div>
    );
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
            วิธีใช้งาน & กฎระเบียบ
          </h1>
          <div className="w-20"></div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* How to Buy */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-400/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <ShoppingCart size={20} />
                วิธีการซื้อ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {buyingSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon size={24} className="text-white" />
                      </div>
                      <div className="bg-cyan-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3">
                        {step.step}
                      </div>
                      <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-300">{step.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* How to Sell */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-400/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Tag size={20} />
                วิธีการขาย
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sellingSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon size={24} className="text-white" />
                      </div>
                      <div className="bg-purple-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3">
                        {step.step}
                      </div>
                      <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-300">{step.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* กฎการซื้อ */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-cyan-400/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <ShoppingCart size={20} />
                กฎการซื้อ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {buyRules.map((rule, index) => (
                  <RuleItem key={index} rule={rule} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* กฎการขาย */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-purple-400/30 backdrop-blur-sm mt-8">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <Tag size={20} />
                กฎการขาย
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sellRules.map((rule, index) => (
                  <RuleItem key={index} rule={rule} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* กฎของสังคม */}
          <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-green-400/30 backdrop-blur-sm mt-8">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Users size={20} />
                กฎของสังคม และมารยาทการซื้อขาย
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communityRules.map((rule, index) => (
                  <RuleItem key={index} rule={rule} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-gradient-to-br from-yellow-800/20 to-orange-900/20 border border-yellow-400/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Shield className="text-yellow-400 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-yellow-400 mb-2">ข้อควรระวังด้านความปลอดภัย</h3>
                  <p className="text-yellow-200 mb-4">
                    GooseNest ให้ความสำคัญกับความปลอดภัยของผู้ใช้เป็นอันดับแรก เราใช้ระบบเข้ารหัสข้อมูลและมีการตรวจสอบผู้ขายอย่างเข้มงวด
                  </p>
                  <ul className="text-yellow-200 text-sm space-y-1">
                    <li>• ไม่แชร์ข้อมูลส่วนตัวนอกระบบ</li>
                    <li>• แนะนำให้ซื้อผ่านระบบกลาง GooseNest เพื่อความปลอดภัยและการรับประกันการซื้อขาย</li>
                    <li>• ระวังการซื้อขายนอกระบบ เพราะทางแพลตฟอร์มจะไม่รับผิดชอบในกรณีเกิดปัญหา</li>
                    <li>• ใช้ระบบชำระเงินของแพลตฟอร์ม เท่านั้น!!! หากมีการใช้ระบบซื้อขายผ่านระบบกลาง GooseNest</li>
                    <li>• แจ้งปัญหาทันทีหากพบสิ่งผิดปกติ</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default HowToUse;
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Tag,
  HeadphonesIcon,
  Clock,
  Award,
  Users,
  Zap,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {

  useEffect(() => {
    const animateNumbers = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;

        if (step >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);
    };
    
    animateNumbers();
  }, []);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const features = [
    {
      icon: Shield,
      title: "ความปลอดภัยสูงสุด",
      description: "ระบบรักษาความปลอดภัยระดับธนาคาร พร้อมการยืนยันตัวตนหลายขั้นตอน",
      color: "from-blue-500 to-cyan-500",
      bgGlow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]"
    },
    {
      icon: Zap,
      title: "ธุรกรรมรวดเร็ว",
      description: "ประมวลผลการซื้อขายภายในไม่กี่วินาที พร้อมระบบแจ้งเตือนทันที",
      color: "from-yellow-500 to-orange-500",
      bgGlow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]"
    },
    {
      icon: Users,
      title: "ชุมชนที่เชื่อถือได้",
      description: "เกมเมอร์มากกว่า 15,000 คนเชื่อใจให้เราดูแลการซื้อขายของพวกเขา",
      color: "from-green-500 to-emerald-500",
      bgGlow: "hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]"
    },
    {
      icon: Award,
      title: "ราคาที่ดีที่สุด",
      description: "เปรียบเทียบราคาจากผู้ขายหลายรายเพื่อให้คุณได้ดีลที่คุ้มค่าที่สุด",
      color: "from-purple-500 to-pink-500",
      bgGlow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
    },
    {
      icon: Clock,
      title: "บริการ 24/7",
      description: "ทีมงานพร้อมให้บริการตลอด 24 ชั่วโมง ทุกวันของสัปดาห์",
      color: "from-red-500 to-rose-500",
      bgGlow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
    },
    {
      icon: HeadphonesIcon,
      title: "ซัพพอร์ตเป็นเลิศ",
      description: "ทีมซัพพอร์ตมืออาชีพพร้อมช่วยเหลือในทุกปัญหาที่คุณเจอ",
      color: "from-indigo-500 to-blue-500",
      bgGlow: "hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
    }
  ];

  const handleBuyClick = () => {
    if (isLoggedIn) {
      navigate("/buy");
    } else {
      navigate("/login");
    }
  };

  const handleSellClick = () => {
    if (isLoggedIn) {
      navigate("/sell");
    } else {
      navigate("/login");
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-2 sm:px-4 lg:px-6 pt-16 lg:pt-0">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-48 sm:w-64 h-48 sm:h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 text-center w-full max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 sm:mb-8"
          >
            <motion.img
                src="/LOGO_GooseNest.png"
                alt="LOGO"
                width="20%"
                className="mx-auto drop-shadow-[0_4px_30px_rgba(0,255,255,0.5)] opacity-100 brightness-100 contrast-125 saturate-100"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1, rotate: 1 }}
                transition={{ duration: 0.8 }}
            />

            <div className="flex justify-center items-center pb-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-tight flex items-center gap-4">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
                  GooseNest
                </span>
                <span className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-400 text-white px-5 py-2 rounded-xl drop-shadow-2xl font-bold">
                  hub
                </span>
              </h1>
            </div>

            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-cyan-300 font-medium mb-3 sm:mb-4 drop-shadow-lg px-4">
              รังห่านคือที่ซื้อขายรหัสเกมที่ปลอดภัยที่สุด
            </p>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              ออกแบบมาเพื่อเกมเมอร์ตัวจริง  
            </p>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              มั่นใจทุกธุรกรรม ปลอดภัยทุกการซื้อขาย
            </p>
          </motion.div>

          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4"
            >
              <Button
                size="lg"
                onClick={handleBuyClick}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.7)] transition-all duration-300"
              >
                <ShoppingCart className="mr-2" size={20} />
                เริ่มซื้อเลย
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleSellClick}
                className="w-full sm:w-auto border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-300"
              >
                <Tag className="mr-2" size={20} />
                เริ่มขาย
              </Button>
            </motion.div>

        </div>

        {/* Scroll Indicator - Hide on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden sm:block"
        >
          <div className="w-6 h-10 border-2 border-cyan-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2 animate-bounce"></div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-12 sm:py-16 lg:py-20 px-2 sm:px-4 lg:px-6 relative">
          <div className="w-full max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl sm:rounded-3xl blur-xl"></div>
              <div className="relative bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm border border-cyan-400/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 mx-2 sm:mx-0">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  พร้อมแล้วหรือยัง?
                </h2>
                <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
                  สัมผัสประสบการณ์ซื้อขายรหัสเกมอย่างมั่นใจ  
                  กับแพลตฟอร์มที่สร้างขึ้นเพื่อเกมเมอร์อย่างคุณ  
                  เริ่มต้นการเดินทางของคุณไปพร้อมกับเรา
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button
                    onClick={handleGoToLogin}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg shadow-[0_0_25px_rgba(34,211,238,0.5)] hover:shadow-[0_0_35px_rgba(34,211,238,0.7)] transition-all duration-300"
                  >
                    เข้าสู่ระบบ
                  </Button>
                  <Button
                    onClick={handleGoToRegister}
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-gray-400 text-gray-300 hover:bg-gray-400 hover:text-black font-semibold px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg transition-all duration-300"
                  >
                    สมัครสมาชิก
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-2 sm:px-4 lg:px-6 relative">
        <div className="w-full max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16 px-4"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              บริการครบครัน
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              ทุกอย่างที่คุณต้องการสำหรับการซื้อขายรหัสเกมอย่างปลอดภัย
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-0">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="group"
                >
                  <Card className={cn(
                    "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 hover:border-cyan-400/50 transition-all duration-300 h-full backdrop-blur-sm",
                    feature.bgGlow
                  )}>
                    <CardContent className="p-4 sm:p-6 text-center h-full flex flex-col">
                      <div className={cn(
                        "w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300",
                        feature.color
                      )}>
                        <Icon size={24} className="text-white sm:w-8 sm:h-8" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 group-hover:text-cyan-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-300 leading-relaxed flex-grow">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 border-t border-gray-800">
        <div className="w-full max-w-6xl mx-auto text-center">
          <div className="text-xl sm:text-2xl font-bold text-cyan-400 mb-3 sm:mb-4">GooseNest</div>
          <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
            แพลตฟอร์มซื้อขายรหัสเกมที่ปลอดภัยและเชื่อถือได้
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500">
            <span>© 2024 GooseNest. สงวนลิขสิทธิ์</span>
            <span>•</span>

            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="underline hover:text-cyan-500 transition-colors"
            >
              ความเป็นส่วนตัว
            </button>
            
            <span>•</span>

            <button
              type="button"
              onClick={() => navigate('/instructions-and-rules')}
              className="underline hover:text-cyan-500 transition-colors"
            >
              เงื่อนไขการใช้งาน
            </button>
            
            <span>•</span>

            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="underline hover:text-cyan-500 transition-colors"
            >
              ติดต่อเรา
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';

const Contact = () => {

  const contactMethods = [
    {
      icon: Mail,
      title: 'อีเมล',
      value: 'pongsatorn291047@gmail.com',
      href: 'mailto:pongsatorn291047@gmail.com',
      color: 'from-red-500 to-pink-500',
      description: 'ส่งอีเมลถึงเรา'
    },
    {
      icon: Phone,
      title: 'โทรศัพท์',
      value: '+66 64-605-3625',
      href: 'tel:+66 64-605-3625',
      color: 'from-green-500 to-emerald-500',
      description: 'โทรสอบถามข้อมูล'
    },
    {
      icon: MessageCircle,
      title: 'Line ID',
      value: '@goosenest_dev',
      href: 'https://line.me/ti/p/@goosenest_dev',
      color: 'from-green-400 to-green-600',
      description: 'แชทผ่าน Line'
    },
    {
      icon: MapPin,
      title: 'ที่อยู่',
      value: 'กรุงเทพมหานคร, ประเทศไทย',
      href: null,
      color: 'from-blue-500 to-cyan-500',
      description: 'ที่ตั้งของเรา'
    }
  ];

  const socialLinks = [
    {
      icon: ({ size, className }) => (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      name: 'Facebook',
      href: 'https://www.facebook.com/pongsatorn.pongsatornn',
      color: 'hover:bg-blue-600',
      bgColor: 'bg-blue-600'
    },
    {
      icon: ({ size, className }) => (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      name: 'Instagram',
      href: 'https://www.instagram.com/nrxt_.txe/',
      color: 'hover:bg-pink-600',
      bgColor: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500'
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

      {/* Header */}
      <div className="relative z-10 pt-8 pb-4 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Enhanced Page Title */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              ติดต่อเรา
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-6"
            ></motion.div>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              พร้อมให้บริการและตอบคำถามของคุณตลอด 24 ชั่วโมง<br />
              <span className="text-cyan-400">เราใส่ใจในทุกรายละเอียดเพื่อความพึงพอใจของคุณ</span>
            </p>
          </motion.div>

          <div className="">
            {/* Enhanced Developer Profile & Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Enhanced Developer Profile Card */}
              <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-500 shadow-2xl">
                <CardContent className="p-8 text-center relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                  
                  <div className="relative inline-block mb-6">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 p-1 shadow-2xl"
                    >
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                        <img
                            src="/me.jpg"
                            alt="Me"
                            className="w-full h-full object-cover rounded-full"
                        />
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-gray-900 flex items-center justify-center shadow-lg"
                    >
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                    </motion.div>
                    </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">พงศธร ไวยวรณ์</h3>
                  <div className="inline-block px-4 py-1 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full border border-cyan-400/30 mb-4">
                    <p className="text-cyan-400 font-medium text-sm">Developer & Founder</p>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    นักพัฒนาซอฟต์แวร์ที่มุ่งมั่นในการสร้างสรรค์ GooseNest 
                    ด้วยความใส่ใจในทุกรายละเอียด พร้อมให้ความสำคัญกับคุณภาพ 
                    และความปลอดภัยของผู้ใช้งานเป็นอันดับแรก
                   </p>
                  
                  {/* Enhanced Social Links */}
                  <div className="flex justify-center space-x-3">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <motion.a
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                          whileHover={{ scale: 1.1, y: -5 }}
                          className={`p-3 rounded-xl ${social.bgColor} ${social.color} transition-all duration-300 shadow-lg hover:shadow-xl group relative overflow-hidden`}
                        >
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <Icon size={20} className="relative z-10" />
                        </motion.a>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Contact Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl group">
                        <CardContent className="p-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                          
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <Icon size={20} className="text-white" />
                          </div>
                          
                          <h4 className="text-lg font-semibold text-white mb-1">{method.title}</h4>
                          <p className="text-xs text-gray-400 mb-3">{method.description}</p>
                          
                          {method.href ? (
                            <a
                              href={method.href}
                              className="text-gray-300 hover:text-cyan-400 transition-colors text-sm font-medium group-hover:underline"
                            >
                              {method.value}
                            </a>
                          ) : (
                            <p className="text-gray-300 text-sm font-medium">{method.value}</p>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Enhanced Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16"
          >
            <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm shadow-xl overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></div>
                
                <h3 className="text-2xl font-bold text-white mb-6 text-center">เวลาทำการ</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-gray-700/30 to-gray-800/30 border border-gray-600/30"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">จ-ศ</span>
                    </div>
                    <h4 className="font-semibold text-cyan-400 mb-2">จันทร์ - ศุกร์</h4>
                    <p className="text-gray-300">09:00 - 18:00 น.</p>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-gray-700/30 to-gray-800/30 border border-gray-600/30"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">ส-อ</span>
                    </div>
                    <h4 className="font-semibold text-purple-400 mb-2">เสาร์ - อาทิตย์</h4>
                    <p className="text-gray-300">10:00 - 16:00 น.</p>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 rounded-xl bg-gradient-to-br from-gray-700/30 to-gray-800/30 border border-gray-600/30"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail size={20} className="text-white" />
                    </div>
                    <h4 className="font-semibold text-emerald-400 mb-2">การตอบกลับ</h4>
                    <p className="text-gray-300">ภายใน 2-4 ชั่วโมง</p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
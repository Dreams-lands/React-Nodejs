import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, Send, Sparkles } from 'lucide-react';

interface FloatingContactProps {
  onQuickToast?: (msg: string) => void;
}

export const FloatingContact: React.FC<FloatingContactProps> = ({ onQuickToast }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<'zalo' | 'messenger' | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Xin chào bố mẹ thú cưng! 🐾 Bác sĩ thú y & tư vấn viên PetHub đang trực tuyến 24/7. Bạn cần tư vấn bé nào ạ?',
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setMessages((prev) => [...prev, { from: 'user', text: userMsg }]);
    setChatInput('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: `Cảm ơn bạn! Chuyên viên PetHub đã nhận tin nhắn "${userMsg}" và sẽ phản hồi ngay trong 30 giây nhé 💙`,
        },
      ]);
    }, 650);
  };

  return (
    <>
      {/* Fixed Floating Stack on Right Side of All Customer Pages */}
      <div className="fixed right-6 bottom-8 z-50 flex flex-col items-end gap-3.5 select-none">
        {/* 1. ZALO BUTTON (Matches reference image: #0068FF solid circle with bold white "Zalo") */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setHoveredId('zalo')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <AnimatePresence>
            {hoveredId === 'zalo' && (
              <motion.div
                initial={{ opacity: 0, x: 14, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                className="mr-3 px-3.5 py-2 rounded-xl bg-[#17324d]/95 text-white text-xs font-bold shadow-lg whitespace-nowrap backdrop-blur-md border border-white/15"
              >
                Chat Zalo tư vấn ngay
                <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setActiveChat(activeChat === 'zalo' ? null : 'zalo')}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.14, rotate: [-3, 3, -2, 0] }}
            whileTap={{ scale: 0.92 }}
            className="relative w-14 h-14 rounded-full bg-[#0068FF] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(0,104,255,0.42)] cursor-pointer border-2 border-white/25"
            aria-label="Liên hệ Zalo"
          >
            {/* Subtle pulse ring */}
            <span className="absolute inset-0 rounded-full bg-[#0068FF] opacity-30 animate-ping" style={{ animationDuration: '2.6s' }} />
            <span className="relative font-extrabold text-[15px] tracking-tight leading-none">
              Zalo
            </span>
          </motion.button>
        </div>

        {/* 2. MESSENGER BUTTON (Matches reference image: White circle + gradient bubble + lightning bolt) */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setHoveredId('messenger')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <AnimatePresence>
            {hoveredId === 'messenger' && (
              <motion.div
                initial={{ opacity: 0, x: 14, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                className="mr-3 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0088FF] via-[#A033FF] to-[#FF5280] text-white text-xs font-bold shadow-lg whitespace-nowrap"
              >
                Facebook Messenger 24/7
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setActiveChat(activeChat === 'messenger' ? null : 'messenger')}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.2, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.14, rotate: [3, -3, 2, 0] }}
            whileTap={{ scale: 0.92 }}
            className="relative w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-[0_8px_24px_rgba(23,50,77,0.16)] border border-[#dfe6f0] cursor-pointer"
            aria-label="Liên hệ Messenger"
          >
            <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
              <defs>
                <linearGradient id="msgrGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0099FF" />
                  <stop offset="55%" stopColor="#A033FF" />
                  <stop offset="82%" stopColor="#FF5280" />
                  <stop offset="100%" stopColor="#FF7061" />
                </linearGradient>
              </defs>
              <path
                d="M18 3C9.716 3 3 9.216 3 16.885c0 4.37 2.154 8.268 5.524 10.816.288.217.462.56.473.927l.099 2.893c.032.927 1.01 1.529 1.842 1.132l3.229-1.542a1.34 1.34 0 0 1 .905-.077c.94.258 1.938.397 2.928.397 8.284 0 15-6.216 15-13.885C33 9.216 26.284 3 18 3Z"
                fill="url(#msgrGrad)"
              />
              <path
                d="M9.6 20.86 14.01 13.85a2.15 2.15 0 0 1 3.11-.57l3.35 2.51a.86.86 0 0 0 1.04-.01l4.52-3.43c.6-.46 1.39.26.99.9l-4.41 7.01a2.15 2.15 0 0 1-3.11.57l-3.35-2.51a.86.86 0 0 0-1.04.01l-4.52 3.43c-.6.46-1.39-.26-.99-.9Z"
                fill="#FFFFFF"
              />
            </svg>
          </motion.button>
        </div>

        {/* 3. HOTLINE 1900 6868 BUTTON (Matches user choice A2: Orange #ff641f phone button) */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setHoveredId('hotline')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <AnimatePresence>
            {hoveredId === 'hotline' && (
              <motion.div
                initial={{ opacity: 0, x: 14, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                className="mr-3 px-3.5 py-2 rounded-xl bg-[#ff641f] text-white text-xs font-bold shadow-lg whitespace-nowrap"
              >
                Đường dây nóng: 1900 6868
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() =>
              onQuickToast?.('📞 Đang kết nối tổng đài chăm sóc thú cưng 1900 6868 (Miễn phí cước)...')
            }
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.8, delay: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            whileHover={{ scale: 1.14, rotate: [-6, 6, -6, 6, 0] }}
            whileTap={{ scale: 0.92 }}
            className="relative w-14 h-14 rounded-full bg-[#ff641f] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(255,100,31,0.42)] cursor-pointer border-2 border-white/25"
            aria-label="Gọi Hotline 1900 6868"
          >
            <span className="absolute inset-0 rounded-full bg-[#ff641f] opacity-25 animate-ping" style={{ animationDuration: '2.2s' }} />
            <Phone className="w-6 h-6 fill-white text-white relative" />
          </motion.button>
        </div>
      </div>

      {/* Interactive Quick Chat Popup when clicking Zalo or Messenger */}
      <AnimatePresence>
        {activeChat && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="fixed right-24 bottom-8 z-50 w-[340px] rounded-2xl bg-white border border-[#dfe6f0] shadow-[0_20px_50px_rgba(23,50,77,0.22)] overflow-hidden"
          >
            <div
              className={`px-4 py-3.5 text-white flex items-center justify-between ${
                activeChat === 'zalo'
                  ? 'bg-[#0068FF]'
                  : 'bg-gradient-to-r from-[#0088FF] via-[#A033FF] to-[#FF5280]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                  {activeChat === 'zalo' ? 'Zalo' : 'Msg'}
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    PetHub Việt Nam Official
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <div className="text-[10px] text-white/85 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" />
                    Thường trả lời ngay lập tức
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveChat(null)}
                className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 h-56 overflow-y-auto space-y-2.5 bg-[#f8faff]">
              {messages.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    m.from === 'bot'
                      ? 'bg-white text-[#17324d] border border-[#dfe6f0] shadow-xs'
                      : 'bg-[#0874e8] text-white ml-auto'
                  }`}
                >
                  {m.text}
                </motion.div>
              ))}
            </div>

            <form
              onSubmit={handleSend}
              className="p-2.5 bg-white border-t border-[#dfe6f0] flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Nhập câu hỏi cho PetHub..."
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-[#f3f7ff] text-[#17324d] focus:outline-none focus:ring-2 focus:ring-[#0874e8]"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-[#0874e8] text-white hover:bg-[#1464f4] transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

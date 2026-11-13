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
      text: 'Xin chào! Chuyên viên PetHub sẵn sàng tư vấn dinh dưỡng, phụ kiện và dịch vụ Spa cho thú cưng của bạn.',
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
          text: `Cảm ơn bạn. Tư vấn viên PetHub đã tiếp nhận nội dung "${userMsg}" và sẽ phản hồi ngay trong giây lát.`,
        },
      ]);
    }, 650);
  };

  return (
    <>
      <div className="fixed right-5 bottom-6 z-40 flex flex-col items-end gap-3 select-none">
        {/* 1. ZALO */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setHoveredId('zalo')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <AnimatePresence>
            {hoveredId === 'zalo' && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.94 }}
                transition={{ duration: 0.18 }}
                className="mr-3 px-3 py-1.5 rounded-lg bg-[#17324d] text-white text-xs font-semibold shadow-md whitespace-nowrap"
              >
                Tư vấn qua Zalo
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setActiveChat(activeChat === 'zalo' ? null : 'zalo')}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="w-12 h-12 rounded-full bg-[#0667d0] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(6,103,208,0.3)] cursor-pointer border-2 border-white"
            aria-label="Liên hệ Zalo"
          >
            <span className="font-extrabold text-[13px] tracking-tight leading-none">Zalo</span>
          </motion.button>
        </div>

        {/* 2. MESSENGER */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setHoveredId('messenger')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <AnimatePresence>
            {hoveredId === 'messenger' && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.94 }}
                transition={{ duration: 0.18 }}
                className="mr-3 px-3 py-1.5 rounded-lg bg-[#17324d] text-white text-xs font-semibold shadow-md whitespace-nowrap"
              >
                Facebook Messenger
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() => setActiveChat(activeChat === 'messenger' ? null : 'messenger')}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_6px_20px_rgba(23,50,77,0.16)] border-2 border-white cursor-pointer"
            aria-label="Liên hệ Messenger"
          >
            <svg width="26" height="26" viewBox="0 0 36 36" fill="none" aria-hidden="true">
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

        {/* 3. HOTLINE */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setHoveredId('hotline')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <AnimatePresence>
            {hoveredId === 'hotline' && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.94 }}
                transition={{ duration: 0.18 }}
                className="mr-3 px-3 py-1.5 rounded-lg bg-[#c2410c] text-white text-xs font-semibold shadow-md whitespace-nowrap"
              >
                Tổng đài: 1900 6868
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={() =>
              onQuickToast?.('Tổng đài tư vấn PetHub: 1900 6868 (8:00 – 21:00 mỗi ngày).')
            }
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="w-12 h-12 rounded-full bg-[#c2410c] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(194,65,12,0.3)] cursor-pointer border-2 border-white"
            aria-label="Gọi tổng đài 1900 6868"
          >
            <Phone className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Quick Chat Popup */}
      <AnimatePresence>
        {activeChat && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 sm:right-20 bottom-20 sm:bottom-6 z-50 w-[calc(100vw-2rem)] max-w-[330px] rounded-2xl bg-white border border-[#dfe6f0] shadow-[0_20px_48px_rgba(23,50,77,0.18)] overflow-hidden"
          >
            <div
              className={`px-4 py-3 text-white flex items-center justify-between ${
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
                    <span>PetHub Hỗ Trợ</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  </div>
                  <div className="text-[11px] text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" />
                    <span>Trực tuyến 24/7</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveChat(null)}
                className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer"
                aria-label="Đóng hộp chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 h-52 overflow-y-auto space-y-2.5 bg-[#f8faff]">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-[13px] leading-relaxed ${
                    m.from === 'bot'
                      ? 'bg-white text-[#17324d] border border-[#dfe6f0]'
                      : 'bg-[#0667d0] text-white ml-auto'
                  }`}
                >
                  {m.text}
                </div>
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
                placeholder="Nhập câu hỏi tư vấn..."
                className="flex-1 text-[13px] px-3 py-2 rounded-lg bg-[#f3f7ff] text-[#17324d] focus:outline-none focus:ring-2 focus:ring-[#0667d0]"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-[#0667d0] text-white hover:bg-[#0558b5] transition cursor-pointer"
                aria-label="Gửi tin nhắn"
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

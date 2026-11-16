import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, X, Send, Sparkles } from 'lucide-react';

interface FloatingContactProps {
  onQuickToast?: (msg: string) => void;
}

const ZALO_PROFILE_URL = 'https://zalo.me/0909686868';
const FACEBOOK_PROFILE_URL = 'https://www.facebook.com/pethub.vn';

export const FloatingContact: React.FC<FloatingContactProps> = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Xin chào! Chuyên viên Hỗ trợ trực tuyến PetsFriend sẵn sàng tư vấn dinh dưỡng, phụ kiện, đơn hàng và lịch chăm sóc cho thú cưng của bạn.',
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
          text: `Cảm ơn bạn. Nhân viên Hỗ trợ trực tuyến PetsFriend đã tiếp nhận "${userMsg}" và sẽ phản hồi ngay trong giây lát.`,
        },
      ]);
    }, 650);
  };

  return (
    <>
      <div className="fixed right-5 bottom-6 z-40 flex flex-col items-end gap-3 select-none">
        {/* 1. ZALO (Direct link to Zalo profile) */}
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
                Trang Zalo cá nhân
              </motion.div>
            )}
          </AnimatePresence>

          <motion.a
            href={ZALO_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="w-12 h-12 rounded-full bg-[#0068FF] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(0,104,255,0.3)] cursor-pointer border-2 border-white"
            aria-label="Mở trang Zalo cá nhân"
          >
            <span className="font-extrabold text-[13px] tracking-tight leading-none">Zalo</span>
          </motion.a>
        </div>

        {/* 2. FACEBOOK (Direct link to Facebook profile/page) */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setHoveredId('facebook')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <AnimatePresence>
            {hoveredId === 'facebook' && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.94 }}
                transition={{ duration: 0.18 }}
                className="mr-3 px-3 py-1.5 rounded-lg bg-[#17324d] text-white text-xs font-semibold shadow-md whitespace-nowrap"
              >
                Trang Facebook cá nhân
              </motion.div>
            )}
          </AnimatePresence>

          <motion.a
            href={FACEBOOK_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(24,119,242,0.28)] border-2 border-white cursor-pointer"
            aria-label="Mở trang Facebook"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13.5 22v-8.2h2.75l.41-3.2H13.5V8.55c0-.93.26-1.56 1.59-1.56h1.7V4.13c-.29-.04-1.31-.13-2.49-.13-2.46 0-4.15 1.5-4.15 4.26v2.34H7.4v3.2h2.75V22h3.35Z" />
            </svg>
          </motion.a>
        </div>

        {/* 3. HỖ TRỢ TRỰC TUYẾN (Live online support chat drawer) */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setHoveredId('support')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <AnimatePresence>
            {hoveredId === 'support' && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.94 }}
                transition={{ duration: 0.18 }}
                className="mr-3 px-3 py-1.5 rounded-lg bg-[#c2410c] text-white text-xs font-semibold shadow-md whitespace-nowrap"
              >
                Hỗ trợ trực tuyến
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={() => setSupportOpen((prev) => !prev)}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="w-12 h-12 rounded-full bg-[#c2410c] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(194,65,12,0.3)] cursor-pointer border-2 border-white"
            aria-label="Mở hộp thoại Hỗ trợ trực tuyến"
          >
            <Headphones className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Live Online Support Chat Popup */}
      <AnimatePresence>
        {supportOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed right-4 sm:right-20 bottom-20 sm:bottom-6 z-50 w-[calc(100vw-2rem)] max-w-[330px] rounded-2xl bg-white border border-[#dfe6f0] shadow-[0_20px_48px_rgba(23,50,77,0.18)] overflow-hidden"
          >
            <div className="px-4 py-3 text-white flex items-center justify-between bg-[#0667d0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>Hỗ trợ trực tuyến</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  </div>
                  <div className="text-[11px] text-white/95 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" />
                    <span>Nhân viên trực tuyến 24/7</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSupportOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer"
                aria-label="Đóng hộp hỗ trợ trực tuyến"
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
                placeholder="Nhập câu hỏi cần hỗ trợ..."
                className="flex-1 text-[13px] px-3 py-2 rounded-lg bg-[#f3f7ff] text-[#17324d] focus:outline-none focus:ring-2 focus:ring-[#0667d0]"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-[#0667d0] text-white hover:bg-[#0558b5] transition cursor-pointer"
                aria-label="Gửi tin nhắn hỗ trợ"
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

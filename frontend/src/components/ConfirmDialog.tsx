import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { useModalFocusTrap } from '../lib/useModalFocusTrap';

export interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
}

interface ConfirmDialogProps {
  dialog: ConfirmDialogState | null;
  onClose: () => void;
}

/**
 * Reusable confirmation modal for destructive or account-sensitive actions
 * (clearing cart, deleting saved address, changing password, signing out).
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ dialog, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(Boolean(dialog), onClose, panelRef);

  const isDanger = (dialog?.tone ?? 'danger') === 'danger';

  return (
    <AnimatePresence>
      {dialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pethub-confirm-title"
          aria-describedby="pethub-confirm-desc"
        >
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.28 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] rounded-2xl bg-white border border-[#dfe6f0] shadow-[0_24px_56px_rgba(15,23,42,0.22)] overflow-hidden focus:outline-none"
          >
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isDanger
                        ? 'bg-[#fff2e9] text-[#c2410c]'
                        : 'bg-[#eff5ff] text-[#0667d0]'
                    }`}
                  >
                    {isDanger ? (
                      <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <h2
                      id="pethub-confirm-title"
                      className="text-[17px] font-extrabold text-[#17324d] leading-snug"
                    >
                      {dialog.title}
                    </h2>
                    <p
                      id="pethub-confirm-desc"
                      className="text-[13.5px] text-[#52657a] mt-1.5 leading-relaxed"
                    >
                      {dialog.message}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Đóng hộp thoại"
                  className="p-1.5 rounded-lg text-[#52657a] hover:bg-[#f3f7ff] hover:text-[#17324d] transition cursor-pointer shrink-0 press-tactile"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#eef2f7]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[#dfe6f0] bg-white hover:bg-[#f8faff] text-[13px] font-semibold text-[#52657a] hover:text-[#17324d] transition cursor-pointer press-tactile"
                >
                  {dialog.cancelLabel || 'Hủy bỏ'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dialog.onConfirm();
                    onClose();
                  }}
                  className={`px-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition cursor-pointer press-tactile ${
                    isDanger
                      ? 'bg-[#c2410c] hover:bg-[#9a3412]'
                      : 'bg-[#0667d0] hover:bg-[#0557b3]'
                  }`}
                >
                  {dialog.confirmLabel || 'Xác nhận'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

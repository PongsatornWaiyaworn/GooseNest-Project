import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmColor?: "red" | "green";
};

const ConfirmDialog = ({
  isOpen,
  title = "ยืนยันการทำรายการ",
  message = "คุณแน่ใจหรือไม่ว่าต้องการดำเนินการนี้?",
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  onConfirm,
  onCancel,
  confirmColor = "red",
}: ConfirmDialogProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[99999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-[#1c1c1c] rounded-lg shadow-lg p-6 max-w-sm w-full text-cyan-300"
          >
            <h2 className="text-lg font-semibold mb-4">{title}</h2>
            <p className="mb-6">{message}</p>
            <div className="flex justify-end gap-3">
              <Button
                onClick={onCancel}
                className="bg-transparent text-gray-100 hover:bg-cyan-900"
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                className={
                  confirmColor === "green"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-red-700 text-white hover:bg-red-800"
                }
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;

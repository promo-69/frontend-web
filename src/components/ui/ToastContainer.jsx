import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '../../context/ToastContext'
import { CheckCircle, XCircle, Info } from 'lucide-react'

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-center gap-3 w-80 p-4 rounded-xl shadow-2xl border backdrop-blur-md text-white font-medium
              ${toast.type === 'success' ? 'bg-[#231640]/90 border-[#D9982F]' : 
                toast.type === 'error' ? 'bg-red-950/90 border-red-500' : 
                'bg-[#231640]/90 border-blue-500'}`}
          >
            {/* Icon */}
            {toast.type === 'success' && <CheckCircle className="w-6 h-6 text-[#D9982F] shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
            {toast.type === 'info' && <Info className="w-6 h-6 text-blue-500 shrink-0" />}

            {/* Message */}
            <p className="text-sm flex-1 leading-snug">{toast.message}</p>

            {/* Close Button */}
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-white/50 hover:text-white transition-colors shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

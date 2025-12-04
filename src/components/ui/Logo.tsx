import { motion } from "framer-motion";

export default function Logo() {
  return (
    <motion.div
      className="w-16 h-16 flex items-center justify-center
                 rounded-2xl border border-white/20 shadow-lg
                 backdrop-blur-sm"
      initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 14 }}
    >
      <motion.img
        src="/favicon.ico"
        alt="logo"
        className="w-10 h-10"
        animate={{
          rotate: [0, 8, -8, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}

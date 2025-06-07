import { motion } from 'framer-motion';

interface Props {
  count: number;
  lastMessage?: string;
}

export default function NotificationBadge({ count, lastMessage }: Props) {
  if (count === 0) return null;

  return (
    <motion.div
      className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full shadow-lg font-semibold max-w-[150px] truncate"
      initial={{ scale: 0.9 }}
      animate={{ scale: [1, 1.3, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
      title={lastMessage}
      style={{ whiteSpace: 'nowrap' }} // Prevent lastMessage wrapping in tooltip
    >
      {count > 99 ? '99+' : count}
      {lastMessage && (
        <div className="text-[10px] truncate mt-1 max-w-[150px]">{lastMessage}</div>
      )}
    </motion.div>
  );
}

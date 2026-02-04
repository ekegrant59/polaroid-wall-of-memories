import { motion } from 'framer-motion';

interface Props {
    onComplete: () => void;
}

export const TransitionOverlay = ({ onComplete }: Props) => (
    <motion.div
        className="fixed inset-0 bg-black/5 backdrop-blur-sm z-40 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeInOut" }}
        onAnimationComplete={onComplete}
    />
);

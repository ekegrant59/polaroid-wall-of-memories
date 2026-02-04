import { motion } from 'framer-motion';
import demo2 from '../assets/demo/demo2.png';

interface Props {
    imageUrl?: string;
    message?: string;
}

export const FinalSurprise = ({ imageUrl, message }: Props) => {
    const finalImage = imageUrl || demo2;
    const finalMessage = message || 'I love you so much my boo boo';

    // Generate some random heart positions
    const hearts = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 4,
    }));

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-paper overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            {/* Background floating hearts */}
            {hearts.map((heart) => (
                <motion.div
                    key={heart.id}
                    className="absolute text-rose-500/30 text-4xl"
                    style={{ left: heart.left, bottom: '-10%' }}
                    animate={{
                        y: '-120vh',
                        x: Math.random() * 100 - 50,
                        rotate: 360,
                        opacity: [0, 0.8, 0],
                    }}
                    transition={{
                        duration: heart.duration,
                        repeat: Infinity,
                        delay: heart.delay,
                        ease: "linear",
                    }}
                >
                    ♥
                </motion.div>
            ))}

            {/* Main Photo Content */}
            <motion.div
                className="relative z-10 p-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
            >
                <div className="bg-white p-4 shadow-2xl rotate-2 max-w-md mx-auto">
                    <img
                        src={finalImage}
                        alt="Us"
                        className="w-full h-auto object-cover sepia-[.1] block"
                    />
                    <div className="mt-4 text-center font-hand text-2xl text-ink">
                        {finalMessage}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { FinalSurprise } from './FinalSurprise';

interface Props {
    showButton: boolean;
    finalImage?: string;
    finalMessage?: string;
}

export const LetterFooter = ({ showButton, finalImage, finalMessage }: Props) => {
    const [showFinal, setShowFinal] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    // Scroll button into view when it appears
    useEffect(() => {
        if (showButton && !showFinal && buttonRef.current) {
            buttonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [showButton, showFinal]);

    return (
        <>
            <AnimatePresence>
                {showButton && !showFinal && (
                    <motion.div
                        ref={buttonRef}
                        className="mt-8 mb-12 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <button
                            onClick={() => setShowFinal(true)}
                            className="px-8 py-4 bg-pink-500 text-white rounded-full transition-all duration-300 transform hover:scale-105 font-serif text-lg tracking-wide shadow-lg animate-pulse"
                        >
                            Come here, you already know my answer
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {showFinal && <FinalSurprise imageUrl={finalImage} message={finalMessage} />}
        </>
    );
};

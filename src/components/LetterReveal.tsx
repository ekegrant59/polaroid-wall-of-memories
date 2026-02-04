import { TypingLetter } from './TypingLetter';
import { LetterFooter } from './LetterFooter';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
    letterContent?: string;
    finalImage?: string;
    finalMessage?: string;
}

export const LetterReveal = ({ letterContent, finalImage, finalMessage }: Props) => {
    const [isLetterDone, setIsLetterDone] = useState(false);

    return (
        <section className="flex flex-col items-center justify-center min-h-screen p-8 md:p-16 relative z-20">
            <motion.div
                className="w-full max-w-3xl p-2 md:p-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <TypingLetter
                    onComplete={() => setIsLetterDone(true)}
                    content={letterContent}
                />
                <LetterFooter
                    showButton={isLetterDone}
                    finalImage={finalImage}
                    finalMessage={finalMessage}
                />
            </motion.div>
        </section>
    );
};

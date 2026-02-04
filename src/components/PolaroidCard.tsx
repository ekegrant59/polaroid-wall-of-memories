import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Polaroid } from '../data/polaroids';
import roseFlower from '../assets/rose-flower.png';

interface Props {
    data: Polaroid;
    isViewed: boolean;
    onView: (id: string, isBurn: boolean) => void;
    index: number;
    isBurning: boolean;
    isMobile?: boolean;
    isFlipped?: boolean;
    onFlip?: (id: string) => void;
}

export const PolaroidCard = ({ data, onView, index, isBurning, isMobile = false, isFlipped, onFlip }: Props) => {
    const [internalFlipped, setInternalFlipped] = useState(false);

    // Use controlled state if provided, otherwise use internal state
    const flipped = isFlipped !== undefined ? isFlipped : internalFlipped;

    const handleClick = () => {
        if (flipped) return;
        if (onFlip) {
            onFlip(data.id);
        } else {
            setInternalFlipped(true);
        }
        onView(data.id, false);
    };

    return (
        <AnimatePresence>
            {!isBurning ? (
                <motion.div
                    layoutId={data.id}
                    className={`cursor-pointer bg-polaroid-frame p-3 shadow-2xl flex flex-col items-center group ${isMobile
                        ? 'relative w-80 h-92'
                        : 'absolute w-62 h-68'
                        }`}
                    style={isMobile ? {
                        zIndex: flipped ? 50 : data.zIndex,
                    } : {
                        left: data.x,
                        top: data.y,
                        zIndex: flipped ? 50 : data.zIndex,
                    }}
                    initial={{ opacity: 0, scale: 0.8, rotate: data.rotation + (Math.random() * 10 - 5) }}
                    animate={{
                        opacity: 1,
                        scale: flipped ? 1.2 : 1, // Scale up slightly based on user request "flip in an actual flipping over design"?
                        rotate: flipped ? 0 : data.rotation // Straighten when reading
                    }}
                    exit={{
                        opacity: 0,
                        scale: 1.5,
                        filter: "blur(10px) brightness(2)", // Burning/dissolving effect
                        transition: { duration: 1.5, delay: index * 0.4 } // Slower sequence
                    }}
                    whileHover={{ scale: flipped ? 1.2 : 1.1, rotate: 0, zIndex: 60 }}
                    onClick={handleClick}
                    transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
                >
                    {/* 3D Flip Container */}
                    <div className="relative w-full h-full" style={{ perspective: 1000 }}>
                        <motion.div
                            className="w-full h-full relative preserve-3d"
                            animate={{ rotateY: flipped ? 180 : 0 }}
                            transition={{ duration: 0.6 }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Front Side */}
                            <div className="absolute inset-0 backface-hidden w-full h-full">
                                <div className={`w-full ${isMobile ? 'h-72' : 'h-50'} bg-gray-200 overflow-hidden pointer-events-none relative`}>
                                    <img
                                        src={data.image}
                                        alt="memory"
                                        className="w-full h-full object-cover sepia-[.2] contrast-[.95] brightness-[1.05]"
                                    />
                                </div>
                                {/* Rose Decoration - Bottom Left, overlapping into image */}
                                <div className="absolute -bottom-4 -left-5 w-64 h-32 z-10">
                                    <img src={roseFlower} alt="rose" className="w-full h-full object-contain" />
                                </div>
                                {/* Heart Icon - Bottom Right */}
                                <div className="absolute bottom-0 right-2">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-pink-300">
                                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                    </svg>
                                </div>
                            </div>


                            {/* Back Side */}
                            <div
                                className="absolute inset-0 backface-hidden w-full h-full bg-polaroid-frame flex items-center justify-center p-4 text-center border border-rose-muted/10 overflow-hidden"
                                style={{ transform: 'rotateY(180deg)' }}
                            >
                                <p className="handwritten text-ink text-xl leading-relaxed">
                                    {data.message}
                                </p>
                                {/* Rose Decoration - Bottom Left */}
                                <div className="absolute -bottom-4 -left-5 w-64 h-32 z-10">
                                    <img src={roseFlower} alt="rose" className="w-full h-full object-contain" />
                                </div>
                                {/* Heart Icon - Bottom Right */}
                                <div className="absolute bottom-2 right-2">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-pink-300">
                                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                                    </svg>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
};

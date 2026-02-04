import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { PolaroidCard } from './PolaroidCard';
import { POLAROIDS } from '../data/polaroids';
import type { Polaroid } from '../data/polaroids';

interface Props {
    viewed: Set<string>;
    onView: (id: string, isBurn: boolean) => void;
    isBurning: boolean;
    customPolaroids?: Polaroid[];
}

export const MobileCarousel = ({ viewed, onView, isBurning, customPolaroids }: Props) => {
    const polaroidsData = customPolaroids || POLAROIDS;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

    const handleFlip = (id: string) => {
        setFlippedCards(prev => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const swipeThreshold = 50;

        if (info.offset.x < -swipeThreshold && currentIndex < polaroidsData.length - 1) {
            // Swiped left - go to next
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
        } else if (info.offset.x > swipeThreshold && currentIndex > 0) {
            // Swiped right - go to previous
            setDirection(-1);
            setCurrentIndex(prev => prev - 1);
        }
    };

    const slideVariants = {
        enter: (dir: number) => ({
            x: dir > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.8,
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (dir: number) => ({
            x: dir > 0 ? -300 : 300,
            opacity: 0,
            scale: 0.8,
        }),
    };

    const currentPolaroid = polaroidsData[currentIndex];

    return (
        <section className="h-screen w-full relative overflow-hidden flex flex-col">
            {/* Top Instruction Badge */}
            {!isBurning && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-6 left-0 w-full flex justify-center z-40 pointer-events-none px-4"
                >
                    <div className="bg-rose-muted/10 backdrop-blur-md border border-rose-muted/20 px-4 py-2 rounded-full shadow-sm">
                        <p className="font-serif text-ink/60 text-xs tracking-widest uppercase text-center">
                            Tap to open • Swipe for more
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Carousel Container */}
            <div className="flex-1 flex items-center justify-center relative px-4 mt-16">
                <AnimatePresence mode="wait" custom={direction}>
                    {!isBurning && (
                        <motion.div
                            key={currentPolaroid.id}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.15, type: "spring", stiffness: 400, damping: 25 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.15}
                            onDragEnd={handleDragEnd}
                            className="relative touch-pan-y"
                            style={{
                                transform: `rotate(${currentPolaroid.rotation}deg)`,
                            }}
                        >
                            <PolaroidCard
                                data={currentPolaroid}
                                isViewed={viewed.has(currentPolaroid.id)}
                                onView={onView}
                                index={currentIndex}
                                isBurning={isBurning}
                                isMobile={true}
                                isFlipped={flippedCards.has(currentPolaroid.id)}
                                onFlip={handleFlip}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            {!isBurning && (
                <div className="absolute bottom-8 left-0 w-full flex justify-center gap-2 z-40">
                    {polaroidsData.map((polaroid, idx) => (
                        <button
                            key={polaroid.id}
                            onClick={() => {
                                setDirection(idx > currentIndex ? 1 : -1);
                                setCurrentIndex(idx);
                            }}
                            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentIndex
                                ? 'bg-rose-deep scale-125'
                                : viewed.has(polaroid.id)
                                    ? 'bg-rose-muted/60'
                                    : 'bg-rose-muted/30'
                                }`}
                            aria-label={`Go to photo ${idx + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Swipe Hint Animation */}
            {!isBurning && viewed.size === 0 && (
                <motion.div
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 text-ink/40"
                    animate={{ x: [-10, 10, -10] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                </motion.div>
            )}
        </section>
    );
};

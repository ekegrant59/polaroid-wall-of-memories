import { PolaroidCard } from './PolaroidCard';
import { MobileCarousel } from './MobileCarousel';
import { POLAROIDS } from '../data/polaroids';
import type { Polaroid } from '../data/polaroids';
import { useIsMobile } from '../hooks/useIsMobile';
import { motion } from 'framer-motion';

interface Props {
    viewed: Set<string>;
    onView: (id: string, isBurn: boolean) => void;
    isBurning: boolean;
    customPolaroids?: Polaroid[];
}

export const PolaroidWall = ({ viewed, onView, isBurning, customPolaroids }: Props) => {
    const isMobile = useIsMobile();
    const polaroidsData = customPolaroids || POLAROIDS;

    // Render mobile carousel for phones and tablets
    if (isMobile) {
        return (
            <MobileCarousel
                viewed={viewed}
                onView={onView}
                isBurning={isBurning}
                customPolaroids={polaroidsData}
            />
        );
    }

    // Desktop scattered layout
    return (
        <section className="min-h-screen w-full relative">

            {/* Top Instruction Badge */}
            {!isBurning && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-8 left-0 w-full flex justify-center z-40 pointer-events-none"
                >
                    <div className="bg-rose-muted/10 backdrop-blur-md border border-rose-muted/20 px-6 py-2 rounded-full shadow-sm">
                        <p className="font-serif text-ink/60 text-sm tracking-widest uppercase">
                            Open all the cards for a surprise
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Using a fixed container to hold the absolute positioned items */}
            <div className="absolute inset-0 w-full h-full max-w-[1600px] mx-auto">
                {polaroidsData.map((photo, index) => (
                    <PolaroidCard
                        key={photo.id}
                        data={photo}
                        isViewed={viewed.has(photo.id)}
                        onView={onView}
                        index={index}
                        isBurning={isBurning}
                    />
                ))}
            </div>
        </section>
    );
};

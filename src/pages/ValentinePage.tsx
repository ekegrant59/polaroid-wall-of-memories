import { useState } from 'react';
import { PolaroidWall } from '../components/PolaroidWall';
import { TransitionOverlay } from '../components/TransitionOverlay';
import { LetterReveal } from '../components/LetterReveal';
import { POLAROIDS } from '../data/polaroids';
import { useIsMobile } from '../hooks/useIsMobile';
import rosesBackground from '../assets/roses-background.png';
import rosesBackgroundMobile from '../assets/rose-background-mobile.png';

type PageStage = 'wall' | 'transition' | 'letter';

export const ValentinePage = () => {
    const [viewedPhotos, setViewedPhotos] = useState<Set<string>>(new Set());
    const [stage, setStage] = useState<PageStage>('wall');
    const [isBurning, setIsBurning] = useState(false);
    const isMobile = useIsMobile();

    const handlePhotoViewed = (id: string) => {
        setViewedPhotos(prev => {
            const next = new Set(prev);
            next.add(id);

            // If all photos are viewed, trigger transition
            if (next.size === POLAROIDS.length) {
                if (isMobile) {
                    // Skip burn animation on mobile, go straight to transition
                    setTimeout(() => setStage('transition'), 2500);
                } else {
                    // Desktop: trigger burn sequence
                    setTimeout(() => setIsBurning(true), 1500);
                    setTimeout(() => setStage('transition'), 5000);
                }
            }
            return next;
        });
    };

    return (
        <main
            className="relative min-h-screen w-full overflow-hidden"
            style={{
                backgroundImage: `url(${isMobile ? rosesBackgroundMobile : rosesBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >

            {/* Texture Overlay */}
            <div className="texture-overlay" />


            {stage === 'wall' && (
                <PolaroidWall
                    viewed={viewedPhotos}
                    onView={handlePhotoViewed}
                    isBurning={isBurning}
                />
            )}

            {stage === 'transition' && (
                <TransitionOverlay onComplete={() => setStage('letter')} />
            )}

            {stage === 'letter' && <LetterReveal />}
        </main>
    );
};

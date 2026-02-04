import { useState } from 'react';
import { PolaroidWall } from './PolaroidWall';
import { TransitionOverlay } from './TransitionOverlay';
import { LetterReveal } from './LetterReveal';
import { useIsMobile } from '../hooks/useIsMobile';
import rosesBackground from '../assets/roses-background.png';
import rosesBackgroundMobile from '../assets/rose-background-mobile.png';
import { Footer } from './Footer';

interface WallData {
    id: string;
    title: string;
    letter_content: string;
    final_image_url: string;
    final_message: string;
}

interface PolaroidData {
    id: string;
    image_url: string;
    message: string;
    position_x: string;
    position_y: string;
    rotation: number;
    z_index: number;
}

interface Props {
    wall: WallData;
    polaroids: PolaroidData[];
}

type PageStage = 'wall' | 'transition' | 'letter';

export const WallViewer = ({ wall, polaroids }: Props) => {
    const [viewedPhotos, setViewedPhotos] = useState<Set<string>>(new Set());
    const [stage, setStage] = useState<PageStage>('wall');
    const [isBurning, setIsBurning] = useState(false);
    const isMobile = useIsMobile();

    // Transform polaroids data to match the component format
    const transformedPolaroids = polaroids.map((p) => ({
        id: p.id,
        image: p.image_url,
        message: p.message,
        x: p.position_x,
        y: p.position_y,
        rotation: p.rotation,
        zIndex: p.z_index,
    }));

    const handlePhotoViewed = (id: string) => {
        setViewedPhotos(prev => {
            const next = new Set(prev);
            next.add(id);

            // If all photos are viewed, trigger transition
            if (next.size === polaroids.length) {
                if (isMobile) {
                    setTimeout(() => setStage('transition'), 2500);
                } else {
                    setTimeout(() => setIsBurning(true), 1500);
                    setTimeout(() => setStage('transition'), 5000);
                }
            }
            return next;
        });
    };

    return (
        <main
            className="relative min-h-screen w-full"
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
                    customPolaroids={transformedPolaroids}
                />
            )}

            {stage === 'transition' && (
                <TransitionOverlay onComplete={() => setStage('letter')} />
            )}

            {stage === 'letter' && (
                <LetterReveal
                    letterContent={wall.letter_content}
                    finalImage={wall.final_image_url}
                    finalMessage={wall.final_message}
                />
            )}

            {/* Footer */}
            <Footer />
        </main>
    );
};

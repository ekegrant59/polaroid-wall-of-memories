import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, Mail, Lock, X } from 'lucide-react';
import { PolaroidWall } from '../components/PolaroidWall';
import { TransitionOverlay } from '../components/TransitionOverlay';
import { LetterReveal } from '../components/LetterReveal';
import { Footer } from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { DEMO_POLAROIDS, DEMO_LETTER_CONTENT, DEMO_FINAL_MESSAGE } from '../data/demoData';
import rosesBackground from '../assets/roses-background.png';
import rosesBackgroundMobile from '../assets/rose-background-mobile.png';

type PageStage = 'marketing' | 'wall' | 'transition' | 'letter';

export const LandingPage = () => {
    const { user } = useAuth();
    const isMobile = useIsMobile();
    const [stage, setStage] = useState<PageStage>('marketing');
    const [viewedPhotos, setViewedPhotos] = useState<Set<string>>(new Set());
    const [isBurning, setIsBurning] = useState(false);
    const [showCTA, setShowCTA] = useState(true);

    const handlePhotoViewed = (id: string) => {
        setViewedPhotos(prev => {
            const next = new Set(prev);
            next.add(id);

            if (next.size === DEMO_POLAROIDS.length) {
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

    const startDemo = () => {
        setStage('wall');
    };

    // Marketing/Hero View
    if (stage === 'marketing') {
        return (
            <main
                className="min-h-screen w-full relative overflow-hidden"
                style={{
                    backgroundImage: `url(${isMobile ? rosesBackgroundMobile : rosesBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                }}
            >
                <div className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10 pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-2xl"
                    >
                        <h1 className="font-hand text-5xl md:text-7xl text-ink mb-6">
                            Wall of Memories
                        </h1>
                        <p className="font-serif text-xl md:text-2xl text-ink/70 mb-8 leading-relaxed">
                            Create a beautiful, interactive memory wall for your special someone.
                            Flip through polaroids, reveal a heartfelt letter, and share your love story.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <button
                                onClick={startDemo}
                                className="px-8 py-4 bg-pink-500 text-white rounded-full font-serif text-lg shadow-lg hover:bg-pink-600 transition-all hover:scale-105 flex items-center gap-2"
                            >
                                View Demo <Sparkles className="w-5 h-5" />
                            </button>
                            {user ? (
                                <Link
                                    to="/dashboard"
                                    className="px-8 py-4 bg-white/80 text-ink rounded-full font-serif text-lg shadow-lg hover:bg-white transition-all hover:scale-105"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <Link
                                    to="/signup"
                                    className="px-8 py-4 bg-white/80 text-ink rounded-full font-serif text-lg shadow-lg hover:bg-white transition-all hover:scale-105"
                                >
                                    Create Your Own
                                </Link>
                            )}
                        </div>
                    </motion.div>

                    {/* Feature Highlights */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl px-4"
                    >
                        <FeatureCard
                            icon={<Camera className="w-8 h-8 text-pink-500" />}
                            title="Polaroid Memories"
                            description="Upload 8 photos with personal messages that flip to reveal your thoughts."
                        />
                        <FeatureCard
                            icon={<Mail className="w-8 h-8 text-pink-500" />}
                            title="Love Letter"
                            description="Type out a heartfelt letter that reveals character by character."
                        />
                        <FeatureCard
                            icon={<Lock className="w-8 h-8 text-pink-500" />}
                            title="PIN Protected"
                            description="Share a private link with a PIN code only your loved one knows."
                        />
                    </motion.div>


                    {/* Footer */}
                    <Footer />
                </div >
            </main >
        );
    }

    // Demo Experience View
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
            <div className="texture-overlay" />

            {stage === 'wall' && (
                <PolaroidWall
                    viewed={viewedPhotos}
                    onView={handlePhotoViewed}
                    isBurning={isBurning}
                    customPolaroids={DEMO_POLAROIDS}
                />
            )}

            {stage === 'transition' && (
                <TransitionOverlay onComplete={() => setStage('letter')} />
            )}

            {stage === 'letter' && (
                <LetterReveal
                    letterContent={DEMO_LETTER_CONTENT}
                    finalMessage={DEMO_FINAL_MESSAGE}
                />
            )}

            {/* Floating CTA Bar */}
            <AnimatePresence>
                {showCTA && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 left-0 w-full flex justify-center z-50 px-4"
                    >
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 flex items-center gap-4 max-w-md w-full">
                            <div className="flex-1">
                                <p className="font-serif text-ink text-sm font-medium">
                                    Create your own memory wall
                                </p>
                                <p className="text-ink/60 text-xs">
                                    Personalize it for someone special
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {user ? (
                                    <Link
                                        to="/dashboard"
                                        className="px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-serif shadow hover:bg-pink-600 transition-all"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/signup"
                                            className="px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-serif shadow hover:bg-pink-600 transition-all"
                                        >
                                            Create
                                        </Link>
                                        <Link
                                            to="/login"
                                            className="px-4 py-2 text-ink/70 text-sm font-serif hover:text-ink transition-all"
                                        >
                                            Sign In
                                        </Link>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={() => setShowCTA(false)}
                                className="text-ink/40 hover:text-ink/60 p-1"
                                aria-label="Dismiss"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Re-show CTA button */}
            {!showCTA && (
                <button
                    onClick={() => setShowCTA(true)}
                    className="fixed bottom-6 right-6 z-50 bg-pink-500 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-pink-600 transition-all"
                >
                    <Sparkles className="w-6 h-6" />
                </button>
            )}
        </main>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg flex flex-col items-center">
        <div className="mb-3">{icon}</div>
        <h3 className="font-serif text-lg font-semibold text-ink mb-2">{title}</h3>
        <p className="text-ink/70 text-sm">{description}</p>
    </div>
);

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartCrack, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { WallViewer } from '../components/WallViewer';
import { Footer } from '../components/Footer';

interface WallData {
    id: string;
    slug: string;
    pin_code: string | null;
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

export const WallViewerPage = () => {
    const { slug } = useParams();
    const [wall, setWall] = useState<WallData | null>(null);
    const [polaroids, setPolaroids] = useState<PolaroidData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pinRequired, setPinRequired] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState('');
    const [unlocked, setUnlocked] = useState(false);

    useEffect(() => {
        fetchWall();
    }, [slug]);

    const fetchWall = async () => {
        const { data: wallData, error: wallError } = await supabase
            .from('walls')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single();

        if (wallError) {
            setError('Wall not found');
            setLoading(false);
            return;
        }

        setWall(wallData);

        // Check if PIN is required
        if (wallData.pin_code) {
            setPinRequired(true);
            setLoading(false);
            return;
        }

        // No PIN, load polaroids
        await loadPolaroids(wallData.id);
    };

    const loadPolaroids = async (wallId: string) => {
        const { data: polaroidData } = await supabase
            .from('polaroids')
            .select('*')
            .eq('wall_id', wallId)
            .order('position', { ascending: true });

        setPolaroids(polaroidData || []);

        // Increment view count
        await supabase.rpc('increment_view_count', { wall_id: wallId });

        setLoading(false);
    };

    const handlePinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPinError('');

        if (wall && pinInput === wall.pin_code) {
            setUnlocked(true);
            setPinRequired(false);
            setLoading(true);
            await loadPolaroids(wall.id);
        } else {
            setPinError('Incorrect PIN');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="animate-pulse text-ink/60 font-serif text-xl">Loading memories...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="text-center">
                    <div className="mb-4 text-pink-500"><HeartCrack className="w-16 h-16 mx-auto" /></div>
                    <h1 className="font-hand text-3xl text-ink mb-2">Wall Not Found</h1>
                    <p className="text-ink/60 font-serif">This memory wall doesn't exist or isn't published.</p>
                </div>
            </div>
        );
    }

    if (pinRequired && !unlocked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-sm bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center"
                >
                    <div className="mb-4 text-pink-500"><Lock className="w-12 h-12 mx-auto" /></div>
                    <h1 className="font-hand text-3xl text-ink mb-2">{wall?.title}</h1>
                    <p className="text-ink/60 font-serif mb-6">Enter the PIN to view this memory wall.</p>

                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        {pinError && (
                            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
                                {pinError}
                            </div>
                        )}
                        <input
                            type="text"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Enter PIN"
                            maxLength={6}
                            className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full py-3 bg-pink-500 text-white rounded-full font-serif text-lg shadow-lg hover:bg-pink-600 transition-all"
                        >
                            Unlock
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    // Render the actual wall
    return (
        <div className="flex flex-col min-h-screen">
            <WallViewer
                wall={wall!}
                polaroids={polaroids}
            />
            {/* Conditional footer rendering or just append? WallViewer might be absolute positioned. */}
            {/* <Footer /> */}
        </div>
    );
};

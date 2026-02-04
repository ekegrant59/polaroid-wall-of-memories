import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Link as LinkIcon, Trash2, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Footer } from '../components/Footer';
import rosesBackground from '../assets/roses-background.png';

interface Wall {
    id: string;
    slug: string;
    title: string;
    is_published: boolean;
    view_count: number;
    created_at: string;
}

export const DashboardPage = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [wall, setWall] = useState<Wall | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchWall();
    }, [user]);

    const fetchWall = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('walls')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching wall:', error);
        }

        setWall(data);
        setLoading(false);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleCreateWall = () => {
        navigate('/edit');
    };

    const handleDeleteWall = async () => {
        if (!wall) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${wall.title}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        setDeleting(true);

        try {
            const { error } = await supabase
                .from('walls')
                .delete()
                .eq('id', wall.id);

            if (error) throw error;

            setWall(null);
        } catch (error) {
            console.error('Error deleting wall:', error);
            alert('Failed to delete wall. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <main
            className="min-h-screen w-full px-4 py-8"
            style={{
                backgroundImage: `url(${rosesBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
            }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="font-hand text-4xl text-ink">Dashboard</h1>
                        <p className="text-ink/60 font-serif">Welcome, {user?.user_metadata?.username || 'Friend'}</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="px-4 py-2 text-ink/60 hover:text-ink font-serif transition-colors"
                    >
                        Sign Out
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-pulse text-ink/60 font-serif text-xl">Loading...</div>
                    </div>
                ) : wall ? (
                    /* Existing Wall Card */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="font-hand text-2xl text-ink">{wall.title}</h2>
                                <p className="text-ink/60 font-serif text-sm">
                                    Created {new Date(wall.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-serif ${wall.is_published
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {wall.is_published ? 'Published' : 'Draft'}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-ink/60 font-serif text-sm mb-6">
                            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {wall.view_count} views</span>
                            <span className="flex items-center gap-1"><LinkIcon className="w-4 h-4" /> /w/{wall.slug}</span>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                to={`/edit/${wall.id}`}
                                className="flex-1 py-3 bg-pink-500 text-white text-center rounded-full font-serif shadow-lg hover:bg-pink-600 transition-all"
                            >
                                Edit Wall
                            </Link>
                            {wall.is_published && (
                                <Link
                                    to={`/w/${wall.slug}`}
                                    target="_blank"
                                    className="px-6 py-3 bg-white border border-pink-200 text-ink rounded-full font-serif shadow hover:bg-pink-50 transition-all"
                                >
                                    View
                                </Link>
                            )}
                            <button
                                onClick={handleDeleteWall}
                                disabled={deleting}
                                className="px-4 py-3 bg-white border border-red-200 text-red-500 rounded-full font-serif shadow hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50"
                                title="Delete Wall"
                            >
                                {deleting ? '...' : <Trash2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* No Wall - Create One */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center"
                    >
                        <div className="mb-4 text-pink-500"><Heart className="w-16 h-16 mx-auto" /></div>
                        <h2 className="font-hand text-3xl text-ink mb-2">No Memory Wall Yet</h2>
                        <p className="text-ink/60 font-serif mb-8">
                            Create your first memory wall and share it with someone special.
                        </p>
                        <button
                            onClick={handleCreateWall}
                            className="px-8 py-4 bg-pink-500 text-white rounded-full font-serif text-lg shadow-lg hover:bg-pink-600 transition-all hover:scale-105"
                        >
                            Create Your Wall
                        </button>
                    </motion.div>
                )}
            </div>
            <Footer />
        </main>
    );
};

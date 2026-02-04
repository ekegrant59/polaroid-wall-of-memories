import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Mail, Gift, Settings, Check, X, Sparkles, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { Footer } from '../components/Footer';
import { ProgressModal } from '../components/ProgressModal';
import type { ProgressStatus } from '../components/ProgressModal';
import rosesBackground from '../assets/roses-background.png';

interface PolaroidData {
    id?: string;
    image_url: string;
    message: string;
    file?: File;
}

interface WallData {
    id?: string;
    slug: string;
    pin_code: string;
    title: string;
    letter_content: string;
    final_image_url: string;
    final_message: string;
    final_image_file?: File;
    is_published: boolean;
}

type TabType = 'polaroids' | 'letter' | 'final' | 'settings';
const TABS: TabType[] = ['polaroids', 'letter', 'final', 'settings'];

export const EditorPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<TabType>('polaroids');
    const [loading, setLoading] = useState(!!id);
    const [saving, setSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Progress Modal State
    const [showProgress, setShowProgress] = useState(false);
    const [progressStatus, setProgressStatus] = useState<ProgressStatus>('idle');
    const [progressCurrent, setProgressCurrent] = useState(0);
    const [progressTotal, setProgressTotal] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [isPublishing, setIsPublishing] = useState(false);

    const [wall, setWall] = useState<WallData>({
        slug: '',
        pin_code: '',
        title: '',
        letter_content: '',
        final_image_url: '',
        final_message: '',
        is_published: false,
    });

    const [polaroids, setPolaroids] = useState<PolaroidData[]>(
        Array(8).fill(null).map(() => ({ image_url: '', message: '' }))
    );

    // Validation functions
    const getUploadedPolaroids = () => polaroids.filter(p => p.image_url);

    const isPolaroidsValid = () => {
        const uploaded = getUploadedPolaroids();
        if (uploaded.length < 3 || uploaded.length > 8) return false;
        // Every uploaded image must have a message
        return uploaded.every(p => p.message.trim() !== '');
    };

    const isLetterValid = () => wall.letter_content.trim().length >= 20;
    const isFinalValid = () => wall.final_image_url !== '' && wall.final_message.trim() !== '';
    const isSettingsValid = () => wall.title.trim() !== '' && wall.slug.trim() !== '';

    const isSectionValid = (tab: TabType) => {
        switch (tab) {
            case 'polaroids': return isPolaroidsValid();
            case 'letter': return isLetterValid();
            case 'final': return isFinalValid();
            case 'settings': return isSettingsValid();
        }
    };

    const isAllSectionsComplete = () =>
        isPolaroidsValid() && isLetterValid() && isFinalValid() && isSettingsValid();

    const getCurrentTabIndex = () => TABS.indexOf(activeTab);
    const isLastTab = () => activeTab === 'settings';

    const getValidationErrorsForTab = (tab: TabType): string[] => {
        const errors: string[] = [];
        if (tab === 'polaroids') {
            const uploaded = getUploadedPolaroids();
            if (uploaded.length < 3) errors.push(`Need at least 3 polaroids (you have ${uploaded.length})`);
            if (uploaded.length > 8) errors.push('Maximum 8 polaroids allowed');
            const missingMessages = uploaded.filter(p => !p.message.trim());
            if (missingMessages.length > 0) errors.push(`${missingMessages.length} polaroid(s) missing messages`);
        }
        if (tab === 'letter' && wall.letter_content.trim().length < 20) {
            errors.push('Letter must be at least 20 characters');
        }
        if (tab === 'final') {
            if (!wall.final_image_url) errors.push('Please upload a final image');
            if (!wall.final_message.trim()) errors.push('Please add a final message');
        }
        if (tab === 'settings') {
            if (!wall.title.trim()) errors.push('Wall title is required');
            if (!wall.slug.trim()) errors.push('URL slug is required');
        }
        return errors;
    };

    const handleNext = () => {
        const errors = getValidationErrorsForTab(activeTab);
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }
        setValidationErrors([]);
        const currentIndex = getCurrentTabIndex();
        if (currentIndex < TABS.length - 1) {
            setActiveTab(TABS[currentIndex + 1]);
        }
    };

    useEffect(() => {
        if (id) {
            fetchWall();
        }
    }, [id]);

    const fetchWall = async () => {
        const { data: wallData, error: wallError } = await supabase
            .from('walls')
            .select('*')
            .eq('id', id)
            .single();

        if (wallError) {
            console.error('Error fetching wall:', wallError);
            navigate('/dashboard');
            return;
        }

        setWall(wallData);

        const { data: polaroidData } = await supabase
            .from('polaroids')
            .select('*')
            .eq('wall_id', id)
            .order('position', { ascending: true });

        if (polaroidData) {
            const filledPolaroids = Array(8).fill(null).map(() => ({ image_url: '', message: '' }));
            polaroidData.forEach(p => {
                if (p.position >= 0 && p.position < 8) {
                    filledPolaroids[p.position] = p;
                }
            });
            setPolaroids(filledPolaroids);
        }

        setLoading(false);
    };

    const handlePolaroidChange = (index: number, field: 'message', value: string) => {
        const newPolaroids = [...polaroids];
        newPolaroids[index] = { ...newPolaroids[index], [field]: value };
        setPolaroids(newPolaroids);
    };

    const handleImageUpload = async (index: number, file: File) => {
        const newPolaroids = [...polaroids];
        newPolaroids[index] = {
            ...newPolaroids[index],
            file,
            image_url: URL.createObjectURL(file),
        };
        setPolaroids(newPolaroids);
    };

    const handleRemoveImage = (index: number) => {
        const newPolaroids = [...polaroids];
        newPolaroids[index] = { image_url: '', message: '' };
        setPolaroids(newPolaroids);
    };

    const handleSave = async (publish: boolean = false) => {
        if (!user) return;

        // If publishing, validate all sections
        if (publish) {
            const allErrors: string[] = [];
            TABS.forEach(tab => {
                allErrors.push(...getValidationErrorsForTab(tab));
            });
            if (allErrors.length > 0) {
                setValidationErrors(allErrors);
                return;
            }
        }

        // Check availability of slug
        if (wall.slug.trim()) {
            let query = supabase.from('walls').select('id').eq('slug', wall.slug);
            if (id) {
                query = query.neq('id', id);
            }

            const { data: existingWalls, error: checkError } = await query;

            if (checkError) {
                console.error("Error checking slug uniqueness:", checkError);
                setValidationErrors(["Failed to validate URL slug availability. Please try again."]);
                return;
            }

            if (existingWalls && existingWalls.length > 0) {
                setValidationErrors(["This URL slug is already taken. Please choose another one."]);
                // Automatically switch to settings tab so user can see/fix it
                setActiveTab('settings');
                return;
            }
        }

        setSaving(true);
        setValidationErrors([]);
        setIsPublishing(publish);

        // Calculate total files to upload
        let fileCount = polaroids.filter(p => p.file).length;
        if (wall.final_image_file) fileCount++;

        // Initialize progress
        setProgressTotal(fileCount);
        setProgressCurrent(0);

        // Show progress modal immediately
        setShowProgress(true);

        // If there are files, we are uploading, otherwise straight to saving
        if (fileCount > 0) {
            setProgressStatus('uploading');
            setProgressMessage(`Starting upload of ${fileCount} files...`);
        } else {
            setProgressStatus('saving');
            setProgressMessage('Saving wall details...');
        }

        try {
            // Helper to track upload progress
            const trackUpload = async (file: File) => {
                // In a real app we'd use XHR/axios for % progress per file.
                // Here we just count completed files.
                const url = await uploadImageToCloudinary(file);

                setProgressCurrent(prev => {
                    const next = prev + 1;
                    setProgressMessage(`Uploaded ${next} of ${fileCount} files`);
                    return next;
                });
                return url;
            };

            // Upload polaroid images
            const uploadedPolaroids = await Promise.all(
                polaroids.map(async (p) => {
                    if (p.file) {
                        const imageUrl = await trackUpload(p.file);
                        return { ...p, image_url: imageUrl, file: undefined };
                    }
                    return p;
                })
            );

            // Upload final image if new
            let finalImageUrl = wall.final_image_url;
            if (wall.final_image_file) {
                finalImageUrl = await trackUpload(wall.final_image_file);
            }

            // All uploads done, moving to save
            setProgressStatus('saving');
            setProgressMessage('Finalizing your memory wall...');

            // Save wall
            const wallPayload = {
                slug: wall.slug,
                pin_code: wall.pin_code || null,
                title: wall.title,
                letter_content: wall.letter_content,
                final_image_url: finalImageUrl,
                final_message: wall.final_message,
                user_id: user.id,
                is_published: publish,
            };

            let wallId = id;

            if (id) {
                await supabase.from('walls').update(wallPayload).eq('id', id);
            } else {
                const { data, error } = await supabase
                    .from('walls')
                    .insert(wallPayload)
                    .select()
                    .single();

                if (error) throw error;
                wallId = data.id;
            }

            // Save polaroids
            if (wallId) {
                await supabase.from('polaroids').delete().eq('wall_id', wallId);

                const polaroidPayload = uploadedPolaroids
                    .map((p, index) => ({ p, index })) // Keep original index
                    .filter(({ p }) => p.image_url) // Only save those with images
                    .map(({ p, index }, i) => {
                        // Exact positions and rotations from demo data
                        const demoLayout = [
                            { x: '8%', y: '15%', rotation: -8, zIndex: 2 },
                            { x: '65%', y: '8%', rotation: 5, zIndex: 3 },
                            { x: '35%', y: '5%', rotation: -3, zIndex: 1 },
                            { x: '12%', y: '55%', rotation: 7, zIndex: 4 },
                            { x: '55%', y: '45%', rotation: -6, zIndex: 2 },
                            { x: '78%', y: '50%', rotation: 4, zIndex: 5 },
                            { x: '40%', y: '60%', rotation: -10, zIndex: 3 },
                            { x: '25%', y: '35%', rotation: 2, zIndex: 6 },
                        ];
                        const layout = demoLayout[i % demoLayout.length];

                        return {
                            wall_id: wallId,
                            image_url: p.image_url,
                            message: p.message,
                            position: index,
                            rotation: layout.rotation,
                            position_x: layout.x,
                            position_y: layout.y,
                            z_index: layout.zIndex,
                        };
                    });

                if (polaroidPayload.length > 0) {
                    await supabase.from('polaroids').insert(polaroidPayload);
                }
            }

            setProgressStatus('success');
            // We don't navigate automatically anymore, let user click the button in modal
        } catch (error: any) {
            console.error('Error saving wall:', error);
            setProgressStatus('error');

            let message = 'Failed to save. Please try again.';
            if (typeof error === 'object' && error?.message) {
                if (error.message.includes('walls_slug_key') || error.message.includes('duplicate key')) {
                    message = 'This URL slug is already taken. Please choose another one in the Settings tab.';
                } else {
                    message = error.message;
                }
            }
            setProgressMessage(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-paper">
                <div className="animate-pulse text-ink/60 font-serif text-xl">Loading...</div>
            </div>
        );
    }

    const uploadedCount = getUploadedPolaroids().length;

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
                <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="font-hand text-3xl text-ink">{id ? 'Edit Wall' : 'Create Your Wall'}</h1>
                    </div>
                    <Link to="/dashboard" className="text-ink/60 hover:text-ink font-serif self-start md:self-auto">
                        ← Back
                    </Link>
                </div>

                {/* Tabs with validation indicators */}
                <div className="flex flex-wrap gap-2 mb-6 pb-2 justify-center md:justify-start">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setValidationErrors([]);
                                setActiveTab(tab);
                            }}
                            className={`px-4 py-2 rounded-full font-serif text-sm capitalize whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab
                                ? 'bg-pink-500 text-white'
                                : 'bg-white/70 text-ink/70 hover:bg-white'
                                }`}
                        >
                            {tab === 'polaroids' ? <><Camera className="w-4 h-4" /> Polaroids</> :
                                tab === 'letter' ? <><Mail className="w-4 h-4" /> Letter</> :
                                    tab === 'final' ? <><Gift className="w-4 h-4" /> Final</> : <><Settings className="w-4 h-4" /> Settings</>}
                            {isSectionValid(tab) && (
                                <Check className="w-4 h-4 text-green-500" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
                        <ul className="list-disc list-inside text-sm">
                            {validationErrors.map((error, i) => (
                                <li key={i}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6"
                >
                    {activeTab === 'polaroids' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <p className="text-ink/60 font-serif text-sm">
                                    Upload 3-8 photos with messages for each polaroid.
                                </p>
                                <span className={`text-sm font-serif ${uploadedCount >= 3 && uploadedCount <= 8 ? 'text-green-600' : 'text-orange-500'}`}>
                                    {uploadedCount}/8 uploaded {uploadedCount < 3 && `(need ${3 - uploadedCount} more)`}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {polaroids.map((p, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative border-2 border-dashed border-pink-200">
                                            {p.image_url ? (
                                                <>
                                                    <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleRemoveImage(index);
                                                        }}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-lg z-20 hover:bg-red-600 transition-all"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                    <label className="absolute inset-0 cursor-pointer z-10">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(index, e.target.files[0])}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </>
                                            ) : (
                                                <label className="w-full h-full flex items-center justify-center text-pink-300 cursor-pointer hover:bg-pink-50 transition-colors">
                                                    <Upload className="w-8 h-8" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files?.[0] && handleImageUpload(index, e.target.files[0])}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder={p.image_url ? "Message (required)" : "Message..."}
                                            value={p.message}
                                            onChange={(e) => handlePolaroidChange(index, 'message', e.target.value)}
                                            className={`w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-pink-300 ${p.image_url && !p.message.trim()
                                                ? 'border-red-300 bg-red-50'
                                                : 'border-pink-200'
                                                }`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'letter' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-ink/60 font-serif text-sm">Write your heartfelt letter. It will be typed out character by character.</p>
                                <span className={`text-sm font-serif ${wall.letter_content.length >= 20 ? 'text-green-600' : 'text-orange-500'}`}>
                                    {wall.letter_content.length} chars
                                </span>
                            </div>
                            <textarea
                                value={wall.letter_content}
                                onChange={(e) => setWall({ ...wall, letter_content: e.target.value })}
                                placeholder="Dear [Name],&#10;&#10;Write your letter here..."
                                className="w-full h-96 px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 font-serif resize-none"
                            />
                        </div>
                    )}

                    {activeTab === 'final' && (
                        <div className="space-y-6">
                            <p className="text-ink/60 font-serif text-sm">Upload the final reveal image and message.</p>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <label className="block text-ink/80 font-serif mb-2">Final Image *</label>
                                    <div className={`aspect-video bg-gray-100 rounded-lg overflow-hidden relative border-2 border-dashed ${wall.final_image_url ? 'border-pink-200' : 'border-red-300'}`}>
                                        {wall.final_image_url ? (
                                            <>
                                                <img src={wall.final_image_url} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setWall({ ...wall, final_image_url: '', final_image_file: undefined });
                                                    }}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-lg z-20 hover:bg-red-600 transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-pink-300">
                                                <Upload className="w-8 h-8" />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setWall({
                                                        ...wall,
                                                        final_image_url: URL.createObjectURL(file),
                                                        final_image_file: file
                                                    });
                                                }
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-ink/80 font-serif mb-2">Final Message *</label>
                                    <input
                                        type="text"
                                        value={wall.final_message}
                                        onChange={(e) => setWall({ ...wall, final_message: e.target.value })}
                                        placeholder="e.g. I love you so much!"
                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 ${!wall.final_message.trim() ? 'border-red-300' : 'border-pink-200'
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-ink/80 font-serif mb-2">Wall Title *</label>
                                <input
                                    type="text"
                                    value={wall.title}
                                    onChange={(e) => setWall({ ...wall, title: e.target.value })}
                                    placeholder="My Memory Wall"
                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 ${!wall.title.trim() ? 'border-red-300' : 'border-pink-200'
                                        }`}
                                />
                            </div>
                            <div>
                                <label className="block text-ink/80 font-serif mb-2">URL Slug *</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-ink/60">/w/</span>
                                    <input
                                        type="text"
                                        value={wall.slug}
                                        placeholder="lovely-memories-abc"
                                        onChange={(e) => setWall({ ...wall, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                        className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 ${!wall.slug.trim() ? 'border-red-300' : 'border-pink-200'
                                            }`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-ink/80 font-serif mb-2">PIN Code (4-6 digits)</label>
                                <input
                                    type="text"
                                    value={wall.pin_code}
                                    onChange={(e) => setWall({ ...wall, pin_code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                    placeholder="1234"
                                    maxLength={6}
                                    className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
                                />
                                <p className="text-ink/40 text-sm mt-1">Leave empty for no protection.</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="flex-1 py-3 bg-white/80 text-ink border border-pink-200 rounded-full font-serif shadow hover:bg-white transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>

                    {isLastTab() && isAllSectionsComplete() ? (
                        <button
                            onClick={() => handleSave(true)}
                            disabled={saving}
                            className="flex-1 py-3 bg-pink-500 text-white rounded-full font-serif shadow-lg hover:bg-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? 'Publishing...' : <><Sparkles className="w-4 h-4" /> Publish</>}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={saving}
                            className="flex-1 py-3 bg-pink-500 text-white rounded-full font-serif shadow-lg hover:bg-pink-600 transition-all disabled:opacity-50"
                        >
                            Next →
                        </button>
                    )}
                </div>
            </div>
            <Footer />

            <ProgressModal
                isOpen={showProgress}
                status={progressStatus}
                currentStep={progressCurrent}
                totalSteps={progressTotal}
                message={progressMessage}
                onClose={() => setShowProgress(false)}
                onNavigate={() => navigate('/dashboard')}
                isPublishing={isPublishing}
            />
        </main>
    );
};

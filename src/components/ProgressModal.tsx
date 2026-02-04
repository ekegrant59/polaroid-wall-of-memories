import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, AlertCircle, Heart } from 'lucide-react';

export type ProgressStatus = 'idle' | 'loading' | 'uploading' | 'saving' | 'success' | 'error';

interface Props {
    isOpen: boolean;
    status: ProgressStatus;
    currentStep: number;
    totalSteps: number;
    message: string;
    onClose: () => void;
    onNavigate: () => void;
    isPublishing?: boolean;
}

export const ProgressModal = ({
    isOpen,
    status,
    currentStep,
    totalSteps,
    message,
    onClose,
    onNavigate,
    isPublishing = false
}: Props) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={status === 'error' ? onClose : undefined}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative z-10 text-center"
                    >
                        {status === 'loading' || status === 'uploading' || status === 'saving' ? (
                            <div className="flex flex-col items-center py-6">
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 rounded-full border-4 border-pink-100 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                                    </div>
                                    {status === 'uploading' && totalSteps > 0 && (
                                        <div className="absolute -bottom-2 bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            {Math.round((currentStep / totalSteps) * 100)}%
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-hand text-2xl text-ink mb-2">
                                    {status === 'uploading' ? 'Uploading Memories...' : 'Saving Wall...'}
                                </h3>
                                <p className="text-ink/60 font-serif text-sm px-4">
                                    {message}
                                </p>
                            </div>
                        ) : status === 'success' ? (
                            <div className="flex flex-col items-center py-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-500">
                                    {isPublishing ? <Heart className="w-8 h-8 fill-current" /> : <Check className="w-8 h-8" />}
                                </div>
                                <h3 className="font-hand text-2xl text-ink mb-2">
                                    {isPublishing ? 'Published with Love!' : 'Draft Saved'}
                                </h3>
                                <p className="text-ink/60 font-serif text-sm mb-8 px-2">
                                    {isPublishing
                                        ? 'Your memory wall is ready to share with your special someone.'
                                        : 'Your changes have been saved securely.'}
                                </p>
                                <button
                                    onClick={onNavigate}
                                    className="w-full py-3 bg-pink-500 text-white rounded-full font-serif shadow-lg hover:bg-pink-600 transition-all hover:scale-105"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        ) : status === 'error' ? (
                            <div className="flex flex-col items-center py-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-500">
                                    <AlertCircle className="w-8 h-8" />
                                </div>
                                <h3 className="font-hand text-2xl text-ink mb-2">
                                    Something went wrong
                                </h3>
                                <p className="text-ink/60 font-serif text-sm mb-8">
                                    {message}
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-gray-100 text-ink/70 rounded-full font-serif hover:bg-gray-200 transition-all"
                                >
                                    Close and Try Again
                                </button>
                            </div>
                        ) : null}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Demo data for the landing page demo - uses placeholder images
import type { Polaroid } from './polaroids';

// Using picsum.photos for placeholder images
export const DEMO_POLAROIDS: Polaroid[] = [
    {
        id: 'demo-1',
        image: 'https://picsum.photos/seed/love1/400/400',
        message: 'Our first date 💕',
        rotation: -8,
        x: '8%',
        y: '15%',
        zIndex: 2,
    },
    {
        id: 'demo-2',
        image: 'https://picsum.photos/seed/love2/400/400',
        message: 'Beach sunset together',
        rotation: 5,
        x: '65%',
        y: '8%',
        zIndex: 3,
    },
    {
        id: 'demo-3',
        image: 'https://picsum.photos/seed/love3/400/400',
        message: 'Cooking adventures!',
        rotation: -3,
        x: '35%',
        y: '5%',
        zIndex: 1,
    },
    {
        id: 'demo-4',
        image: 'https://picsum.photos/seed/love4/400/400',
        message: 'Movie night snuggles',
        rotation: 7,
        x: '12%',
        y: '55%',
        zIndex: 4,
    },
    {
        id: 'demo-5',
        image: 'https://picsum.photos/seed/love5/400/400',
        message: 'Road trip memories',
        rotation: -6,
        x: '55%',
        y: '45%',
        zIndex: 2,
    },
    {
        id: 'demo-6',
        image: 'https://picsum.photos/seed/love6/400/400',
        message: 'Your beautiful smile',
        rotation: 4,
        x: '78%',
        y: '50%',
        zIndex: 5,
    },
    {
        id: 'demo-7',
        image: 'https://picsum.photos/seed/love7/400/400',
        message: 'Dancing in the rain',
        rotation: -10,
        x: '40%',
        y: '60%',
        zIndex: 3,
    },
    {
        id: 'demo-8',
        image: 'https://picsum.photos/seed/love8/400/400',
        message: 'Always & forever ❤️',
        rotation: 2,
        x: '25%',
        y: '35%',
        zIndex: 6,
    },
];

export const DEMO_LETTER_CONTENT = `Dear Love,

This is a demo of what your memory wall could look like!

Imagine filling this with your own heartfelt words...

The story of how you met,
The moments that made you smile,
The reasons they're special to you.

Each polaroid can hold a precious memory,
Each message a piece of your heart.

Create something beautiful for someone you love.

Will you be their Valentine?`;

export const DEMO_FINAL_MESSAGE = 'Create your own memory wall for someone special!';

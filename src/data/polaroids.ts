import demo1 from '../assets/demo/demo1.png';
import demo2 from '../assets/demo/demo2.png';

export interface Polaroid {
    id: string;
    image: string;
    message: string;
    rotation: number;
    x: string; // Tailwind format e.g. 'left-[10%]' or generic percentage
    y: string;
    zIndex: number;
}

// Manually scattered positions - Widened spread (5-80%) to look more scattered
// but ensuring items remain visible on screen
export const POLAROIDS: Polaroid[] = [
    {
        id: 'moment-1',
        image: demo1,
        message: "Sunset kisses on our favorite beach.",
        rotation: -6,
        x: '5%',
        y: '5%',
        zIndex: 1,
    },
    {
        id: 'moment-2',
        image: demo2,
        message: "Coffee dates are the best dates.",
        rotation: 5,
        x: '28%',
        y: '2%',
        zIndex: 2,
    },
    {
        id: 'moment-3',
        image: demo1,
        message: "You make every day brighter.",
        rotation: -4,
        x: '55%',
        y: '6%',
        zIndex: 1,
    },
    {
        id: 'moment-4',
        image: demo2,
        message: "Can't wait for our next adventure.",
        rotation: 8,
        x: '78%',
        y: '4%',
        zIndex: 2,
    },
    {
        id: 'moment-5',
        image: demo2,
        message: "Just thinking about you...",
        rotation: -5,
        x: '8%',
        y: '60%',
        zIndex: 3,
    },
    {
        id: 'moment-6',
        image: demo1,
        message: "My favorite person in the world.",
        rotation: 3,
        x: '32%',
        y: '55%',
        zIndex: 2,
    },
    {
        id: 'moment-7',
        image: demo2,
        message: "Love you to the moon and back.",
        rotation: -8,
        x: '58%',
        y: '62%',
        zIndex: 4,
    },
    {
        id: 'moment-8',
        image: demo1,
        message: "Forever and always.",
        rotation: 6,
        x: '80%',
        y: '50%',
        zIndex: 1,
    },
];

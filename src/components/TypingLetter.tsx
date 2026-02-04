import { useState, useEffect, useRef } from 'react';

const LETTER_CONTENT = `Dear Aurora,
My Sleeping Baby,
Former Fountain Baby,
Always Ashley,
Her Royal Highness,
The Baby Dragon,
And the Legendary Ynash of the World,

Hello.
It’s me again, still here and till very much in love with you after so many decades
I tried to write something normal and mature but I lasted about 30 seconds, but yk I’d last more if I was inside you

Been thinking about how you casually explain that one person somehow became your favorite human without even trying so hard?

Because it’s me that tried hard oh

You did that thing you always do where you exist, laugh a little, shake ynash a bit, say something random, and suddenly my entire day is better. 

Somewhere between your naps, your cuteness, and the way you make everything feel softer, just like your body, and I realized that i’m finished.

You make regular days feel special for no reason.
You make me laugh when I didn’t plan to.
You make being with you feel easy, fun, and somehow still exciting.
You’re always there for me even when I don’t expect it.

So here I am, once again, choosing you.
Choosing us.
Choosing whatever this beautiful, funny, chaotic thing we have going on is.
Not just for Valentine’s Day.
But for random Tuesdays.
For sleepy mornings.
For horny afternoons.
For high nights.
For inside jokes that make zero sense to anyone else.
For the future moments we haven’t embarrassed ourselves in yet.
For future places we haven’t been to yet
With love in my heart, confidence in my spirit, and joy in places I will not be explaining today (my penis)
I guess what I’m really saying is...

Will you be my Valentine?`;

interface Props {
    onComplete: () => void;
    content?: string;
}

export const TypingLetter = ({ onComplete, content }: Props) => {
    const letterText = content || LETTER_CONTENT;
    const [visibleText, setVisibleText] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const hasCompletedRef = useRef(false);
    const onCompleteRef = useRef(onComplete);

    // Keep onComplete ref updated
    onCompleteRef.current = onComplete;

    useEffect(() => {
        // Prevent re-running if already completed
        if (hasCompletedRef.current) return;

        let i = 0;
        // Typing speed logic
        const typeCharacter = () => {
            if (i > letterText.length) {
                if (!hasCompletedRef.current) {
                    hasCompletedRef.current = true;
                    onCompleteRef.current();
                }
                return;
            }

            setVisibleText(letterText.slice(0, i));

            // Auto scroll to bottom
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

            const char = letterText[i];
            let delay = 50; // default typing speed

            // Calculate progress to determine if we are in the final lines
            // The final lines start around index ~320 (rough estimate check) based on string length
            // Or simpler: check if we are in the last chunk of text
            const remaining = letterText.length - i;

            // Slow down significantly for last 2 lines (~ last 60 chars)
            if (remaining < 60) {
                delay = 150; // Much slower
            }

            // Pause on punctuation for realism
            if (char === '.') delay += 400;
            else if (char === ',') delay += 200;
            else if (char === '\n') delay += 600;

            i++;
            setTimeout(typeCharacter, delay);
        };

        const startDelay = setTimeout(typeCharacter, 1000); // Wait a second before starting
        return () => clearTimeout(startDelay);
    }, []); // Empty dependency array - run only once

    return (
        <div className="font-hand text-2xl md:text-3xl leading-relaxed text-ink/80 whitespace-pre-wrap max-w-2xl mx-auto pb-4">
            {visibleText}
            <span className="animate-pulse">|</span>
            <div ref={bottomRef} />
        </div>
    );
};

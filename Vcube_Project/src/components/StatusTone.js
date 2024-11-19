
export const PlaySound = (type) => {
    const audio = new Audio(type === 'success' ? '/images/success-tone.mp3' : '/images/error-tone.mp3');
    audio.play().catch((error) => console.error("Error playing sound:", error));
};
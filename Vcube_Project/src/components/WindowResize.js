import React, { lazy, useEffect, useState } from 'react';
const SmallWindowPage = lazy(() => import('./SmallWindowPage'));

export const WindowResize = ({ children }) => {
    const [screenSizeOk, setScreenSizeOk] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setScreenSizeOk(window.innerWidth >= 888 && window.innerHeight >= 555);
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return screenSizeOk ? children : <SmallWindowPage />;
};

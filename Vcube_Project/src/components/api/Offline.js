import React, { useEffect, useState } from 'react';
import OfflinePage from '../OfflinePage';

export const OfflineProvider = ({ children }) => {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => setIsOffline(false);

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    return !isOffline ? children : <OfflinePage />;
};

export default OfflineProvider;

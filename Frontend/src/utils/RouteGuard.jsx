import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const RouteGuard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const session = localStorage.getItem('jwt_auth');
        if (session) {
            const token = JSON.parse(session);
            const now = Date.now() / 1000; // Current time in seconds
            const isTokenExpiringSoon = token.exp - now < 300; // Check if token expires in less than 5 minutes

            if (isTokenExpiringSoon) {
                // Refresh token logic
                fetch('/api/refresh-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token.accessToken}`,
                    },
                })
                    .then((response) => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Failed to refresh token');
                        }
                    })
                    .then((data) => {
                        localStorage.setItem('jwt_auth', JSON.stringify(data));
                    })
                    .catch(() => {
                        localStorage.removeItem('jwt_auth');
                        navigate('/login'); // Navigate to login if refresh fails
                    });
            }
        } else {
            navigate('/login'); // Navigate to login if no session exists
        }
    }, [navigate]);

    return <>{/* Protected content goes here */}</>;
};
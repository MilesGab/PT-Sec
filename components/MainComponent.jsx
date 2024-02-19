'use client'
import { Box, Typography } from '@mui/material';
import React from 'react';
import SideBar from './SideBar';
import { useUser } from '../context/UserContext';
import NotificationButton from './Notifications/NotificationButton';

export default function MainComponent({ children }) {
    const [isSidebarOpen, setSidebarOpen] = React.useState(false);
    const { user } = useUser();

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    // Loading screen content
    const LoadingScreen = () => (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: 'white',
            }}
        >
            Loading...
        </Box>
    );

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 7.25,
                width: '100%'
            }}
        >
            <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>
            <Box
                onClick={() => isSidebarOpen && toggleSidebar()}
                sx={{
                    width: '100%',
                    backgroundColor: 'white',
                }}
            >
                {user === null ? <LoadingScreen /> : children}
            </Box>
        </Box>
    );
}

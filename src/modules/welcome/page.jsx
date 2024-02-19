'use client'
import { Box, Divider, Typography } from '@mui/material';
import React from 'react';
import Dashboard from './components/dashboard';
import CalendarPanel from './components/calendar';
import { useUser } from '../../../context/UserContext';
import UserPage from '../users/page';
import NotificationButton from '../../../components/Notifications/NotificationButton';

function WelcomePage(){

    const { userData } = useUser();

    return (
        <Box sx={{ width: '100%', height: '100vh', background: '#f5f5f5', padding: 4, px: 8, display: 'flex', gap: 8 }}>
            {userData?.role === 2 ? (
                <>
                    <Dashboard />
                    <Divider orientation="vertical" flexItem />
                    <CalendarPanel />
                </>
            ) : userData?.role === 3 ? (
                <>
                    <Dashboard />
                    <Divider orientation="vertical" flexItem />
                    <CalendarPanel />
                </>
            ) : (
                <>
                </>
            )}
            <Box sx={{position:'absolute', right: 100, bottom: 60}}>
                <NotificationButton/>
            </Box>
        </Box>
    );
}

export default WelcomePage;
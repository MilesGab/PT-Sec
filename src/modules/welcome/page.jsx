'use client'
import { Box, Divider, Typography } from '@mui/material';
import React from 'react';
import Dashboard from './components/dashboard';
import CalendarPanel from './components/calendar';

function WelcomePage(){
    return(
        <Box sx={{width: '100%', height: '100vh', background: '#f5f5f5', padding: 4, px: 8, display:'flex', gap: 2}}>
            <Dashboard/>
            <Divider orientation="vertical" flexItem />
            <CalendarPanel/>
        </Box>
    )
}

export default WelcomePage;
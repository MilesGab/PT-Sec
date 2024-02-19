'use client'
import { Box, Divider, Typography } from '@mui/material';
import React, { useState } from 'react';
import ProfilePanel from './components/profile';
import DetailsPanel from './components/details';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('My Profile');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const tabStyle = (tabName) => ({
        fontWeight: activeTab === tabName ? 'bold' : 'normal',
        cursor: 'pointer',
        '&:hover': {
            fontWeight:'500',
        },
    });

    return (
        <Box sx={{width: '100%', height: '100vh', background: '#f5f5f5', padding: 4, px: 8, display:'flex', gap: 8}}>
            <Box sx={{display:'flex', flexDirection:'column', gap:1}}>
                <Typography sx={tabStyle('My Profile')} onClick={() => handleTabClick('My Profile')}>
                    My Profile
                </Typography>
                <Typography sx={tabStyle('Account Details')} onClick={() => handleTabClick('Account Details')}>
                    Account Details
                </Typography>
                <Typography sx={tabStyle('Security')} onClick={() => handleTabClick('Security')}>
                    Security
                </Typography>
            </Box>
            <Divider orientation='vertical'/>
            <Box sx={{flexGrow: 1}}>
                {activeTab === 'My Profile' && (
                    <Box>
                        <Typography variant="h6">My Profile Content</Typography>
                        <ProfilePanel/>
                    </Box>
                )}
                {activeTab === 'Account Details' && (
                    <Box>
                        <Typography variant="h6">Account Details</Typography>
                        <DetailsPanel/>
                    </Box>
                )}
                {activeTab === 'Security' && (
                    <Box>
                        <Typography variant="h6">Security Settings</Typography>
                        {/* Add content for Security tab here */}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

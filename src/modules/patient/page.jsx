'use client'
import React from 'react';
import { Box, Divider, Typography } from '@mui/material';
import { useRouter, useSearchParams  } from 'next/navigation';
import ProfilePanel from '../settings/components/profile';
import DetailsPanel from '../settings/components/details';
import PatientProfilePanel from './components/profile';
import PatientDetailsPanel from './components/details';


function PatientInfoPage(){
    const router = useRouter();
    const searchParams = useSearchParams()
    const id = searchParams.get('id')

    const [activeTab, setActiveTab] = React.useState('My Profile');

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
        <Box sx={{width: '100%', height:'100vh', background: '#f5f5f5', padding: 4, px: 8, display:'flex', gap: 8}}>
            <Box sx={{display:'flex', flexDirection:'column', gap:1}}>
                <Typography sx={tabStyle('My Profile')} onClick={() => handleTabClick('My Profile')}>
                    Profile
                </Typography>
                <Typography sx={tabStyle('Account Details')} onClick={() => handleTabClick('Account Details')}>
                    Submissions
                </Typography>
                {/* <Typography sx={tabStyle('Security')} onClick={() => handleTabClick('Security')}>
                    History
                </Typography> */}
            </Box>
            <Divider orientation='vertical'/>
            <Box sx={{flexGrow: 1}}>
                {activeTab === 'My Profile' && (
                    <Box>
                        <PatientProfilePanel id={id}/>
                    </Box>
                )}
                {activeTab === 'Account Details' && (
                    <Box>
                        <PatientDetailsPanel id={id}/>
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

export default PatientInfoPage;
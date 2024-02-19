'use client'
import React from 'react';
import DataTable from './components/datatable';
import { Box, Typography } from '@mui/material';
import { useUser } from '../../../context/UserContext';
import UserPage from '../users/page';

function PatientPage(){

    const { userData } = useUser();

    return(
        <Box sx={{width: '100%', height: '100vh', background: '#f5f5f5', padding: 4, px: 8, display:'flex', flexDirection:'column',  gap: 2}}>
            <Typography sx={{fontSize: 20, fontWeight: 'bold'}}>{userData?.role === 3 ? 'Users' : 'Patients'}</Typography>
            {userData?.role === 2 ? (
                <DataTable/>
            ): (
                <UserPage/>
            )}
        </Box>
    )

}

export default PatientPage;
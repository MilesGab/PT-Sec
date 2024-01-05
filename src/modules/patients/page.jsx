'use client'
import React from 'react';
import DataTable from './components/datatable';
import { Box, Typography } from '@mui/material';

function PatientPage(){

    return(
        <Box sx={{width: '100%', height: '100vh', background: '#f5f5f5', padding: 4, px: 8, display:'flex', flexDirection:'column',  gap: 2}}>
            <Typography sx={{fontSize: 20, fontWeight: 'bold'}}>Patients</Typography>
            <DataTable/>
        </Box>
    )

}

export default PatientPage;
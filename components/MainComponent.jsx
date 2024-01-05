import { Box } from '@mui/material';
import React from 'react';
import SideBar from './SideBar';


export default function MainComponent({ children }){

    return <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 7.25
    }}>
        <SideBar/>
        {children}
    </Box>

}
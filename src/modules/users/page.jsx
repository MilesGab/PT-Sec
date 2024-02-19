'use client'
import React from 'react';
import DataTable from './components/datatable';
import { Box, MenuItem, Select, Typography } from '@mui/material';
import { useUser } from '../../../context/UserContext';
import ClinicTable from './components/clinictable';

function UserPage(){

    const { userData } = useUser();
    const [filter, setFilter] = React.useState('users');

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    }

    return(
        <Box sx={{width: '100%', background: '#f5f5f5', px: 8, display:'flex', flexDirection:'column',  gap: 2}}>
            <Select
                value={filter}
                onChange={handleFilterChange}
                sx={{ mb: 2, width: '20%' }}
            >   
                <MenuItem value="users">Users</MenuItem>
                <MenuItem value="clinics">Clinics</MenuItem>
            </Select>
            {filter === 'users' ? (<DataTable/>) : (<ClinicTable/>)}
        </Box>
    )

}

export default UserPage;
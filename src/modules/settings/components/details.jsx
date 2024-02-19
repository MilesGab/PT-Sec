import React from 'react';
import { Box, Typography } from '@mui/material';
import { useUser } from '../../../../context/UserContext';

const RoleMap = {
    0: 'Patient',
    1: 'Doctor',
    2: 'Secretary',
    3: 'Admin'
};


function DetailsPanel(){

    const { userData } = useUser();

    return(
        <Box sx={{py: 2}}>
            <Box sx={{mb: 2}}>
                <Typography sx={{fontWeight:'bold'}}>Name</Typography>
                <Typography>{userData?.firstName} {userData?.lastName}</Typography>
            </Box>
            <Box sx={{mb: 2}}>
                <Typography sx={{fontWeight:'bold'}}>Contact</Typography>
                <Typography>{userData?.contact}</Typography>
            </Box>
            <Box sx={{mb: 2}}>
                <Typography sx={{fontWeight:'bold'}}>Email</Typography>
                <Typography>{userData?.email}</Typography>
            </Box>
            <Box sx={{mb: 2}}>
                <Typography sx={{fontWeight:'bold'}}>Role</Typography>
                <Typography>{RoleMap[userData?.role]}</Typography>
            </Box>
        </Box>
    )

}

export default DetailsPanel;
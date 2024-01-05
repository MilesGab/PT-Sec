import { Box, Typography } from '@mui/material';
import React from 'react';

function CalendarPanel(){

    return(
        <Box>
            <Typography sx={{fontSize: 32}}>Calendar</Typography>
            <Typography sx={{fontSize: 32, fontWeight: 'bold'}}>Today, Jan 5, Friday</Typography>
        </Box>
    )

}

export default CalendarPanel;
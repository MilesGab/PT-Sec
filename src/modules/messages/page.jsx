'use client'
import { Box, Typography } from '@mui/material';
import React from 'react';
import Messages from './components/messages';
import ChatList from './components/Chat List/ChatList';

function MessagesPanel(){

    return(
        <Box sx={{width: '100%', height:'100vh', background: '#f5f5f5', display:'flex', gap: 8}}>
            <ChatList/>
        </Box>
    )

}

export default MessagesPanel;
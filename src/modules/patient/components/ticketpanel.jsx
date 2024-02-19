import { db } from '@/app/firebaseConfig';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React from 'react';

import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import ArticleIcon from '@mui/icons-material/Article';
import { CloseRounded } from '@mui/icons-material';

async function getTicketDetails(id) {
    const ticketsRef = collection(db, 'uploadedDocuments');
    const q = query(ticketsRef, where('ticket', '==', id));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        return querySnapshot.docs.map(doc => doc.data());
    }
    return [];
}

async function getTicketInfo(id) {
    const ticketsRef = doc(db, 'tickets', id);

    try {
        const docSnapshot = await getDoc(ticketsRef);

        if (docSnapshot.exists()) {
            return docSnapshot.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting document:', error);
        return null;
    }
}

function TicketPanel({ open, setClose, ticketId }){

    const [isVisible, setVisibility] = React.useState(false);
    const [ticketDetails, setTicketDetails] = React.useState([]);
    const [ticketInfo, setTicketInfo] = React.useState(null);


    React.useEffect(() => {
        if (ticketId) {
            getTicketDetails(ticketId)
                .then(data => setTicketDetails(data))
                .catch(error => console.error('Error fetching ticket details:', error));
        }
    }, [ticketId]);

    React.useEffect(() => {
        if (ticketId) {
            getTicketInfo(ticketId)
                .then(data => setTicketInfo(data))
                .catch(error => console.error('Error fetching ticket info:', error));
        }
    }, [ticketId]);

    return (
        <Paper sx={{
            position: 'absolute', 
            height: '80vh', 
            background: '#fff',
            right: 0,
            px: 2,
            py: 4,
            display: open ? 'flex' : 'none',
            transition: 'width .3s ease-in-out'
        }}>
            <Box>
                <Box sx={{display: 'flex', alignItems:'center'}}>
                    <Typography sx={{flex: 1}}><span style={{ fontWeight: 'bold' }}>Submission:</span> #{ticketId}</Typography>
                    <IconButton onClick={setClose}>
                        <CloseRounded/>
                    </IconButton>
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 'bold' }}>Tasks: {ticketInfo?.name || '---'}</Typography>
                </Box>

                <Box>
                {ticketDetails.length > 0 ? (
                    <>
                    <Typography>Uploaded File:</Typography>
                    {ticketDetails.map((detail, index) => (
                        <Box key={index}>
                            <Box sx={{
                                background: '#f5f5f5',
                                px: 2,
                                py: 2,
                                borderRadius: 4,
                                display: 'flex',
                                mb: 2
                            }}>
                                {detail?.type === 'img' ? (<InsertPhotoIcon />) : (<ArticleIcon />)}
                                <Typography>{detail?.file_name}</Typography>
                            </Box>
                        </Box>
                    ))}
                    </>
                ) : (
                    <Typography>User has not uploaded anything yet</Typography>
                )}
                </Box>
            </Box>
        </Paper>
    );
    

}

export default TicketPanel;
import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, Paper, Divider, Button } from '@mui/material';
import { useUser } from '../../../../context/UserContext';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import dayjs from 'dayjs';
import TicketPanel from './ticketpanel';

async function fetchTickets(patientId) {
    const ticketsRef = collection(db, 'tickets');
    const q = query(ticketsRef, where('patient', '==', patientId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
}

async function handleComplete(ticketId) {
    const confirmUpdate = window.confirm("Are you sure you want to mark this ticket as complete?");
    if (!confirmUpdate) {
        return; // Stop the function if the user cancels the confirmation
    }

    try {
        const ticketRef = doc(db, 'tickets', ticketId);
        await updateDoc(ticketRef, {
            status: 'complete'
        });

        // Optionally, refresh the list or display a success message
        alert("Ticket marked as complete.");
    } catch (error) {
        console.error('Error updating ticket:', error);
        alert("Failed to update the ticket.");
    }
}


function PatientDetailsPanel({ id }) {
    const { userData } = useUser();
    const [list, setList] = useState ([]);
    const [selectedId, setSelectedId] = useState('');
    const [isVisible, setVisibility] = useState(false);

    const handleOpen = (id) => {
        setSelectedId(id);
        setVisibility(true);
    }

    const handleClose = () => setVisibility(false);

    useEffect(() => {
        let unsubscribe;

        if (id) {
            const ticketsRef = collection(db, 'tickets');
            const q = query(ticketsRef, where('patient', '==', id));

            unsubscribe = onSnapshot(q, (querySnapshot) => {
                const tickets = querySnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                }));
                setList(tickets);
            }, error => {
                console.error('Error fetching tickets:', error);
            });
        }

        return () => unsubscribe && unsubscribe();
    }, [id]);

    const renderTicketName = (name) => {
        if (Array.isArray(name)) {
            return name.map((item, index) => (
                <React.Fragment key={index}>
                    {item}
                    <br />
                </React.Fragment>
            ));
        }
        return name;
    };

    function formatDate(timestamp) {
        if (!timestamp) {
            return 'Null';
        }
    
        // Convert Firestore timestamp to JavaScript Date object
        const date = timestamp.toDate();
    
        // Format the date as you need, e.g., 'MM/dd/yyyy'
        return dayjs(date).format('MM/DD/YYYY');
    }

    return (
        <Box sx={{ py: 2 }}>
            <TicketPanel open={isVisible} setClose={handleClose} ticketId={selectedId} />
            <Typography variant="h6">Submissions</Typography>
            <List>
                {list.map(ticket => (
                    <ListItem key={ticket.id}>
                        <Paper sx={{px: 2, py: 2, width: 'auto', display:'flex', alignItems:'center', gap: 2}}>
                        {ticket?.status === 'ongoing' ? <AutorenewIcon sx={{fontSize: 40}}/> : <CheckRoundedIcon sx={{fontSize: 40}}/>}
                            <Box sx={{flexDirection:'column', flex: 1}}>
                                <Box sx={{display:'flex', flexDirection:'row', gap: 4}}> 
                                    <Typography sx={{flex: 1}}>Status: {ticket.status}</Typography>
                                    <Typography sx={{}}>Created: {formatDate(ticket.createdAt)}</Typography>
                                </Box>
                                <Divider sx={{my: 2}}/>
                                <Box sx={{display:'column'}}>
                                    <Typography sx={{flex: 1, fontWeight:'bold'}}>{renderTicketName(ticket.name)}</Typography>
                                    <Button onClick={()=>handleOpen(ticket.id)} variant="contained" sx={{mt: 2, mr: 2}}>View Ticket</Button>
                                    {ticket?.status === 'ongoing' && (
                                    <Button onClick={()=>handleComplete(ticket.id)} variant="contained" sx={{mt: 2}}>Mark As Complete</Button>
                                    )}
                                </Box>
                            </Box>
                        </Paper>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default PatientDetailsPanel;

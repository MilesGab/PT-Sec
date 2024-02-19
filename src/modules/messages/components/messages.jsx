import React from 'react';

import { Box, IconButton, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { useUser } from '../../../../context/UserContext';
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';

import { useRouter, useSearchParams } from 'next/navigation';

import SendIcon from '@mui/icons-material/Send';
import dayjs from 'dayjs';

function formatDate(timestamp) {
    if (!timestamp) {
        return 'Null';
    }
    const date = timestamp.toDate();
    return dayjs(date).format('H:mm');
}

async function fetchDoctorInfo(id){
    const docRef = doc(db, 'users', id);
    const docSnapshot = await getDoc(docRef);
    const docData = docSnapshot.data();

    return docData;
}

async function updateNotifStatus(sender_id, recipient_id) {
    const messagesRef = collection(db, 'notifications');
    const q = query(messagesRef, 
        where('sender_id', '==', sender_id),
        where('recipient_id', '==', recipient_id),
        where('type', '==', 'message'),
        where('status', '==', 'unread')
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.forEach((docSnapshot) => {
        const docRef = doc(db, 'notifications', docSnapshot.id);
        batch.update(docRef, { status: 'read' });
    });

    await batch.commit();
}

function Messages({ patientDataProp  }) {
    const { userData } = useUser();
    const [text, setText] = React.useState([]);
    const [messages, setMessages] = React.useState([]);
    const [doctorInfo, setDoctorInfo] = React.useState([]);
    const messagesEndRef = React.useRef(null); 
    
    const searchParams = useSearchParams()
    const routerQueryPatientData = searchParams.get('patientData')
    const patientData = patientDataProp || routerQueryPatientData;

    React.useEffect(() => {
        if (patientData && userData) {
            updateNotifStatus(patientData, userData.uid).catch(console.error);
        }
    }, [patientData, userData]);

    React.useEffect(()=>{
        if(patientData){
            const getDoc = async () =>{
                try{
                    const doctorInfo = await fetchDoctorInfo(patientData);
                    setDoctorInfo(doctorInfo);
                } catch(e){
                    console.error('Error fetchin doctor: ', e);
                }
            }
            getDoc();
        }
    },[patientData]);

    React.useEffect(() => {
        const currentUserID = userData?.uid;
        const doctorID = userData?.doctor;

        // Check if currentUserID and doctorID are not null
        if (currentUserID && patientData) {
            const messagesRef = collection(db, 'messages');
            const q = query(messagesRef, 
                where('user._id', 'in', [currentUserID, patientData]),
                where('sendTo', 'in', [currentUserID, patientData]),
                orderBy('createdAt')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const messagesArray = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    _id: doc.id,
                }));
                setMessages(messagesArray);
            }, (error) => {
                console.error("Error fetching messages: ", error);
            });

            // Cleanup subscription on unmount
            return () => unsubscribe();
        }
    }, [userData, patientData]); 

    React.useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'instant' });
        }
    }, [messages]); 

    const handleSend = async () => {
        if (!text.trim()) return; 
    
        const messageData = {
            text,
            createdAt: serverTimestamp(),
            user: {
                _id: userData?.uid,
                name: userData?.firstName
            },
            sendTo: patientData,
        };
    
        try {
            await addDoc(collection(db, 'messages'), messageData);
            setText('');
        } catch (error) {
            console.error("Error sending message: ", error);
        }
    };

    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            <Paper sx={{ py: 2, px: 6 }}>
                <Typography sx={{ fontWeight: 'bold', fontSize: 20 }}>
                    {patientData ? (`${doctorInfo.firstName} ${doctorInfo.lastName}`) : ('Pocket Therapist')}
                </Typography>
            </Paper>
            <Box sx={{ overflowY: 'auto', height: '80vh',ml: 12, px: 4, display: 'flex', flexDirection: 'column' }}>
                {messages.map((msg, index) => (
                <Tooltip key={index} title={formatDate(msg.createdAt)} placement="top" arrow>
                    <Box key={index} sx={{
                        mt: 2, px: 2, py: 2,
                        backgroundColor: msg.user._id === userData?.uid ? 'blue' : '#e0e0e0',
                        color: msg.user._id === userData?.uid ? 'white' : '#696969',
                        alignSelf: msg.user._id === userData?.uid ? 'flex-end' : 'flex-start',
                        borderRadius: 8,
                        maxWidth: '45%', // Adjust this as needed
                        wordBreak: 'break-word' // Ensures text wraps within the box
                    }}>
                        <Typography>{msg.text}</Typography>
                    </Box>
                </Tooltip>
                ))}
                <div ref={messagesEndRef} />
            </Box>
            <Box sx={{ background: '#fff', px: 6, py: 4.45, display:'flex'}}>
                <Box sx={{background: 'rgba(0,0,0,0.2)', width: '100%', px: 4, py: 1, borderRadius: 8 }}>
                    <TextField 
                        placeholder='Send a message..'
                        value={text}
                        onChange={(e)=>{setText(e.target.value)}}
                        fullWidth size='small'
                        sx={{
                            '.MuiOutlinedInput-root': {
                                border: 'none',
                                '& fieldset': {
                                    border: 'none'
                                },
                                '&:hover fieldset': {
                                    border: 'none'
                                },
                                '&.Mui-focused fieldset': {
                                    border: 'none'
                                }
                            }
                        }}   
                    >Send a message...</TextField>
                </Box>
                <IconButton onClick={handleSend}>
                    <SendIcon/>
                </IconButton>
            </Box>
        </Box>
    );
    
}

export default Messages;

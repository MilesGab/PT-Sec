import React, { useEffect, useState } from 'react';
import { Box, Button, FormControl, IconButton, MenuItem, Modal, Select, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { db } from '@/app/firebaseConfig';
import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';

const requestTypeMap = {
    'medical_certificate' : 'Medical Certificate',
    'medical_prescription' : 'Medical Prescription',
    'laboratory_request' : 'Laboratory Request'
}

export default function MedRequestCard({ open, setClose, patient }) {


    const [patientName, setPatientName] = useState('');
    const [requestType, setRequestType] = useState('');
    const [email, setEmail] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        setPatientName(patient?.patient_name);
        setRequestType(patient?.type);
        setEmail(patient?.email);
        setNote(patient?.note);
    }, [patient?.patient]);
    
    const boxStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: 2,
        px: 4,
        py: 2,
    };

    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    const handleComplete = async () => {
        try {
            const reqRef = doc(db, "medDocuRequest", patient.id);
            await updateDoc(reqRef, {
                status: 'complete',
                approvedAt: serverTimestamp()
            });
            // Additional logic after successfully marking the request as complete
            // For example, you might want to close the modal or show a success message
            setClose(); // This will close the modal
        } catch (e) {
            console.error("Failed to mark as complete:", e);
        }
    };
    const handleReject = async () => {
        try{
            const reqRef = doc(db, "medDocuRequest", patient.id);
            await updateDoc(reqRef, {
                status: 'rejected',
                rejectedAt: serverTimestamp()
            });
            setClose();
        } catch (e) {
        }
    };

    return (
        <Modal
            open={open}
            onClose={setClose}
        >
            <Box sx={boxStyle} onClick={handleContentClick}>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Typography sx={{flex: 1, fontSize: '20px', fontWeight:'bold'}}>Request Information</Typography>
                    <IconButton onClick={setClose}>
                        <CloseRoundedIcon/>
                    </IconButton>
                </Box>
                <Box sx={{display: 'flex', flexDirection:'column', mb: 4}}>
                    <Typography><span style={{fontWeight:'bold'}}>From: </span> {patientName}</Typography>
                    <Typography><span style={{fontWeight:'bold'}}>Request: </span> {requestTypeMap[requestType]}</Typography>
                    
                    <Box sx={{display:'flex', gap:2, my: 4, alignItems:'center'}}>
                        <Typography sx={{fontWeight:'bold'}}>Send to: </Typography>
                        <Box sx={{borderWidth: 1, borderColor: '#696969', background: 'rgba(0,0,0,0.1)', borderRadius: 1,py: 2, px: 2}}>
                            <Typography>{email}</Typography>
                        </Box>
                    </Box>

                    <Box>
                        <Typography sx={{fontWeight:'bold'}}>Details</Typography>
                        <Box sx={{borderWidth: 1, borderColor: '#696969', background: 'rgba(0,0,0,0.1)', borderRadius: 1,py: 2, px: 2}}>
                            <Typography>{note}</Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{display:'flex', mt: 2, gap: 1, justifyContent:'flex-end'}}>
                    <Button onClick={handleReject} variant="outlined">Reject</Button>
                    <Button onClick={handleComplete} variant="contained">Mark As Complete</Button>
                </Box>
            </Box>
        </Modal>
    );
}

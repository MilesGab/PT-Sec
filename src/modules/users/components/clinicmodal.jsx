import React, { useState } from 'react';
import { Box, IconButton, Modal, Typography, TextField, Button } from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { addDoc, collection, doc, serverTimestamp, updateDoc} from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';

async function createAccount(accountData) {
    try {
        const userDocRef = await addDoc(collection(db, "clinics"), {
            name: accountData.clinicName,
            contact: accountData.contact,
            email: accountData.email,
            address: accountData.clinicAddress,
            createdAt: serverTimestamp()
        });

        const uid = userDocRef.id;
        await updateDoc(doc(db, "clinics", uid), {
            uid: uid
        });

        return uid;
    } catch (error) {
        console.error("Error creating clinic:", error);
        throw error;
    }
}



export default function ClinicModal({ open, setClose }) {
    const [clinicName, setClinicName] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [clinicAddress, setClinicAddress] = useState('');

    const boxStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: 2,
        p: 4,
    };

    const handleSubmit = async () => {
        const clinicData = {
            clinicName, 
            contact, 
            email, 
            clinicAddress, 
        };
    
        try {
            const docId = await createAccount(clinicData);
            alert('Clinic Added');
            handleClose();
        } catch (error) {
            console.error("Error adding clinic:", error);
            alert('Failed to add clinic');
        }
    };

    const handleClose = () => {
        setClinicName('');
        setEmail('');
        setContact('');
        setClinicAddress('');;

        setClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={boxStyle}>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                    <Typography sx={{flex: 1, fontSize: '20px', fontWeight: 'bold'}}>Add Clinic</Typography>
                    <IconButton onClick={handleClose}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Box>
                <Box component="form" sx={{display: 'flex', flexDirection: 'column', gap:1, justifyContent:'center'}}>
                    <Box sx={{display:'flex', gap: 2}}>
                        <Box sx={{width: '100%'}}>
                            <Typography>Clinic Name</Typography>
                            <TextField fullWidth variant="outlined" value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
                        </Box>
                    </Box>

                    <Box sx={{display:'flex', gap: 2}}>
                        <Box sx={{width: '50%'}}>
                            <Typography>Email</Typography>
                            <TextField fullWidth variant="outlined" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Box>
                        <Box sx={{width: '50%'}}>
                            <Typography>Contact</Typography>
                            <TextField fullWidth variant="outlined" value={contact} onChange={(e) => setContact(e.target.value)} />
                        </Box>
                    </Box>

                    <Box>
                        <Typography>Clinic Address</Typography>
                        <TextField fullWidth variant="outlined" value={clinicAddress} onChange={(e) => setClinicAddress(e.target.value)} />
                    </Box>

                    <Box sx={{display:'flex', justifyContent:'center'}}>
                        <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2, px: 4, py: 1.25 }}>Submit</Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}

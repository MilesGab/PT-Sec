import React from 'react';
import { Box, Button, FormControl, IconButton, InputLabel, MenuItem, Modal, Select, TextField, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';

async function updateClinic(clinicId, updates) {
    try {
        const clinicDocRef = doc(db, "clinics", clinicId);

        await updateDoc(clinicDocRef, updates);

    } catch (error) {
        console.error("Error updating document: ", error);
    }
}

export default function ClinicEditModal({ open, setClose, patient }) {
    // Initializing useState hooks
    const [clinicName, setClinicName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [contact, setContact] = React.useState('');
    const [address, setAddress] = React.useState('');

    React.useEffect(()=>{
        setClinicName(patient.name);
        setEmail(patient.email);
        setContact(patient.contact);
        setAddress(patient.address);
    },[patient.uid])

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

    const handleConfirm = async () => {
        const isConfirmed = window.confirm("Are you sure you want to update the clinic's information?");
    
        if (isConfirmed) {
            try {
                await updateClinic(patient.uid, {
                    name: clinicName,
                    email: email,
                    contact: contact,
                    address: address
                });
                setClose();
                alert("Clinic information updated successfully.");
            } catch (error) {
                console.error("Error updating clinic:", error);
                alert("Failed to update clinic information.");
            }
        }
    };
    

    return(
        <Modal
            open={open}
            onClose={setClose}        
        >
            <Box sx={boxStyle}>
                <Box sx={{display:'flex', alignItems:'center'}}>
                    <Typography sx={{fontSize: '20px',flex: 1}}>Edit Clinic Information</Typography>
                    <IconButton onClick={setClose}>
                        <CloseRoundedIcon/>
                    </IconButton>
                </Box>
                <Box>
                    <Typography>Clinic Name</Typography>
                    <TextField
                        variant='outlined'
                        fullWidth
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                    />
                    
                    <Typography>Email</Typography>
                    <TextField
                        variant='outlined'
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    
                    <Typography>Contact</Typography>
                    <TextField
                        variant='outlined'
                        fullWidth
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                    />
                    
                    <Typography>Address</Typography>
                    <TextField
                        variant='outlined'
                        fullWidth
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </Box>
                <Box sx={{display:'flex', justifyContent:'flex-end', gap: 1, mt: 2}}>
                    <Button variant='outlined' onClick={setClose}>Cancel</Button>
                    <Button variant='contained' onClick={handleConfirm}>Confirm</Button>
                </Box>
            </Box>
        </Modal>
    );
}

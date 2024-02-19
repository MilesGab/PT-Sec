import React from 'react';
import { Box, Button, FormControl, IconButton, MenuItem, Modal, Select, TextField, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';

export default function TicketCard({ open, setClose, patients }) {

    const [patient, setPatient] = React.useState('');
    const [activity, setActivity] = React.useState('');

    const submitForm = async (patientId, activityName) => {
        try {
            await addDoc(collection(db, "tickets"), {
                createdAt: serverTimestamp(),
                patient: patientId,
                name: activityName,
                status: "ongoing"
            });
            
            alert("Ticket created successfully!");
            setClose();
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Failed to create the ticket.");
        }
    };

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

    const handleChange = (event) => {
        const { name, value } = event.target;
    
        switch (name) {
            case 'patient':
                setPatient(value);
                break;
            case 'activity':
                setActivity(value);
                break;
            default:
                break;
        }
    };

    const filteredPatients = Array.isArray(patients) ? patients.filter(patient => patient.role === 0) : patients;

    return (
        <Modal
            open={open}
            onClose={setClose}
        >
            <Box sx={boxStyle} onClick={handleContentClick}>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Typography sx={{flex: 1, fontSize: '20px', fontWeight:'bold'}}>Create patient submission</Typography>
                    <IconButton onClick={setClose}>
                        <CloseRoundedIcon/>
                    </IconButton>
                </Box>
                <Box sx={{display: 'flex', flexDirection:'column'}}>
                    <Typography>Patient</Typography>
                    <FormControl fullWidth>
                        <Select
                            name="patient"
                            value={patient}
                            onChange={handleChange}
                        >
                            {filteredPatients.map((patient) => (
                                <MenuItem key={patient.id} value={patient.id}>
                                    {`${patient.firstName} ${patient.lastName}` || `---`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography>Activity</Typography>
                    <FormControl fullWidth>
                        <TextField 
                            value={activity}
                            onChange={(e)=>setActivity(e.target.value)}
                        />
                    </FormControl>
                    
                </Box>
                <Box sx={{display:'flex', mt: 2, gap: 1, justifyContent:'flex-end'}}>   
                    <Button onClick={setClose} variant="outlined">Cancel</Button>
                    <Button onClick={() => submitForm(patient, activity)} variant="contained">Create</Button>
                </Box>
            </Box>
        </Modal>
    );
}

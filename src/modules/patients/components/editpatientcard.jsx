import React from 'react';
import { Box, Button, FormControl, IconButton, InputLabel, MenuItem, Modal, Select, TextField, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';

async function getDoctorList(){
    const docSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", 1)));
    let doctors = [];

    docSnapshot.forEach((doc) => {
        const docData = doc.data();
        doctors.push({ id: doc.id, ...docData});
    });

    return doctors;
}

async function updatePatient(patientId, patientData) {
    try {
        const userDocRef = doc(db, "users", patientId);
        await updateDoc(userDocRef, patientData);
    } catch (error) {
        console.error("Error updating document: ", error);
        throw error; // Optional: re-throw error if you want to handle it outside
    }
}

export default function PatientModal({ open, setClose, patient }) {
    const [doctor, setDoctor] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [contact, setContact] = React.useState('');
    const [doctorList, setDoctorList] = React.useState([]);

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

    React.useEffect(() => {
        if (patient) {
            setDoctor(patient.doctor_id);
            setFirstName(patient.firstName);
            setLastName(patient.lastName);
            setEmail(patient.email);
            setContact(patient.contact);
        }
    }, [patient, open]);

    React.useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const doctors = await getDoctorList();
                setDoctorList(doctors);
            } catch (error) {
                console.error('Error fetching doctors:', error);
            }
        };

        fetchDoctors();
    }, [open]);

    const handleChange = (event) => {
        setDoctor(event.target.value);
    };

    const handleConfirm = async () => {
        const patientData = {
            firstName,
            lastName,
            email,
            contact,
            doctor
        };

        try {
            await updatePatient(patient.uid, patientData);
            setClose();
        } catch (error) {
            console.error("Error updating patient info:", error);
            alert("Failed to update patient info");
        }
    };

    return (
        <Modal open={open} onClose={setClose}>
            <Box sx={boxStyle}>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Typography sx={{fontSize: '20px', flex: 1}}>Edit Patient Information</Typography>
                    <IconButton onClick={setClose}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Box>
                <Box>
                    <Typography>First Name</Typography>
                    <TextField
                        variant='outlined'
                        fullWidth
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />

                    <Typography>Last Name</Typography>
                    <TextField
                        variant='outlined'
                        fullWidth
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
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

                    <Typography>Doctor</Typography>
                    <FormControl fullWidth>
                    <Select
                        value={doctor}
                        onChange={handleChange}
                    >
                        {doctorList.map((doctor)=>(
                            <MenuItem key={doctor.id} value={doctor.id}>Dr. {doctor.firstName} {doctor.lastName}</MenuItem>
                        ))}
                    </Select>
                    </FormControl>
                </Box>
                <Box sx={{display:'flex', justifyContent:'flex-end', gap: 1, mt: 2}}>
                    <Button variant='outlined'>Cancel</Button>
                    <Button variant='contained' onClick={handleConfirm}>Confirm</Button>
                </Box>
            </Box>
        </Modal>
    )

}
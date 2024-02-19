import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, IconButton, MenuItem, Modal, Select, TextField, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';

async function getDoctorList(){
    const docSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", 1)));
    let doctors = [];

    docSnapshot.forEach((doc) => {
        const docData = doc.data();
        doctors.push({ id: doc.id, ...docData });
    });

    return doctors;
}

async function getClinicList(){
    const clinicSnapshot = await getDocs(collection(db, "clinics"));
    let clinics = [];

    clinicSnapshot.forEach((doc) => {
        const clinicData = doc.data();
        clinics.push({ id: doc.id, ...clinicData });
    });

    return clinics;
}

async function updateUser(patientId, updates) {
    try {
        const userDocRef = doc(db, "users", patientId);
        await updateDoc(userDocRef, updates);
    } catch (error) {
        console.error("Error updating document: ", error);
    }
}

export default function PatientModal({ open, setClose, patient }) {
    const [doctor, setDoctor] = useState('');
    const [clinic, setClinic] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [doctorList, setDoctorList] = useState([]);
    const [clinicList, setClinicList] = useState([]);

    useEffect(() => {
        if (patient) {
            setDoctor(patient.doctor_id || '');
            setClinic(patient.clinic_id || '');
            setFirstName(patient.firstName || '');
            setLastName(patient.lastName || '');
            setEmail(patient.email || '');
            setContact(patient.contact || '');
        }
    }, [patient, open]);
    
    React.useEffect(()=>{
        const fetchDoctors = async() =>{
            try{
                const doctorData = await getDoctorList();
                setDoctorList(doctorData);
            } catch(e){
                console.error('Error Fetching Doctors: ', e);
            }
        }

        fetchDoctors();
    },[open]);

    React.useEffect(() => {
        const fetchClinics = async () => {
            try {
                const clinicData = await getClinicList();
                setClinicList(clinicData);
            } catch (e) {
                console.error('Error Fetching Clinics: ', e);
            }
        };
    
        if (open) {
            fetchClinics();
        }
    }, [open]);

    const handleConfirm = async () => {
        const updates = {
            doctor,
            clinic,
            firstName,
            lastName,
            email,
            contact
        };
    
        try {
            await updateUser(patient.uid, updates);
            setClose();
        } catch (error) {
            console.error("Error updating user:", error);
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
    
    return (
        <Modal open={open} onClose={setClose}>
            <Box sx={boxStyle}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '20px', flex: 1 }}>Edit Patient Information</Typography>
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
    
                    <Typography>Clinic</Typography>
                    <FormControl fullWidth>
                        <Select
                            value={clinic}
                            onChange={(e) => setClinic(e.target.value)}
                        >
                            {clinicList.map((clinic) => (
                                <MenuItem key={clinic.id} value={clinic.id}>{clinic.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
    
                    <Typography>Doctor</Typography>
                    <FormControl fullWidth>
                        <Select
                            value={doctor}
                            onChange={(e) => setDoctor(e.target.value)}
                        >
                            {doctorList.map((doctor) => (
                                <MenuItem key={doctor.id} value={doctor.id}>Dr. {doctor.firstName} {doctor.lastName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button variant='outlined' onClick={setClose}>Cancel</Button>
                    <Button variant='contained' onClick={handleConfirm}>Confirm</Button>
                </Box>
            </Box>
        </Modal>
    );

}
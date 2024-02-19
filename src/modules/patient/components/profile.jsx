import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Grid, Paper } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';
import dayjs from 'dayjs';


async function fetchPatientDetails(id) {
    const patientRef = doc(db, "users", id);
    const docSnap = await getDoc(patientRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
}

const sexMap = {
    'male' : 'Male',
    'female' : 'Female'
}

function PatientProfilePanel({ id }) {
    const [patientDetails, setPatientDetails] = useState(null);
    const [date, setDate] = React.useState(null);
    const [age, setAge] = useState(0);

    useEffect(() => {
        fetchPatientDetails(id)
            .then(data => setPatientDetails(data))
            .catch(error => console.error("Error fetching patient details: ", error));
    }, [id]);

    useEffect(() => {
        if(patientDetails?.dateOfBirth) {
            formatDate(patientDetails?.dateOfBirth);
        }
    }, [patientDetails]);

    if (!patientDetails) {
        return <Typography>Loading...</Typography>;
    }

    const formatDate = (dob) => {
        // Assuming dob is an object with a $d property that is a Date
        const dateOfBirth = new Date(dob.$d);
        const formattedDate = dayjs(dateOfBirth).format('MM/DD/YYYY');
        setDate(formattedDate);
        calculateAge(dateOfBirth); // Pass the Date object to calculateAge
    };
    
    const calculateAge = (dob) => {
        const birthDate = dayjs(dob); // dob is now a Date object
        const currentDate = dayjs();
    
        let age = currentDate.year() - birthDate.year();
        if (currentDate.month() < birthDate.month() || 
           (currentDate.month() === birthDate.month() && currentDate.date() < birthDate.date())) {
            age--;
        }
    
        setAge(age);
    };

    return (
        <Box sx={{display:'flex'}}>
            <Box sx={{
                py: 4, 
                px: 8, 
                borderRadius: 2, 
                display:'flex', 
                flexDirection:'column', 
                width:'auto',
                margin: 'auto',
                }}>
                <Avatar
                    alt={`${patientDetails.firstName} ${patientDetails.lastName}`}
                    src={patientDetails.profilePictureURL}
                    sx={{ width: '200px', height: '200px'}}
                />
                <Box>   
                <Grid container spacing={2} sx={{ mt: 4 }}>
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: 18 }}>First Name</Typography>
                        <Typography sx={{ fontWeight: 'bold', fontSize: 20 }}>{patientDetails.firstName}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: 18 }}>Last Name</Typography>
                        <Typography sx={{ fontWeight: 'bold', fontSize: 20 }}>{patientDetails.lastName}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: 18 }}>Contact</Typography>
                        <Typography sx={{ fontWeight: 'bold', fontSize: 20 }}>{patientDetails.contact}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: 18 }}>Date of Birth</Typography>
                        <Typography sx={{ fontWeight: 'bold', fontSize: 20 }}>{date}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: 18 }}>Email</Typography>
                        <Typography sx={{ fontWeight: 'bold', fontSize: 20 }}>{patientDetails.email}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: 18 }}>Sex</Typography>
                        <Typography sx={{ fontWeight: 'bold', fontSize: 20 }}>{sexMap[patientDetails.sex]}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ fontSize: 18 }}>Age</Typography>
                        <Typography sx={{ fontWeight: 'bold', fontSize: 20 }}>{age}</Typography>
                    </Grid>
                </Grid>
                </Box>
            </Box>
        </Box>
    )
}

export default PatientProfilePanel;

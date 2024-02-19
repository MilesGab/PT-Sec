import React from 'react';
import { Box, Button, FormControl, IconButton, MenuItem, Modal, Select, TextField, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { Timestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';

function formatFirestoreTimestamp(firestoreTimestamp) {
    if (!firestoreTimestamp || !firestoreTimestamp.toDate) {
        return 'Invalid Timestamp';
    }

    const dateObject = firestoreTimestamp.toDate();

    return dateObject;
}

async function countAppointmentsForDate(selectedDate) {
    const appRef = collection(db, "appointments");

    // Set start and end times for the selected date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Convert to Firestore Timestamps
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    // Query to count appointments for the selected date
    const q = query(appRef, where("date", ">=", startTimestamp), where("date", "<=", endTimestamp), where("status", "==", 1));

    const querySnapshot = await getDocs(q);
    let count = 0;

    querySnapshot.forEach(() => {
        count++;
    });

    return count;
}

export default function AppointmentCard({ open, setClose, isRequest, patients, submitForm, submitReject }) {

    const [patient, setPatient] = React.useState('');
    const [activity, setActivity] = React.useState('');
    const dateConverted = patients?.date ? formatFirestoreTimestamp(patients.date) : null;
    const datePreview = dateConverted ? dayjs(dateConverted) : null;
    const [appointmentDateTime, setAppointmentDateTime] = React.useState(null);
    const [isDateValid, setIsDateValid] = React.useState(true);

    const [validationErrors, setValidationErrors] = React.useState({
        patient: false,
        activity: false,
        date: false
    });

    const handleDateChange = async (newDate) => {
        setAppointmentDateTime(newDate);
        const count = await countAppointmentsForDate(newDate);
        if (count >= 10) {
            setIsDateValid(false);
        } else{
            setIsDateValid(true);

        }
    };

    const validateInputs = () => {
        const errors = {
            patient: !patient,
            activity: !activity,
            date: !appointmentDateTime || !isDateValid
        };

        setValidationErrors(errors);
        return !errors.patient && !errors.activity && !errors.date;
    };

    const handleSubmit = () => {
        if (validateInputs()) {
            submitForm(patient, activity, appointmentDateTime);
        }
    };

    React.useEffect(() => {
        if (isRequest && patients?.date) {
            const initialDate = formatFirestoreTimestamp(patients?.date);
            if (initialDate) {
                const initialDateDayjs = dayjs(initialDate);
                setAppointmentDateTime(initialDateDayjs);
    
                const getAppointmentCount = async () => {
                    if (initialDateDayjs.isValid()) {
                        const count = await countAppointmentsForDate(initialDateDayjs.toDate());
                        setIsDateValid(count < 10);
                    } else {
                        console.error('Invalid date provided from patients.date');
                        setIsDateValid(false);
                    }
                };
    
                getAppointmentCount();
            }
        }

    }, [isRequest, patients?.date]);
    
        
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

    const handleClose = () =>{
        setPatient('');
        setActivity('');
        setAppointmentDateTime(null);
        setIsDateValid(true);

        setClose();
    }

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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={boxStyle} onClick={handleContentClick}>
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Typography sx={{flex: 1, fontSize: '20px', fontWeight:'bold'}}>{isRequest ? 'Appointment Request' : 'Create Appointment'}</Typography>
                        <IconButton onClick={handleClose}>
                            <CloseRoundedIcon/>
                        </IconButton>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection:'column'}}>
                        <Typography>Patient</Typography>
                        <FormControl fullWidth>
                            {isRequest ? (
                                <Typography>{patients?.patient_name}</Typography>
                            ) : (
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
                            )}
                        
                        </FormControl>
                        {validationErrors.patient && <Typography color="error">Patient is required</Typography>}

                        <Typography>Activity</Typography>
                        <FormControl fullWidth>
                        {isRequest ? (
                            <Typography>{patients?.name}</Typography>
                        ) : (
                            <Select
                                name="activity"
                                value={activity}
                                onChange={handleChange}
                            >
                                <MenuItem value={'Consultation'}>Consultation</MenuItem>
                                <MenuItem value={'Assessment'}>Assessment</MenuItem>
                            </Select>
                        )}
                        
                        </FormControl>
                        {validationErrors.activity && <Typography color="error">Activity is required</Typography>}

                        <Typography>Date and Time</Typography>
                        {isRequest ? (
                            <>
                                <DateTimePicker
                                value={datePreview}
                                onChange={handleDateChange}
                                renderInput={(params) => <TextField {...params} />}
                                sx={{ width: '100%' }}
                                />
                            </>
                        ) : (
                            <DateTimePicker
                                value={appointmentDateTime}
                                onChange={handleDateChange}
                                renderInput={(params) => <TextField {...params} />}
                                minDate={dayjs()}
                                sx={{ width: '100%' }}
                            />
                        )}
                        {!isDateValid && <Typography sx={{fontSize: 12, color:'red'}}>Maximum number of appointments reached.</Typography>}
                        {validationErrors.date && <Typography color="error">Valid date is required</Typography>}

                    </Box>
                    <Box sx={{display:'flex', mt: 2, gap: 1, justifyContent:'flex-end'}}>
                        {isRequest ? (
                            <>
                                <Button onClick={() => submitReject(patients.uid)} variant="outlined">Reject</Button>
                                <Button disabled={!isDateValid} onClick={() => submitForm(patients.uid, appointmentDateTime)} variant="contained">Approve</Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={setClose} variant="outlined">Cancel</Button>
                                <Button disabled={!isDateValid} onClick={handleSubmit} variant="contained">Create</Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Modal>
        </LocalizationProvider>
    );
}

import React, { useState } from 'react';
import { Box, IconButton, Modal, Typography, TextField, Button, FormControl, Select, MenuItem, CircularProgress, InputAdornment } from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import DvrRoundedIcon from '@mui/icons-material/DvrRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Timestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { db, functions } from '@/app/firebaseConfig';
import { useUser } from '../../../../context/UserContext';
import { httpsCallable } from 'firebase/functions';

async function fetchDoctors(){
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(query(collection(db, "users"), where("role", "==", 1)));
    let doctors = [];
    
    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        doctors.push({id: doc.id, ...userData});
    });

    return doctors;
}

async function fetchClinics(){
    const clinicRef = await getDocs(collection(db, "clinics"));

    let clinics = [];
    clinicRef.forEach((doc)=>{
        const clinicData = doc.data();
        clinics.push({id: doc.id, ...clinicData});
    });

    return clinics;
}

// function OTPCard(){

//     return(
//         <Modal open={open} onClose={handleClose}>
//             <Box>
//                 <Typography>Please enter OTP sent to</Typography>
//                 <TextField></TextField>
//             </Box>
//         </Modal>
//     )

// }

export default function AccountCard({ open, setClose }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [contact, setContact] = useState('');
    const [password, setPassword] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(null);
    const [role, setRole] = useState(0);
    const [clinic, setClinic] = useState('');
    const [doctor, setDoctor] = useState([]);
    const [sex, setSex] = useState('');

    const [isLoading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        email: '',
        contact: '',
        password: '',
        doctor: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        sex: '',
        clinic: '',
    });

    const [doctorList, setDoctorList] = useState([]);
    const [clinicList, setClinicList] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);

    const practiceList = [
        {id: 0, practice: 'Physical Therapist'},
        {id: 1, practice: 'Orthopedic Doctor'},
    ]

    const { userData } = useUser();

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

    const dateOfBirthObject = new Date(dateOfBirth);
    const firestoreTimestamp = Timestamp.fromDate(dateOfBirthObject);
    
    const validateForm = () => {
        let isValid = true;
        let newErrors = { email: '', contact: '', password: '', doctor: '', firstName: '', lastName: '' };

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
            newErrors.email = 'Invalid email format';
            isValid = false;
        }

        if (!firstName){
            newErrors.firstName = 'First name cannot be empty'
            isValid = false;
        }

        if (!lastName){
            newErrors.lastName = 'Last name cannot be empty'
            isValid = false;
        }

        if (contact.length > 10) {
            newErrors.contact = 'Contact number cannot exceed 10 digits';
            isValid = false;
        }

        if (contact.length < 10) {
            newErrors.contact = 'Please enter a valid contact number';
            isValid = false;
        }

        if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        if (!doctor) {
            newErrors.doctor = 'Please select a doctor';
            isValid = false;
        }

        if (!dateOfBirth) {
            newErrors.dateOfBirth = 'Please enter date of birth';
            isValid = false;
        }

        if (!sex) {
            newErrors.sex = 'Please select patient\'s sex';
            isValid = false;
        }

        if (!clinic) {
            newErrors.clinic = 'Please choose a clinic';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const accountData = {
            firstName, 
            lastName, 
            email, 
            role,
            clinic, 
            contact: '+63' + contact, 
            password,
            dateOfBirth, 
            doctor, 
            sex
        };
    
        const verifyUserPhone = httpsCallable(functions, 'sendVerify');
        const createUserFunction = httpsCallable(functions, 'createUser');
    
        try {
            const response = await verifyUserPhone({phNumber: accountData.contact})
            const otp = window.prompt('Please enter the 6-Digit OTP you received:');
            if (otp) {
                const verifyOTP = httpsCallable(functions, 'verifyOTP');
                const verifyResponse = await verifyOTP({phNumber: accountData.contact, code: otp});
                if (verifyResponse && verifyResponse.data.success) {
                    alert('Phone verification successful.');
                    await createUserFunction(accountData);
                    setLoading(false);
                    alert('Account Created');
                    handleClose();
                } else {
                    alert('OTP verification failed.');
                    setLoading(false);
                }
            } else {
                alert('OTP verification cancelled.');
                setLoading(false);
            }
        } catch (error) {
            console.error("Error creating account:", error);
            setLoading(false);
            alert('Failed to create account: ', error.message);
        }
    };

    const handleClose = () => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setContact('');
        setPassword('');
        setDateOfBirth(null);
        setDoctor('');
        setSex('');
        setClinic('');
        setRole(0);
        setLoading(false);
        setErrors({
            email: '',
            contact: '',
            password: '',
            doctor: '',
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            sex: '',
            clinic: '',
        });
        setClose();
    };

    const roleStyle = (roleType) => ({
        border: role === roleType ? '2px solid rgba(0,0,0,1)' : '1px solid rgba(0,0,0,0.3)',
        borderRadius: 2,
        display: 'flex',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        px: 4,
        py: 2,
        gap: 1,
        userSelect:'none',
        cursor:'pointer'
    });

    const handleRole = (selectedRole) => {
        setRole(selectedRole);
    };

    React.useEffect(() => {
        if (userData?.role === 2) {
            setClinic(userData.clinic);
        }
    }, [userData]);

    React.useEffect(()=>{
        const getDoctorList = async () =>{
            try{
                const doctorData = await fetchDoctors();
                const clinicData = await fetchClinics();
                setDoctorList(doctorData);
                setClinicList(clinicData);
            } catch(e){

            }
        }

        getDoctorList();
    },[open]);

    React.useEffect(() => {
        const updatedFilteredDoctors = doctorList.filter(doctor => doctor.clinic === clinic);
        setFilteredDoctors(updatedFilteredDoctors);
    }, [clinic, doctorList]);

    return ( 
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Modal open={open} onClose={handleClose}>
                <Box sx={boxStyle}>
                    <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                        <Typography sx={{flex: 1, fontSize: '20px', fontWeight: 'bold'}}>Create Account</Typography>
                        <IconButton onClick={handleClose}>
                            <CloseRoundedIcon />
                        </IconButton>
                    </Box>
                    {userData?.role === 3 && (
                        <Box sx={{mb: 2}}>
                            <Typography sx={{mb: 2, fontWeight:'bold', fontSize: '18px', textAlign:'center'}}>Choose Account Type</Typography>
                            <Box sx={{display: 'flex', flexDirection:'row', justifyContent:'space-evenly'}}>
                                <Box sx={roleStyle(1)} onClick={() => handleRole(1)}>
                                    <LocalHospitalRoundedIcon fontSize='large'/>
                                    <Typography>Doctor</Typography>
                                </Box>
                                <Box sx={roleStyle(2)} onClick={() => handleRole(2)}>
                                    <DvrRoundedIcon fontSize='large'/>
                                    <Typography>Secretary</Typography>
                                </Box>
                                <Box sx={roleStyle(0)} onClick={() => handleRole(0)}>
                                    <AccountCircleRoundedIcon fontSize='large'/>
                                    <Typography>Patient</Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                    <Box component="form" sx={{display: 'flex', flexDirection: 'column', gap:1, justifyContent:'center'}}>
                        <Box sx={{display:'flex', gap: 2}}>
                            <Box sx={{width: '50%'}}>
                                <Typography>First Name</Typography>
                                <TextField 
                                    fullWidth 
                                    variant="outlined" 
                                    value={firstName} 
                                    onChange={(e) => setFirstName(e.target.value)}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName} 
                                />
                            </Box>
                            <Box sx={{width: '50%'}}>
                                <Typography>Last Name</Typography>
                                <TextField 
                                    fullWidth 
                                    variant="outlined" 
                                    value={lastName} 
                                    onChange={(e) => setLastName(e.target.value)} 
                                    error={!!errors.lastName}
                                    helperText={errors.lastName}
                                />
                            </Box>
                        </Box>

                        <Box sx={{display:'flex', gap: 2}}>
                            <Box sx={{width: '50%'}}>
                                <Typography>Email</Typography>
                                <TextField
                                    type="email"
                                    fullWidth
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                />
                            </Box>
                            <Box sx={{width: '50%'}}>
                                <Typography>Contact</Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    error={!!errors.contact}
                                    helperText={errors.contact}
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">+63</InputAdornment>,
                                      }}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Typography>Set Initial Password</Typography>
                            <TextField
                                type="password"
                                fullWidth
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={!!errors.password}
                                helperText={errors.password}
                            />
                        </Box>

                        <Box sx={{display:'flex', gap: 2}}>
                            <Box sx={{width:'50%'}}>
                                <Typography>Date of Birth</Typography>
                                <DatePicker 
                                    value={dateOfBirth}
                                    onChange={setDateOfBirth}
                                    sx={{
                                        width:'100%',
                                    }}
                                />
                                {!!errors.dateOfBirth && (
                                    <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                                        {errors.dateOfBirth}
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{width:'50%'}}>
                                <Typography>Sex</Typography>
                                <FormControl fullWidth>
                                    <Select
                                        value={sex}
                                        onChange={(e) => setSex(e.target.value)}
                                        error={!!errors.sex}
                                    >
                                        <MenuItem value="male">Male</MenuItem>
                                        <MenuItem value="female">Female</MenuItem>
                                        <MenuItem value="other">Other</MenuItem>
                                    </Select>
                                </FormControl>
                                {!!errors.sex && (
                                    <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                                        {errors.sex}
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {userData?.role === 3 && (
                        <Box sx={{display:'flex', gap: 2}}>
                            <Box sx={{width:'50%'}}>
                                <Typography>Clinic</Typography>
                                <FormControl fullWidth>
                                    <Select
                                        value={clinic}
                                        onChange={(e) => setClinic(e.target.value)}
                                        error={!!errors.clinic}
                                    >
                                        {clinicList.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                {item.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                {!!errors.clinic && (
                                    <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                                        {errors.clinic}
                                    </Typography>
                                )}
                            </Box>
                            <Box sx={{width:'50%'}}>
                                <Typography>Doctor</Typography>
                                <FormControl fullWidth>
                                    <Select
                                        value={doctor}
                                        onChange={(e) => setDoctor(e.target.value)}
                                        error={!!errors.doctor}
                                        multiple={role === 2}
                                    >
                                        {role === 1 && practiceList.map((item)=>(
                                            <MenuItem key={item.id} value={item.practice}>
                                                {item.practice}
                                            </MenuItem>
                                        ))}

                                        {role !== 1 && filteredDoctors.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                Dr. {item.firstName} {item.lastName}
                                            </MenuItem>
                                        ))}
                                        
                                    </Select>
                                    {!!errors.doctor && (
                                        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                                            {errors.doctor}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Box>
                        </Box>
                        )}

                        {userData?.role === 2 && (
                            <Box sx={{width:'100%'}}>
                                <Typography>Doctor</Typography>
                                <FormControl fullWidth>
                                    <Select
                                        value={doctor}
                                        onChange={(e) => setDoctor(e.target.value)}
                                        error={!!errors.doctor}
                                    >
                                        {filteredDoctors.map((item) => (
                                            <MenuItem key={item.id} value={item.id}>
                                                Dr. {item.firstName} {item.lastName}
                                            </MenuItem>
                                        ))}
                                        
                                    </Select>
                                    {!!errors.doctor && (
                                        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                                            {errors.doctor}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Box>
                        )}


                        <Box sx={{display:'flex', justifyContent:'center'}}>
                            <Button variant="contained" onClick={handleSubmit} sx={{ mt: 2, px: 4, py: 1.25 }}>{isLoading ? <CircularProgress/> : 'Submit'}</Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </LocalizationProvider>
    );
}

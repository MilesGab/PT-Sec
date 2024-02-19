import React from 'react';
import { Box, Button, CircularProgress, Divider, FormControl, IconButton, InputAdornment, InputLabel, Menu, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import CreateIcon from '@mui/icons-material/Create';

import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { db, functions } from '@/app/firebaseConfig';
import PatientModal from './editpatientcard';
import { httpsCallable } from 'firebase/functions';
import AccountCard from '@/modules/welcome/components/accountcard';

import { useRouter } from 'next/navigation';
import ChangePassword from './changepassword';

function SearchBar({ onSearchChange }){
    return(
        <Box sx={{width: '100%'}}>
            <TextField
                sx={{
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: 4,
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            border: 'none',
                        },
                        borderRadius: 4,
                    }
                }}
                variant='outlined'
                color='secondary'
                placeholder='Search for users'
                fullWidth
                InputProps={{
                    endAdornment: (
                        <InputAdornment position='end'>
                            <SearchIcon/>
                        </InputAdornment>
                    )
                }}
                onChange={e => {
                    onSearchChange(e.target.value);
                }}
            />
        </Box>
    )
}

async function getAllUsersFromFirestore(){
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(query(collection(db, "users"), where("role", "!=", 3)));
    let users = [];
    
    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({ id: doc.id, ...userData});
    });

    return users;
}

async function deleteUser(userId) {
    try {
        const userDocRef = doc(db, "users", userId);
        await deleteDoc(userDocRef);
    } catch (error) {
        console.error("Error deleting user document:", error);
    }
}

async function getAllDoctorsFromFirestore(){
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(query(collection(db, "users"), where("role", "==", 1)));
    let users = [];
    
    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({ id: doc.id, ...userData});
    });

    return users;
}

async function getClinicList(){
    const clinicSnapshot = await getDocs(collection(db, "clinics"));

    let clinics = [];

    clinicSnapshot.forEach((doc) => {
        const clinicData = doc.data();
        clinics.push({ id: doc.id, ...clinicData});
    })

    return clinics;
}

function mapDoctorsToUsers(users, doctors, clinics) {
    return users.map(user => {
        let doctorNames;
        if (Array.isArray(user.doctor)) {
            // User has multiple doctors
            doctorNames = user.doctor.map(doctorId => {
                const assignedDoctor = doctors.find(doctor => doctor.id === doctorId);
                return assignedDoctor ? `Dr. ${assignedDoctor.firstName} ${assignedDoctor.lastName}` : 'Unassigned';
            }).join(', ');
        } else {
            // User has a single doctor
            const assignedDoctor = doctors.find(doctor => doctor.id === user.doctor);
            doctorNames = assignedDoctor ? `Dr. ${assignedDoctor.firstName} ${assignedDoctor.lastName}` : 'Unassigned';
        }

        const assignedClinic = clinics.find(clinic => clinic.id === user.clinic);

        return {
            ...user,
            doctor_name: doctorNames,
            doctor_id: user.doctor, // doctor_id can be an array or a single value
            clinic: assignedClinic ? assignedClinic.name.trim() : 'Unassigned',
            clinic_id: assignedClinic ? assignedClinic.id : null 
        };
    });
}


const roleMap = { 
    0 : 'Patient',
    1 : 'Doctor',
    2 : 'Secretary'
    
};

function DataTable() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isLoading, setisLoading] = React.useState(true);

    const [userList, setUserList] = React.useState([]);
    const [doctors, setDoctors] = React.useState([]);
    const [clinics, setClinics] = React.useState([]);

    const [selectedPatient, setSelectedPatient] = React.useState({});
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [isModalOpen, setModalOpen] = React.useState(false);
    const [isAccountModalOpen, setAccountModalOpen] = React.useState(false);
    const [isPassModalOpen, setPassModalOpen] = React.useState(false);

    const router = useRouter();

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const [doctorFilter, setDoctorFilter] = React.useState('');
    const [clinicFilter, setClinicFilter] = React.useState('');
    const [accountTypeFilter, setAccountTypeFilter] = React.useState('');

    const [doctorOptions, setDoctorOptions] = React.useState([]);
    const [clinicOptions, setClinicOptions] = React.useState([]);

    const handleClick = (row) => (event) => {
        setSelectedPatient(row);
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const fetchData = async () => {

        setisLoading(true);

        try {
            const users = await getAllUsersFromFirestore();
            const doctors = await getAllDoctorsFromFirestore();
            const clinics = await getClinicList();
            setUserList(mapDoctorsToUsers(users, doctors, clinics));
            setDoctors(doctors);
            setClinics(clinics);

            setDoctorOptions(doctors.map(doctor => ({ label: `Dr. ${doctor.firstName} ${doctor.lastName}`, value: doctor.id })));
            setClinicOptions(clinics.map(clinic => ({ label: clinic.name, value: clinic.id })));
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally{
            setisLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpen = () =>{
        setModalOpen(true);
        handleClose();
    };

    const handlePatientPage = () =>{
        router.push(`/patient?id=${selectedPatient.uid}`);
    }

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

    const handleOpenAccountModal = () => setAccountModalOpen(true);
    const handleCloseAccountModal = () => setAccountModalOpen(false);

    const handlePassModalOpen = () =>{
        setPassModalOpen(true);
        handleClose();
    }

    const handlePassModalClose = () => setPassModalOpen(false);

    const handleDelete = async () => {
        const isConfirmed = window.confirm("Are you sure you want to delete this user account?");
    
        if (isConfirmed) {
            const deleteUserAccount = httpsCallable(functions, 'deleteUserAccount');
        
            try {
                await deleteUserAccount({ uid: selectedPatient.id });
                await deleteUser(selectedPatient.id);
                alert("User account deleted successfully");
                handleClose();
                fetchData();
            } catch (error) {
                console.error("Error deleting user account:", error);
                alert("Failed to delete user account.");
            }
        } else {
            alert("User account deletion cancelled.");
            handleClose();
        }
    };

    React.useEffect(() => {
        fetchData();
    }, [searchQuery]);

    const filteredUsers = userList.filter((user) => {
        const doctorCondition = Array.isArray(user.doctor) 
            ? user.doctor.includes(doctorFilter)
            : user.doctor === doctorFilter;
    
        return (doctorFilter ? doctorCondition : true) &&
               (clinicFilter ? user.clinic_id === clinicFilter : true) &&
               (accountTypeFilter ? roleMap[user.role] === accountTypeFilter : true) &&
               (user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    });
    
    const displayedUsers = filteredUsers
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    
    const handleDoctorFilterChange = (event) => {
        setDoctorFilter(event.target.value);
    };
    
    const handleClinicFilterChange = (event) => {
        setClinicFilter(event.target.value);
    };
    
    const handleAccountTypeFilterChange = (event) => {
        setAccountTypeFilter(event.target.value);
    };

    return (
        <Paper sx={{ background: 'white'}}>
            <PatientModal
                open={isModalOpen}
                setClose={handleCloseModal}
                patient={selectedPatient}
            />
            <ChangePassword 
                open={isPassModalOpen}
                setClose={handlePassModalClose}
                patient={selectedPatient}
            />
            <Box sx={{ p: 4, display:'flex', gap: 1, alignItems:'center' }}>
                <SearchBar onSearchChange={setSearchQuery} />
                <IconButton onClick={handleOpenAccountModal}>
                    <CreateIcon/>
                </IconButton>
                {/* <Button  variant='contained' sx={{fontSize: 12}}>Create Account</Button> */}
                <AccountCard
                    open={isAccountModalOpen}
                    setClose={handleCloseAccountModal}
                />
                <IconButton onClick={fetchData}>
                    <RefreshIcon/>
                </IconButton>

            </Box>
            <Box sx={{px: 4, display: 'flex', alignItems:'center', gap: 2, mb: 2}}>
                <Typography sx={{fontWeight:'bold'}}>Filters: </Typography>
                <FormControl size='small' sx={{ minWidth: 120 }}>
                    <InputLabel>Doctor</InputLabel>
                    <Select
                        label='Doctor'
                        value={doctorFilter}
                        onChange={handleDoctorFilterChange}
                    >
                        <MenuItem value=''><em>None</em></MenuItem>
                        {doctorOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size='small' sx={{ minWidth: 120 }}>
                    <InputLabel>Clinic</InputLabel>
                    <Select
                        label='Clinic'
                        value={clinicFilter}
                        onChange={(e)=>handleClinicFilterChange(e)}
                    >
                        <MenuItem value=''><em>None</em></MenuItem>
                        {clinicOptions.map(option => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size='small' sx={{ minWidth: 160 }}>
                    <InputLabel>Account Type</InputLabel>
                    <Select
                        label='Account Type'
                        value={accountTypeFilter}
                        onChange={(e)=>handleAccountTypeFilterChange(e)}
                    >
                            <MenuItem value=''><em>None</em></MenuItem>
                            <MenuItem value={'Doctor'}>Doctor</MenuItem>
                            <MenuItem value={'Secretary'}>Secretary</MenuItem>
                            <MenuItem value={'Patient'}>Patient</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Divider sx={{ mx: 4 }} />
            <Box sx={{ px: 4 }}>
                {isLoading ? (
                    <Box sx={{textAlign:'center', p: 4}}>
                        <CircularProgress color='secondary'/>
                    </Box>
                ) : (
                <>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 550 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Email</TableCell>
                                <TableCell align="right">Contact</TableCell>
                                <TableCell align="right">Doctor Assigned</TableCell>
                                <TableCell align="right">Clinic</TableCell>
                                <TableCell align="right">Account Type</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayedUsers.map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        {row.firstName || row.lastName ? `${row.firstName} ${row.lastName}`.trim() : '---'}
                                    </TableCell>
                                    <TableCell align="right">{row.email || '---'}</TableCell>
                                    <TableCell align="right">{row.contact || '---'}</TableCell>
                                    <TableCell align="right">{row.role !== 1 ? row.doctor_name : row.doctor || 'Unassigned'}</TableCell>
                                    <TableCell align="right">{row.clinic || 'Unassigned'}</TableCell>
                                    <TableCell align="right">{roleMap[row.role]}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={handleClick(row)}>
                                            <MoreVertIcon/>
                                        </IconButton>
                                        <Menu
                                            elevation={1}
                                            anchorOrigin={{
                                              vertical: 'bottom',
                                              horizontal: 'right',
                                            }}
                                            transformOrigin={{
                                              vertical: 'top',
                                              horizontal: 'right',
                                            }}
                                            anchorEl={anchorEl}
                                            open={open}
                                            onClose={handleClose}
                                        >
                                            <MenuItem onClick={handleOpen}>Edit</MenuItem>
                                            <MenuItem onClick={handlePassModalOpen}>Change Account Password</MenuItem>
                                            <MenuItem onClick={handleDelete}>Delete Account</MenuItem>
                                        </Menu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={userList.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                </>
                )}
            </Box>
        </Paper>
    );
}

export default DataTable;
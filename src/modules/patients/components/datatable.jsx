import React from 'react';
import { Box, CircularProgress, Divider, FormControl, IconButton, InputAdornment, InputLabel, Menu, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { db, functions } from '@/app/firebaseConfig';
import PatientModal from './editpatientcard';
import { httpsCallable } from 'firebase/functions';

import { useRouter } from 'next/navigation';
import { useUser } from '../../../../context/UserContext';
import ChangePassword from './changepassword';


function SearchBar({ onSearchChange }){
    return(
        <Box sx={{width: '80vw'}}>
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
                placeholder='Search for patients'
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

async function getAllUsersFromFirestore(clinicId){
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(query(collection(db, "users"), where("role", "==", 0), where("clinic", "==", clinicId)));
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

async function getAllDoctorsFromFirestore(clinicId){
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(query(collection(db, "users"), where("role", "==", 1)));
    let users = [];
    
    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({ id: doc.id, ...userData});
    });

    return users;
}

function mapDoctorsToUsers(users, doctors) {
    return users.map(user => {
        const assignedDoctor = doctors.find(doctor => doctor.id === user.doctor);

        return {
            ...user,
            doctor: assignedDoctor ? `Dr. ${assignedDoctor.firstName} ${assignedDoctor.lastName}`.trim() : 'Unassigned',
            doctor_id: assignedDoctor ? assignedDoctor.id : null
        };
    });
}


function DataTable() {
    const { userData } = useUser();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isLoading, setisLoading] = React.useState(true);
    const [userList, setUserList] = React.useState([]);
    const [selectedPatient, setSelectedPatient] = React.useState({});
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [isModalOpen, setModalOpen] = React.useState(false);
    const [isPassModalOpen, setPassModalOpen] = React.useState(false);

    const [doctorFilter, setDoctorFilter] = React.useState('');
    const [doctorOptions, setDoctorOptions] = React.useState([]);


    const router = useRouter();

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handlePatientPage = () =>{
        router.push(`/patient?id=${selectedPatient.uid  }`);
    }

    const handleClick = (row) => (event) => {
        setSelectedPatient(row);
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const fetchData = async () => {
        try {
            const users = await getAllUsersFromFirestore(userData.clinic);
            const doctors = await getAllDoctorsFromFirestore();
            setUserList(mapDoctorsToUsers(users, doctors));
            setDoctorOptions(doctors.map(doctor => ({ label: `Dr. ${doctor.firstName} ${doctor.lastName}`, value: doctor.id })));
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally{
            setisLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, [searchQuery, doctorFilter]);

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

    const handleCloseModal = () => setModalOpen(false);

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
    }, [searchQuery]); // Include searchQuery as a dependency

    // Filter userList based on searchQuery
    const filteredUsers = userList.filter((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const matchesSearchQuery = fullName.includes(searchQuery.toLowerCase()) ||
                                   user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDoctorFilter = doctorFilter ? user.doctor_id === doctorFilter : true;

        return matchesSearchQuery && matchesDoctorFilter;
    });

    const handleDoctorFilterChange = (event) => {
        setDoctorFilter(event.target.value);
    };

    const displayedUsers = filteredUsers
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // const displayedUsers = userList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Paper sx={{ background: 'white' }}>
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
            <Box sx={{ p: 4 }}>
                <SearchBar onSearchChange={setSearchQuery} />
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
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Email</TableCell>
                                <TableCell align="right">Contact</TableCell>
                                <TableCell align="right">Doctor Assigned</TableCell>
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
                                    <TableCell align="right">{row.doctor || 'Unassigned'}</TableCell>
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
                                            <MenuItem onClick={handlePatientPage}>View Patient Page</MenuItem>
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
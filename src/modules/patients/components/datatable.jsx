import React from 'react';
import { Box, CircularProgress, Divider, FormControl, IconButton, InputAdornment, InputLabel, Menu, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '@/app/firebaseConfig';

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

async function getAllUsersFromFirestore(){
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(query(collection(db, "users"), where("role", "==", 0)));
    let users = [];
    
    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({ id: doc.id, ...userData});
    });

    return users;
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

function mapDoctorsToUsers(users, doctors) {
    return users.map(user => {
        const assignedDoctor = doctors.find(doctor => doctor.id === user.doctor);
        return {
            ...user,
            doctor: assignedDoctor ? `Dr. ${assignedDoctor.firstName} ${assignedDoctor.lastName}`.trim() : user.doctor
        };
    });
}

function DataTable() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isLoading, setisLoading] = React.useState(true);
    const [userList, setUserList] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const users = await getAllUsersFromFirestore();
                const doctors = await getAllDoctorsFromFirestore();
                setUserList(mapDoctorsToUsers(users, doctors));
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally{
                setisLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const displayedUsers = userList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Paper sx={{ background: 'white' }}>
            <Box sx={{ p: 4 }}>
                <SearchBar onSearchChange={setSearchQuery} />
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
                                        <IconButton onClick={handleClick}>
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
                                            <MenuItem onClick={handleClose}>Action 1</MenuItem>
                                            <MenuItem onClick={handleClose}>Action 2</MenuItem>
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
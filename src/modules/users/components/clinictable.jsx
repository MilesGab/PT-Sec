import React from 'react';
import { Box, 
        CircularProgress, 
        Divider, 
        IconButton, 
        InputAdornment, 
        Menu, 
        MenuItem, 
        Paper, 
        Table, 
        TableBody, 
        TableCell, 
        TableContainer, 
        TableHead, 
        TablePagination, 
        TableRow, 
        TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import CreateIcon from '@mui/icons-material/Create';

import { collection, deleteDoc, doc, getDocs} from "firebase/firestore";
import { db, functions } from '@/app/firebaseConfig';
import PatientModal from './editpatientcard';
import { httpsCallable } from 'firebase/functions';
import AccountCard from '@/modules/welcome/components/accountcard';
import ClinicModal from './clinicmodal';
import ClinicEditModal from './editcliniccard';

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
                placeholder='Search for clinics'
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


async function deleteUser(userId) {
    try {
        const userDocRef = doc(db, "users", userId);
        await deleteDoc(userDocRef);
    } catch (error) {
        console.error("Error deleting user document:", error);
    }
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


function ClinicTable() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isLoading, setisLoading] = React.useState(true);
    const [clinicList, setClinicList] = React.useState([]);
    const [selectedPatient, setSelectedPatient] = React.useState({});
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [isModalOpen, setModalOpen] = React.useState(false);
    const [isAccountModalOpen, setAccountModalOpen] = React.useState(false);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

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
            const clinics = await getClinicList();
            setClinicList(clinics);
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

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

    const handleOpenAccountModal = () => setAccountModalOpen(true);
    const handleCloseAccountModal = () => setAccountModalOpen(false);

    const handleDelete = async () => {
        const isConfirmed = window.confirm("Are you sure you want to delete this user account?");
    
        if (isConfirmed) {
            try {
                await deleteUserAccount({ uid: selectedPatient.id });
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

    const getFilteredClinics = () => {
        return clinicList.filter((clinic) => {
            return (
                clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                clinic.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                clinic.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
                clinic.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        });
    };

    const filteredClinics = React.useMemo(getFilteredClinics, [clinicList, searchQuery]);

    const displayedClinics = filteredClinics
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // React.useEffect(() => {
    //     fetchData();
    // }, []);

    // const displayedClinics = clinicList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Paper sx={{ background: 'white'}}>
            <ClinicEditModal
                open={isModalOpen}
                setClose={handleCloseModal}
                patient={selectedPatient}
            />
            <Box sx={{ p: 4, display:'flex', gap: 1, alignItems:'center' }}>
                <SearchBar onSearchChange={setSearchQuery} />
                {/* <IconButton onClick={handleOpenAccountModal}>
                    <CreateIcon/>
                </IconButton>
                <ClinicModal
                    open={isAccountModalOpen}
                    setClose={handleCloseAccountModal}
                />
                <IconButton onClick={fetchData}>
                    <RefreshIcon/>
                </IconButton> */}

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
                                <TableCell align="right">Address</TableCell>
                                <TableCell align="right">Contact</TableCell>
                                <TableCell align="right">Email</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayedClinics.map((row) => (
                                <TableRow
                                    key={row.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">{row.name || '---'}</TableCell>
                                    <TableCell align="right">{row.address || '---'}</TableCell>
                                    <TableCell align="right">{row.contact || '---'}</TableCell>
                                    <TableCell align="right">{row.email || '---'}</TableCell>
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
                                            <MenuItem onClick={handleOpen}>Edit Clinic Information</MenuItem>
                                            <MenuItem onClick={handleDelete}>Delete Clinic</MenuItem>
                                        </Menu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={clinicList.length}
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

export default ClinicTable;
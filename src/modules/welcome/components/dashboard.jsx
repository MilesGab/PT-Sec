import React from 'react';
import { Avatar, Box, IconButton, InputAdornment, List, ListItem, MenuItem, Pagination, Paper, Select, Skeleton, TextField, Typography } from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import PlaylistAddCheckCircleRoundedIcon from '@mui/icons-material/PlaylistAddCheckCircleRounded';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import { db } from '@/app/firebaseConfig';
import { Timestamp, addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import AppointmentCard from './appointmentcard';
import AccountCard from './accountcard';
import { useUser } from '../../../../context/UserContext';
import { useRouter } from 'next/navigation';

import Image from 'next/image';
import TicketCard from './ticketmodal';
import MedRequestCard from './medrequestmodal';

function SearchBar({ onSearchChange }){
    return(
        <Box sx={{width: '40vw'}}>
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

async function getAppointmentRequests(){

    const appRef = collection(db, "appointments");
    const querySnapshot = await getDocs(query(appRef, where('status', '==', 0)));
    let pending = [];
    
    for (const docSnapshot of querySnapshot.docs) {
        const appData = docSnapshot.data();
        const patientId = appData.patient_assigned;

        const userRef = doc(db, "users", patientId);
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.data();

        pending.push({
            id: docSnapshot.id, 
            ...appData,
            patient_name: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown'
        });
    }

    return pending;
}

function formatFirestoreTimestamp(firestoreTimestamp) {
    if (!firestoreTimestamp || !firestoreTimestamp.toDate) {
        return 'Invalid Timestamp';
    }

    const dateObject = firestoreTimestamp.toDate();
    const formattedDate = dateObject.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const formattedTime = dateObject.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return `${formattedTime} at ${formattedDate}`;
}

async function updateAssessment(appID, dateApproved, date, status) {
    try {
        const appRef = doc(db, "appointments", appID);

        await updateDoc(appRef, {
            status: status,
            date: date,
            dateApproved: dateApproved
        });

    } catch (error) {
        console.error("Error updating document: ", error);
    }
}

async function deleteAssessment(appId){

    try{
        const appRef = doc(db, "appointments", appId);
        await deleteDoc(appRef);
    } catch(e){
        console.error('Failed to reject appointment request: ', e);
    }

}

const requestTypeMap = {
    'medical_certificate' : 'Medical Certificate',
    'medical_prescription' : 'Medical Prescription',
    'laboratory_request' : 'Laboratory Request'
}

function RecentRequests() {

    const [list, setList] = React.useState([]);
    const [appList, setAppList] = React.useState([]);
    const [docList, setDocList] = React.useState([]);
    const [filter, setFilter] = React.useState('appointments');
    const [isModalOpen, setModalOpen] = React.useState(false);
    const [isRequestModalOpen, setRequestModalOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState(null);

    const handleOpenModal = (item) => {
        setSelectedItem(item);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
        setModalOpen(false);
    };
    
    const handleOpenRequestModal = (item) => {
        setSelectedItem(item);
        setRequestModalOpen(true);
    };

    const handleCloseRequestModal = () => {
        setSelectedItem(null);
        setRequestModalOpen(false);
    };

    
    React.useEffect(()=>{
        const appRef = collection(db, "appointments");
        const q = query(appRef, where('status', '==', 0));
        
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const pending = [];

            for (const docSnapshot of querySnapshot.docs) {
                const appData = docSnapshot.data();
                const patientId = appData.patient_assigned;
    
                const userRef = doc(db, "users", patientId);
                const userSnapshot = await getDoc(userRef);
                const userData = userSnapshot.data();
    
                pending.push({
                    id: docSnapshot.id, 
                    ...appData,
                    patient_name: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown',
                    patient_photo: userData ? userData.profilePictureURL : null,
                });
            }

            setAppList(pending);
            setList(pending);
        });

        return () => unsubscribe();
    },[]);

    React.useEffect(()=>{
        const medRef = collection(db, "medDocuRequest");
        const q = query(medRef, where("status", "==", "ongoing"));
        
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const docs = [];

            for (const docSnapshot of querySnapshot.docs) {
                const medData = docSnapshot.data();
                const patientId = medData.patient;
    
                const userRef = doc(db, "users", patientId);
                const userSnapshot = await getDoc(userRef);
                const userData = userSnapshot.data();
    
                docs.push({
                    id: docSnapshot.id, 
                    ...medData,
                    patient_name: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown',
                    patient_photo: userData ? userData.profilePictureURL : null,
                });
            }

            setDocList(docs);
        });

        return () => unsubscribe();
    },[]);

    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 3;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = list.slice(indexOfFirstItem, indexOfLastItem);

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const submitForm = (appId, selectedDateTime) => {
        handleCreate(appId, selectedDateTime);
        handleCloseModal();
    };

    const handleCreate = async (appId, selectedDateTime) => {
        const appointment_id = appId;
        const dateApproved = new Date();
    
        if (!selectedDateTime) {
            console.error("selectedDateTime is null. Cannot create appointment.");
            return;
        }
    
        const date = selectedDateTime.toDate();
        const status = 1;
    
        try {
            await updateAssessment(appointment_id, dateApproved, date, status);
        } catch (error) {
            console.error("Error creating appointment:", error);
        }
    };
    

    const submitReject = (appId) => {
        handleReject(appId);
        handleCloseModal();
    }

    const handleReject = async (appId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this user account?");

        if(isConfirmed){
            try{
                await deleteAssessment(appId);
                alert("Appointment rejected successfully");
            } catch(e){
                console.error('Failed to reject appointment');
                alert("Failed to reject appointment");
            }
        } else {
            alert("Appointment Rejection cancelled.");
            handleCloseModal();
        }
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    
        if (event.target.value === "appointments") {
            setList(appList);
        } else if (event.target.value === "medDocuRequests") {
            setList(docList);
        }
    };


    return (
        <Paper sx={{px: 4, py: 2, width: '28.7vw', border: '1.5px solid rgba(0,0,0,0.2)', borderRadius: 2}}>
            <Box>
                <Box sx={{display:'flex', width: '100%'}}>
                    <Typography sx={{fontSize: 20, fontWeight: 'bold', flex: 1}}>Recent Requests</Typography>
                    <Select
                        value={filter}
                        onChange={handleFilterChange}
                        sx={{ mb: 2, width: '40%' }}
                    >
                        <MenuItem value="appointments">Appointments</MenuItem>
                        <MenuItem value="medDocuRequests">Medical Document Requests</MenuItem>
                    </Select>
                </Box>

                {list.length > 0 ? (
                    <>
                    {currentItems.map((item, index) => (
                        <React.Fragment key={item.id}>
                        {filter === 'appointments' ? (
                            <Box key={item.id} sx={{ mt: 2, background: 'rgba(255, 173, 51, 0.3)', px: 2, py: 1, borderRadius: 1, display: 'flex', alignItems: 'center' }}>
                                <Avatar alt={item.patient_name} src={item.patient_photo} sx={{width: 52, height: 52}}/>
                                <Box sx={{ml: 2, display: 'flex', flexDirection: 'column', flex:1}}>
                                    <Typography sx={{fontWeight: 'bold', fontSize: '20px'}}>{item.name}</Typography>
                                    <Typography sx={{fontSize: '18px'}}>{item.patient_name}</Typography>
                                    <Typography>{formatFirestoreTimestamp(item.date)}</Typography>
                                </Box>
                                <IconButton onClick={()=>handleOpenModal(item)}>
                                    <KeyboardArrowRightRoundedIcon/>
                                </IconButton>
                                <AppointmentCard 
                                        open={isModalOpen} 
                                        setClose={handleCloseModal} 
                                        isRequest={true}
                                        patients={selectedItem}
                                        submitForm={submitForm}
                                        submitReject={submitReject}
                                />
                            </Box>
                        ) : filter === 'medDocuRequests' ? (
                            <Box key={item.id} sx={{ mt: 2, background: 'rgba(255, 173, 51, 0.3)', px: 2, py: 1, borderRadius: 1, display: 'flex', alignItems: 'center' }}>
                                <Avatar alt={item.patient_name} src={item.patient_photo} sx={{width: 52, height: 52}}/>
                                <Box sx={{ml: 2, display: 'flex', flexDirection: 'column', flex:1}}>
                                    <Typography sx={{fontWeight: 'bold', fontSize: '20px'}}>{requestTypeMap[item.type]}</Typography>
                                    <Typography sx={{fontSize: '18px'}}>{item.patient_name}</Typography>
                                </Box>
                                <IconButton onClick={()=>handleOpenRequestModal(item)}>
                                    <KeyboardArrowRightRoundedIcon/>
                                </IconButton>
                                <MedRequestCard
                                    open={isRequestModalOpen}
                                    setClose={handleCloseRequestModal}
                                    patient={selectedItem}
                                />
                            </Box>
                        ) : (null)}
                    </React.Fragment>    
                    ))}
                    <Pagination 
                        count={Math.ceil(list.length / itemsPerPage)} 
                        page={currentPage} 
                        onChange={handleChangePage} 
                        sx={{ mt: 2, display: 'flex', justifyContent: 'center' }} 
                    />
                </>
                ) : (
                    <Box sx={{display: 'flex', flexDirection: 'column', justifyContent:'center', alignContent:'center', alignItems:'center', py: 8}}>
                        <PlaylistAddCheckCircleRoundedIcon sx={{fontSize: 100}}/>
                        <Typography>No requests found</Typography>
                    </Box>
                )}
                
            </Box>
        </Paper>
    );
}

function DataCount({ cardTitle, cardData, cardDescription, iconType }){
    
    const renderIcon = () => {
        switch(iconType) {
            case 'person':
                return <PersonOutlineOutlinedIcon color='white' sx={{fontSize: 42, background: 'rgba(105, 205, 245, 0.5)', borderRadius: 1.25}} />;
            case 'appointment':
                return <CalendarMonthOutlinedIcon color='white' sx={{fontSize: 42, background: 'rgba(105, 205, 245, 0.5)', borderRadius: 1.25}} />;
            default:
                return null;
        }
    }

    return(
        <Paper sx={{border: '1.5px solid rgba(0,0,0,0.2)', width: '14vw', borderRadius: 2, px: 2, py: 2}}>
            <Box sx={{display: 'flex', width: '100%', alignItems:'center'}}>
                {renderIcon()}
                <Typography sx={{fontSize: 16, fontWeight: '500', ml: 1}}>{cardTitle || 0}</Typography>
            </Box>
            <Typography sx={{fontSize: 48, fontWeight: '500'}}>{cardData || 0}</Typography>
            <Typography>{cardDescription}</Typography>
        </Paper>
    )

}

async function fetchPatients(){
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(query(collection(db, "users"), where("role", "==", 0)));
    let patients = [];
    
    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        patients.push({id: doc.id, ...userData});
    });

    return patients;
}

async function countPatient(){
    const usersRef = collection(db, "users");
    // Adding a query to filter users where 'doctor' field matches doctorId
    const queryConstraint = query(usersRef);
    const querySnapshot = await getDocs(queryConstraint);
    let count = 0;
    
    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.role === 0) { // Assuming '0' represents patients
            count++;
        }
    });

    return count;
}


async function countAppointment(){
    const appRef = collection(db, "appointments");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = Timestamp.fromDate(today);
    const q = query(appRef, where("date", ">=", todayTimestamp));

    const querySnapshot = await getDocs(q);
    let upcomingCount = 0;
    let pendingCount = 0;
    
    querySnapshot.forEach((doc) => {
        const appData = doc.data();
        if (appData.status === 0) {
            pendingCount++;
        } else if (appData.status === 1) {
            upcomingCount++;
        }
    });

    return { upcomingCount, pendingCount };
}

async function createAppointment(createdAt, date, doctor_assigned, name, patient_assigned, status) {
    const appRef = collection(db, "appointments");

    try {
        const docRef = await addDoc(appRef, {
            createdAt: createdAt,
            date: date,
            doctor_assigned: doctor_assigned,
            name: name,
            patient_assigned: patient_assigned,
            status: status,
        });

        await updateDoc(doc(db, "appointments", docRef.id), {
            uid: docRef.id
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding and updating document: ", e);
        throw e;
    }
}

async function fetchClinicInfo(id) {
    if (!id) {
        console.error('No clinic ID provided');
        return null;
    }

    const clinicRef = doc(db, "clinics", id);
    const clinicSnapshot = await getDoc(clinicRef);

    if (clinicSnapshot.exists()) {
        const clinicData = clinicSnapshot.data();
        return clinicData;
    } else {
        return null;
    }
}

function LoadingBox(){

    return(
        <Paper sx={{border: '1.5px solid rgba(0,0,0,0.2)', width: '16vw', borderRadius: 2, px: 2, py: 2}}>
            <Box sx={{display: 'flex', width: 'auto', alignItems:'center'}}>
                <Skeleton variant="circular" width={40} height={40}/>
                <Skeleton variant="text" sx={{ fontSize: '1rem', ml:1 }}/>
            </Box>
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
            <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
        </Paper>
    )

}

function Dashboard(){
    const { userData } = useUser();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filteredProducts, setFilteredProducts] = React.useState([]);
    const [isLoading, setisLoading] = React.useState(true);

    //Firebase Data
    const [patientList, setPatientList] = React.useState([]);
    const [patientCount, setPatientCount] = React.useState(0);
    const [upcomingCount, setUpcomingCount] = React.useState(0);
    const [pendingCount, setPendingCount] = React.useState(0);
    const [isModalOpen, setModalOpen] = React.useState(false);
    const [isTicketModalOpen, setTicketModalOpen] = React.useState(false);
    const [isAccountModalOpen, setAccountModalOpen] = React.useState(false);



    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => setModalOpen(false);

    const handleOpenAccountModal = () => setAccountModalOpen(true);
    const handleCloseAccountModal = () => setAccountModalOpen(false);

    const handleOpenTicketModal = () => setTicketModalOpen(true);
    const handleCloseTicketModal = () => setTicketModalOpen(false);

    React.useEffect(() => {
        if (searchQuery) {
            const filtered = patientList.filter(patient => {
                const firstNameMatch = patient.firstName && typeof patient.firstName === 'string' && patient.firstName.toLowerCase().includes(searchQuery.toLowerCase());
                const lastNameMatch = patient.lastName && typeof patient.lastName === 'string' && patient.lastName.toLowerCase().includes(searchQuery.toLowerCase());
                return firstNameMatch || lastNameMatch;
            });
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts([]);
        }
    }, [searchQuery, patientList]);
    
    

    React.useEffect(()=>{
        const fetchPatient = async () => {
            try{
                const patients = await fetchPatients(userData?.clinic);
                setPatientList(patients);
            } catch (error){
                console.error("Error fetching patients: ", error);
            } finally {
                setisLoading(false);
            }
        };

        fetchPatient();
    },[]);

    React.useEffect(()=>{
        const fetchPatientCount = async () => {
            try{
                const countData = await countPatient();
                setPatientCount(countData);
            } catch (error){
                console.error("Error fetching patient count: ", error);
            } finally {
                setisLoading(false);
            }
        }

        fetchPatientCount();
    },[]);

    React.useEffect(()=>{
        const fetchAppointmentCount = async () => {
            try {
                const { upcomingCount, pendingCount } = await countAppointment();
                setUpcomingCount(upcomingCount);
                setPendingCount(pendingCount);
            } catch (error) {
                console.error("Error fetching appointment counts: ", error);
            } finally {
                setisLoading(false);
            }
        }
    
        fetchAppointmentCount();
    }, []);

    const submitForm = (selectedPatient, selectedActivity, selectedDateTime) => {
        handleCreate(selectedPatient, selectedActivity, selectedDateTime);
        handleCloseModal();
    };

    const handleCreate = async (selectedPatient, selectedActivity, selectedDateTime) => {
        const createdAt = new Date(); 
        const date = selectedDateTime.toDate();
        const doctor_assigned = userData?.doctor;
        const name = selectedActivity;
        const patient_assigned = selectedPatient;
        const status = 0;
    
        try {
            await createAppointment(createdAt, date, doctor_assigned, name, patient_assigned, status);
        } catch (error) {
            console.error("Error creating appointment:", error);
        }
    };

    const handlePatientPage = (id) =>{
        router.push(`/patient?id=${id}`);
    }

    return(
        <Box>
            <SearchBar onSearchChange={setSearchQuery} />
            {filteredProducts.length > 0 && (
                <List sx={{background: 'white', mt: 0.5, width: '40vw', borderRadius: 4, py: 2, position: 'absolute'}}>
                    {filteredProducts.map((product, index) => (
                        <ListItem
                            onClick={()=>handlePatientPage(product.uid)}
                            sx={{cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                                }
                            }}
                            key={index}>{product.firstName} {product.lastName}</ListItem>
                    ))}
                </List>
            )}
            <Box sx={{display:'flex',  mt: 4, mb: 2, alignItems:'center'}}>
                <Typography sx={{fontSize: 32, fontWeight: '500', flex: 1}}>Hey, {userData?.firstName}</Typography>
                {/* <LocationOnIcon/> */}
                {/* <Typography>{clinicInfo.name}</Typography> */}
            </Box>
            <Box sx={{display: 'flex', gap: 2}}>
                {isLoading ? (
                    <>
                        <LoadingBox/>
                        <LoadingBox/>
                    </>
                ) : (
                    <>
                        <DataCount iconType={'person'} cardTitle={'Number of Patients'} cardData={patientCount} cardDescription={''}/>
                        <DataCount iconType={'appointment'} cardTitle={'Upcoming Appointments'} cardData={upcomingCount} cardDescription={`${pendingCount} Pending`}/>
                        <Paper sx={{justifyContent:'center', alignItems:'center', alignContent:'center', ml: 1.65}}>
                            <Box sx={{px: 5, py:2}}>
                                <IconButton sx={{flexDirection:'column', width: '6vw'}} onClick={handleOpenTicketModal}>
                                    <AddBoxRoundedIcon sx={{fontSize: '96px', color:'rgba(255, 173, 51)'}}/>
                                    <Typography>Create Patient Submission</Typography>
                                </IconButton>
                                <TicketCard 
                                    open={isTicketModalOpen} 
                                    setClose={handleCloseTicketModal} 
                                    patients={patientList}
                                />
                            </Box>
                        </Paper>
                    </>
                )}

            </Box>
            <Box sx={{mt:4, display:'flex', gap: 4}}>
                <RecentRequests/>
                <Box sx={{display:'flex', flexDirection:'column', gap: 2}}>
                    <Paper sx={{justifyContent:'center', alignItems:'center', alignContent:'center'}}>
                        <Box sx={{px: 2, py:2}}>
                            <IconButton sx={{flexDirection:'column'}} onClick={handleOpenModal}>
                                <AddBoxRoundedIcon sx={{fontSize: '96px', color:'rgba(255, 173, 51)'}}/>
                                <Typography>Create Appointment</Typography>
                            </IconButton>
                            <AppointmentCard 
                                open={isModalOpen} 
                                setClose={handleCloseModal} 
                                isRequest={false}
                                patients={patientList}
                                submitForm={submitForm}
                            />
                        </Box>
                    </Paper>

                    <Paper sx={{justifyContent:'center', alignItems:'center', alignContent:'center'}}>
                        <Box sx={{px: 2, py:2}}>
                            <IconButton sx={{flexDirection:'column'}} onClick={handleOpenAccountModal}>
                                <PersonAddAltRoundedIcon sx={{fontSize: '96px', color:'rgba(255, 173, 51)'}}/>
                                <Typography>Create New Account</Typography>
                            </IconButton>
                            <AccountCard
                                open={isAccountModalOpen}
                                setClose={handleCloseAccountModal}
                            />
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    )

}

export default Dashboard;
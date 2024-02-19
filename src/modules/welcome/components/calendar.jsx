import React, { useState } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Pagination, CircularProgress } from '@mui/material';
import { collection, getDocs, query, where, doc, getDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import '../../../app/page.module.css';
import { useUser } from '../../../../context/UserContext';

function formatFirestoreTimestamp(firestoreTimestamp) {
    if (!firestoreTimestamp || !firestoreTimestamp.toDate) {
        return 'Invalid Timestamp';
    }

    const dateObject = firestoreTimestamp.toDate();
    const formattedDate = dateObject.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const formattedTime = dateObject.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return `${formattedTime}`;
}

function ScheduleTable({ selectedDate }) {
    const { userData } = useUser();
    const [appointmentList, setAppointmentList] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = appointmentList.slice(indexOfFirstItem, indexOfLastItem);

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    React.useEffect(() => {
        const todayStart = new Date(selectedDate);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(selectedDate);
        todayEnd.setHours(23, 59, 59, 999);

        const todayStartTimestamp = Timestamp.fromDate(todayStart);
        const todayEndTimestamp = Timestamp.fromDate(todayEnd);

        const appRef = collection(db, "appointments");
        const q = query(
            appRef, 
            where("status", "==", 1),
            where("date", ">=", todayStartTimestamp),
            where("date", "<=", todayEndTimestamp),
            // where('doctor_assigned', 'array-contains-any', userData?.doctor)
        );

        setLoading(true);

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const appointments = [];

            for (const docSnapshot of querySnapshot.docs) {
                const appData = docSnapshot.data();
                const patientId = appData.patient_assigned;
                const userSnapshot = await getDoc(doc(db, "users", patientId));
                const userData = userSnapshot.data();

                appointments.push({
                    id: docSnapshot.id,
                    ...appData,
                    patient_name: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown'
                });
            }

            setAppointmentList(appointments);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [selectedDate]);

    const columnStyle = { fontSize: '20px' };
    const rowStyle = { fontSize: '18px' };

    return (
        <Paper sx={{width: '32vw',px: 4, py: 2}}>
            {isLoading ? (
                <Box sx={{display:'flex', justifyContent:'center'}}>
                    <CircularProgress color='secondary'/>
                </Box>
            )
            :
            (
                <>
                    <TableContainer component={Box}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={columnStyle}>Time</TableCell>
                                    <TableCell sx={columnStyle}>Name</TableCell>
                                    <TableCell sx={columnStyle}>Activity</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentItems.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={rowStyle}>{formatFirestoreTimestamp(item.date)}</TableCell>
                                        <TableCell sx={rowStyle}>{item.patient_name}</TableCell>
                                        <TableCell sx={rowStyle}>{item.name}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Pagination 
                    count={Math.ceil(appointmentList.length / itemsPerPage)} 
                    page={currentPage} 
                    onChange={handleChangePage} 
                />
            </Box>
        </Paper>
    );
}

function getCurrentDateFormatted() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const currentDate = new Date();
    const dayOfWeek = days[currentDate.getDay()];
    const month = months[currentDate.getMonth()];
    const dayOfMonth = currentDate.getDate();

    return `${month} ${dayOfMonth}, ${dayOfWeek}`;
}

function CalendarPanel(){

    const [selectedDate, setSelectedDate] = React.useState(dayjs(new Date()));
    const todayFormatted = getCurrentDateFormatted();

    return(
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                <Typography sx={{fontSize: 32}}>Calendar</Typography>
                <Box sx={{display:'flex', mb: 2}}>
                    {/* <Typography sx={{fontSize: 32, fontWeight: 'bold', mb: 5}}>{todayFormatted}</Typography> */}
                        <DatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            renderInput={(params) => <TextField {...params} className='myDatePicker'/>}
                        />
                </Box>
                <ScheduleTable selectedDate={selectedDate.toDate()} />
            </Box>
        </LocalizationProvider>
    )

}

export default CalendarPanel;
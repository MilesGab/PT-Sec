    import React from 'react';
    import SearchIcon from '@mui/icons-material/Search';
    import { Box, Divider, InputAdornment, TextField, Typography } from '@mui/material';
    import Messages from '../messages';
    import { useUser } from '../../../../../context/UserContext';
    import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
    import { db } from '@/app/firebaseConfig';
    import MessageCard from './components/MessageCard';

    function SearchBar({ onSearchChange }){
        return(
            <Box sx={{width: '100%', mb: 2}}>
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
                    placeholder='Search Messages'
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

    async function fetchSecretary(){
        const querySnapshot = await getDocs(query(collection(db, "users"), where("role", "==", 2)));
        let patients = [];
        
        querySnapshot.forEach((doc) => {
            const userData = doc.data();
            patients.push({id: doc.id, ...userData});
        });

        return patients;
    }

    async function fetchDoctorArray(doctorIds) {
        try {
            let doctors = [];
    
            for (const doctorId of doctorIds) {
                const docRef = doc(db, "users", doctorId);
                const docSnap = await getDoc(docRef);
    
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    doctors.push({ id: docSnap.id, ...userData });
                } else {
                    console.log(`No such document with id: ${doctorId}`);
                }
            }
    
            return doctors;
    
        } catch (error) {
            console.error("Error fetching documents: ", error);
            return null;
        }
    }
    

    export default function ChatList(){
        const { userData } = useUser();
        const [userList, setUserList] = React.useState([]);
        const [secList, setSecList] = React.useState([]);
        const [doctorList, setDoctorList] = React.useState([]);
        const [adminData, setAdminData] = React.useState({});
        const [filteredUserList, setFilteredUserList] = React.useState([]);
        const [selectedPatient, setSelectedPatient] = React.useState(null);

        const getPatients = async() =>{
            const patientData = await fetchPatients();
            setUserList(patientData);
            setFilteredUserList(patientData);
        };

        const getDoctors = async() =>{
            if(userData?.doctor){
                const doctorData = await fetchDoctorArray(userData?.doctor);
                setDoctorList(doctorData);
            } else{
                console.log('user data: ',userData);
            }
        };

        const getSecretary = async() =>{
            if(userData?.role === 3) {
                const secData = await fetchSecretary();
                setSecList(secData);
            } else {

            }
        };

        React.useEffect(() => {
            console.log(doctorList);
        }, [doctorList]);

        React.useEffect(()=>{

            getPatients();
            getDoctors();
            getSecretary();

        },[userData]);

        const handleChat = (id) => {
            setSelectedPatient(id);
        };
        
        const handleSearchChange = (searchTerm) => {
            if (searchTerm.length === 0) {
                getPatients();
                getDoctors();
            };

            const lowerCaseSearchTerm = searchTerm.toLowerCase();
    
            const filterUsers = (users) => users.filter((item) => {
                const firstNameMatch = item.firstName?.toLowerCase().startsWith(lowerCaseSearchTerm);
                const lastNameMatch = item.lastName?.toLowerCase().startsWith(lowerCaseSearchTerm);
                return firstNameMatch || lastNameMatch;
            });
    
            setUserList(filterUsers(userList));
            setDoctorList(filterUsers(doctorList));
        };

        return(
            <Box sx={{width: '100%', display:'flex'}}>
                <Box sx={{px: 6, py: 4, minWidth: 400}}>
                    <Typography sx={{fontWeight:'bold', fontSize: 32}}>Messages</Typography>
                    <SearchBar onSearchChange={handleSearchChange} />
                    {userData?.role !== 3 ? (
                        <>
                            <Typography sx={{fontWeight:'500', fontSize: 24}}>Doctors</Typography>
                            {doctorList.map((item)=>(
                                <Box key={item.id} onClick={()=>handleChat(item.id)}>
                                    <MessageCard {...item}/>
                                </Box>
                            ))}
                            <Typography sx={{fontWeight:'500', fontSize: 24}}>Patients</Typography>
                            {userList.map((item) => (
                                <Box key={item.id} onClick={()=>handleChat(item.id)}>
                                    <MessageCard {...item}/>
                                </Box>
                            ))}
                        </>
                    ) : (
                        <>
                        {secList.map((item)=>(
                            <Box key={item.id} onClick={()=>handleChat(item.id)}>
                                <MessageCard {...item}/>
                            </Box>
                        ))}
                        </>
                    )}

                </Box>
                <Divider orientation='vertical'/>
                <Box sx={{width:'100%'}}>
                    <Messages patientDataProp={selectedPatient}/>
                </Box>
            </Box>
        )

    };
'use client'
import React from 'react';
import styles from '../page.module.css';
import { Box, Button, CircularProgress, FormControl, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import HttpsIcon from '@mui/icons-material/Https';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter } from 'next/navigation';

import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { UserAuth } from '../../../context/AuthContext';

async function getAllUsersFromFirestore(){
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(collection(db, "users"));
    let users = [];
    
    querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({ ...userData});
    });

    return users;
}

export default function Login () {

    const { logIn } = UserAuth();
    const router = useRouter();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [error, setError] = React.useState('');

    const [isLoading, setIsLoading] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
  
    const handleMouseDownPassword = (event) => {
      event.preventDefault();
    };

    const handleLogin = async () => {
        if (!email && !password) {
            setError('Email and password are required');
            return;
        }
        if (!email) {
            setError('Email is required');
            return;
        }
        if (!password) {
            setError('Password is required');
            return;
        }
        setIsLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            router.push("/welcome");
        } catch (error) {
            console.error('Login Error: ', error);
            setError('Incorrect Credentials')
        } finally {
            setIsLoading(false);
        }
    }

    return(
            <main className={styles.main}>
                <Box className={styles.login_container}>
                    <Box className={styles.form_container}>
                        <Typography sx={{
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '32px',
                            color: 'rgb(255, 173, 51)',
                            mb: '2.25vh'
                            }}>Log In</Typography>
                        <FormControl sx={{gap: 1.25}}>
                            <TextField
                                variant="outlined"
                                placeholder="Email"
                                InputProps={{
                                    startAdornment: 
                                        <InputAdornment position="start">
                                            <EmailIcon/>
                                        </InputAdornment>
                                }}
                                onChange={e => {
                                    setEmail(e.target.value);
                                }}
                                fullWidth
                            />
                            <TextField
                                type={showPassword ? "text" : "password"}
                                variant="outlined"
                                placeholder="Password"
                                InputProps={{
                                    startAdornment: 
                                        <InputAdornment position="start">
                                            <HttpsIcon/>
                                        </InputAdornment>,
                                    endAdornment:
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                }}
                                onChange={e => {
                                    setPassword(e.target.value);
                                }}
                                fullWidth
                            />
                            {error && <Typography color="error">{error}</Typography>}
                            <Button 
                                variant="contained" 
                                color="secondary"
                                onClick={()=>handleLogin()}
                                sx={{color:'white', mx: '8vw', py: '0.5vw', mt: '2.25vh'}}>{isLoading ? <CircularProgress size={24} /> : "Log In"}</Button>
                        </FormControl>
                    </Box>
                </Box>
            </main>
    )

}


'use client'
import React from 'react';
import styles from '../page.module.css';
import { Box, Button, CircularProgress, FormControl, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import HttpsIcon from '@mui/icons-material/Https';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter } from 'next/navigation';
import PTIcon from '../../app/favicon.ico';
import Image from 'next/image';
import { setPersistence, browserLocalPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebaseConfig';

const ErrorMap = {
    'Firebase: Error (auth/wrong-password).' : 'Wrong password',
    'Firebase: Error (auth/invalid-email).' : 'Please use a valid email.',
    'Firebase: Error (auth/user-not-found).' : 'User does not exist in the database.'
};

export default function Login () {
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

    const handleLogin = async (event) => {
        event.preventDefault();
        if (!email || !password) {
            setError('Email and password are required');
            return;
        }
        setIsLoading(true);
        try {
            await setPersistence(auth, browserLocalPersistence);
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/welcome");
        } catch (error) {
            console.error('Login Error: ', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <Box className={styles.login_container}>
                <Box className={styles.form_container}>
                    <Box sx={{display:'flex', alignItems:'center', gap: 2, mb: '1vh'}}>
                        <Image src={PTIcon} width={40} alt="Pocket Therapist Icon"/>
                        <Typography sx={{fontWeight: 500, fontSize: 20}}>Pocket Therapist</Typography>
                    </Box>

                    <Box sx={{mb: '2.5vh'}} className={styles.title_container}>
                        <Typography sx={{
                            textAlign: 'left',
                            fontWeight: 'bold',
                            fontSize: '32px',
                            color: 'rgb(255, 173, 51)',
                            }}>Log In</Typography>
                        <Typography sx={{
                            textAlign: 'left',
                            fontSize: '16px',
                            color: '#696969',
                            }}>Welcome to the Pocket Therapist Management System</Typography>
                    </Box>

                    <form onSubmit={handleLogin}>
                        <FormControl sx={{gap: 1.25}} fullWidth>
                            <TextField
                                variant="outlined"
                                placeholder="Email"
                                InputProps={{
                                    startAdornment: 
                                        <InputAdornment position="start">
                                            <EmailIcon/>
                                        </InputAdornment>
                                }}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
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
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                fullWidth
                            />
                            {error && <Typography color="error">{ErrorMap[error]}</Typography>}
                            <Button 
                                type="submit" // This makes the button submit the form
                                disableElevation
                                variant="contained" 
                                color="secondary"
                                sx={{color:'white', py: '0.5vw', mt: '2.25vh', width: '100%'}}
                            >
                                {isLoading ? <CircularProgress size={24} /> : "Log In"}
                            </Button>
                        </FormControl>
                    </form>
                </Box>
            </Box>
        </main>
    );
}

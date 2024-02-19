import React from 'react';
import { Box, Button, IconButton, Modal, TextField, Typography } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/app/firebaseConfig';


export default function ChangePassword({ open, setClose, patient }){
    
    const [password, setPassword] = React.useState('');


    const handleChangePassword = async () => {
        const changePasswordFunction = httpsCallable(functions, 'changeUserPassword');
    
        try {
            await changePasswordFunction({ userId: patient.id, newPassword: password });
            alert('Password changed successfully');
            handleClose();
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Failed to change password');
        }
    };

    const boxStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        borderRadius: 2,
        px: 4,
        py: 2,
    };

    const handleClose = () => {
        setPassword('');
        setClose();
    };

    return(
        <Modal
            open={open}
            onClose={handleClose}        
        >
            <Box sx={boxStyle}>
                <Box sx={{display:'flex', alignItems:'center'}}>
                    <Typography sx={{fontSize: '20px',flex: 1}}>Change Password for: {patient.firstName}</Typography>
                    <IconButton onClick={setClose}>
                        <CloseRounded/>
                    </IconButton>
                </Box>
                <Box sx={{my: 4}}>
                    <Typography>New Password</Typography>
                    <TextField
                        fullWidth
                        value={password}
                        onChange={(e)=>{setPassword(e.target.value)}}
                    />
                </Box>
                <Box sx={{display:'flex', justifyContent: 'flex-end'}}>
                    <Button onClick={handleChangePassword} variant='contained'>Confirm</Button>
                </Box>

            </Box>
        </Modal>
    )

}
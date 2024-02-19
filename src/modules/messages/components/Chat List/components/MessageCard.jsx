import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';



export default function MessageCard(item){

    const [isClicked, setIsClicked] = React.useState(false);

    const handleClick = () => {
        setIsClicked(true);
    };
    
    const handleMouseUp = () => {
      setIsClicked(false);
    }
    

    return(
        <Box 
            onMouseDown={handleClick}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            sx={{
                display:'flex', 
                p: 2, 
                borderRadius: 2, 
                gap: 2, 
                alignItems:'center',
                cursor: 'pointer',
                userSelect:'none',
                '&:hover':{
                    background: isClicked ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)'
                }
            }}
        >
            <Box>
                <Avatar
                    src={item.profilePictureURL} 
                    alt={item.firstName} 
                    sx={{width: 52, height: 52}}
                />
            </Box>
            <Box>
                <Typography sx={{fontWeight:'500'}}>{`${item?.firstName} ${item?.lastName}` || 'First Name'}</Typography>
                {/* <Typography>{`${item?.firstName} ${item?.lastName}` || 'First Name'}</Typography> */}
            </Box>
        </Box>
    )

}
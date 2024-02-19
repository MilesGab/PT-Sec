import React from 'react';
import { Avatar, Box, Divider, Grow, IconButton, Paper, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import { useRouter } from 'next/navigation';

function aggregateNotifications(notifications) {
    // Filter for notifications with status 'unread'
    const unreadNotifications = notifications.filter(notification => notification.status === 'unread'  && notification.type === 'message');

    const grouped = unreadNotifications.reduce((acc, notification) => {
        // Group notifications by sender_id
        if (!acc[notification.sender_id]) {
            acc[notification.sender_id] = [];
        }
        acc[notification.sender_id].push(notification);
        return acc;
    }, {});

    return Object.entries(grouped).flatMap(([senderId, messages]) => {
        // If a group has more than 2 messages, replace it with a single summary message
        if (messages.length > 2) {
            return [{
                id: senderId,
                content: `${messages.length} unread messages`,
                status: 'unread',
                sender_name: messages[0].sender_name,
            }];
        }
        return messages.map(message => ({
            id: senderId,
            content: message.content,
            status: message.status,
            sender_name: message.sender_name,
        }));
    });
}


export default function NotificationMenu({ open, setClose, list }){
    const router = useRouter();
    const [isLoading, setLoading] = React.useState(false);
    const [show, setShow] = React.useState(open);
    const [clickedItemId, setClickedItemId] = React.useState(null);

    const aggregatedList = aggregateNotifications(list);
    const appList = list.filter(item => item.type === 'appointment');


    const handleMouseDown = (itemId) => {
        setClickedItemId(itemId);
        router.push(`/messages?patientData=${itemId}`);
    };

    const handleMouseUp = () => {
        setClickedItemId(null);
    };
    React.useEffect(() => {
        setShow(open);
    }, [open]);

    return(
        <Grow in={show}>
            <Paper sx={{position: 'absolute', right: 50, bottom: 20, py: 2, px: 2, width: '20vw'}}>
                <Box sx={{display:'flex', alignItems:'center', px: 2}}>
                    <Typography sx={{flex: 1, fontWeight: 'bold'}}>Notifications</Typography>
                    <IconButton onClick={setClose}>
                        <CloseIcon/>
                    </IconButton>
                </Box>
                <Divider/>
                {list.length > 0 ? (
                    <Box sx={{px: 2, py: 2}}>
                        <Typography sx={{fontWeight:'bold'}}>Messages</Typography>
                        {aggregatedList.map((item)=>(
                            <Box key={item.id}
                                onMouseDown={() => handleMouseDown(item.id)}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                sx={{
                                    display:'flex',
                                    alignItems:'center',
                                    gap: 1.25,
                                    py: 1,
                                    px: 1,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: clickedItemId === item.id ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)',
                                        transition: 'background-color 0.2s',

                                    },
                                    // backgroundColor: clickedItemId === item.id ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
                                    transition: 'background-color 0.2s',
                                }}    
                            >
                                <Avatar alt="Miles Macabeo"/>
                                <Box sx={{userSelect:'none'}}>
                                    <Typography sx={{fontWeight: item.status == 'unread' ? 800 : 500}}>{item.sender_name}</Typography>
                                    <Typography sx={{fontWeight: item.status == 'unread' ? 500 : 400}}>{item.content}</Typography>
                                </Box>
                            </Box>
                        ))}
                        {/* <Typography sx={{fontWeight:'bold'}}>Appointment Requests</Typography> */}
                        {appList.map((item) => (
                            <Box key={item.id}
                                onMouseDown={() =>{}}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                sx={{
                                    display:'flex',
                                    alignItems:'center',
                                    gap: 1.25,
                                    py: 1,
                                    px: 1,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: clickedItemId === item.id ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.04)',
                                        transition: 'background-color 0.2s',

                                    },
                                    // backgroundColor: clickedItemId === item.id ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
                                    transition: 'background-color 0.2s',
                                }}    
                            >
                                <Avatar alt="Miles Macabeo"/>
                                <Box sx={{userSelect:'none'}}>
                                    <Typography sx={{fontWeight: item.status == 'unread' ? 800 : 500}}>{item.sender_name}</Typography>
                                    <Typography sx={{fontWeight: item.status == 'unread' ? 500 : 400}}>{item.content}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                    ) : (
                    <Box sx={{display:'flex', flexDirection:'column', width:'100%', alignItems:'center', py: 4}}>
                        <FactCheckRoundedIcon sx={{fontSize: '6rem'}}/>
                        <Typography>No notifications</Typography>
                    </Box>
                )}
            </Paper>
        </Grow>
    )

}
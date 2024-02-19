import React from 'react';
import { Box, IconButton, Badge } from '@mui/material';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import NotificationMenu from './NotificationMenu';

import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/app/firebaseConfig';
import { useUser } from '../../context/UserContext';
import useSound from 'use-sound';

export default function NotificationButton() {
    const { userData } = useUser();
    const [list, setList] = React.useState([]);
    const [isVisible, setVisible] = React.useState(false);
    const [notificationCount, setNotificationCount] = React.useState(0);
    
    const soundUrl = '/assets/notification.mp3';
    const [playNotificationSound, {stop}] = useSound(soundUrl);

    const toggleMenu = () => {
        setVisible(prev => !prev);
    };
    

    React.useEffect(() => {
        if (userData && userData.uid) {
            const notificationsRef = collection(db, 'notifications');
            const q = query(notificationsRef, where('recipient_id', '==', userData?.uid));

            const unsubscribe = onSnapshot(q, async (snapshot) => {
                const newNotifications = [];

                for (const docSnapshot of snapshot.docs) {
                    const notifData = docSnapshot.data();
                    const senderId = notifData.sender_id;
                    const userSnapshot = await getDoc(doc(db, "users", senderId));
                    const userData = userSnapshot.data();

                    newNotifications.push({
                        id: docSnapshot.id,
                        ...notifData,
                        sender_name: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown'
                    })
                }

                if (newNotifications.length > list.length){
                    playNotificationSound();
                }

                setList(newNotifications);
            });

            return () => unsubscribe(); 
        }
    }, [userData]);

    React.useEffect(() => {
        const unreadCount = list.filter(notification => notification.status === 'unread').length;
        setNotificationCount(unreadCount);
    }, [list, setNotificationCount]);

    React.useEffect(()=>{
        console.log(list);
    },[list]);

    return (
        <Box>
            {isVisible && <NotificationMenu open={isVisible} setClose={() => setVisible(false)} list={list} />}
            {notificationCount > 0 ? (
                <Badge badgeContent={notificationCount} color="error">
                    <IconButton 
                        sx={{
                            background: 'white',
                            boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)'
                        }}
                        size='large'
                        onClick={toggleMenu}
                    >
                        <NotificationsRoundedIcon />
                    </IconButton>
                </Badge>
            ) : (
                <IconButton 
                    sx={{
                        background: 'white',
                        boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.16)'
                    }}
                    size='large'
                    onClick={toggleMenu}
                >
                    <NotificationsRoundedIcon />
                </IconButton>
            )}
        </Box>
    );
};

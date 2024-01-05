'use client'
import { Box, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import React from 'react';

import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

import { auth, db } from '../src/app/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { UserAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';


export default function SideBar(){
    const [drawerWidth, setDrawerWidth] = React.useState(80);
    const router = useRouter();
    const currentPath = usePathname();
    const { user, logOut } = UserAuth();
    const [mobileOpen, setMobileOpen] = React.useState(true);
    const [isLoading, setisLoading] = React.useState(false);

    const listItems = [
        { icon: <SpaceDashboardOutlinedIcon fontSize='large'/>, key: 'Dashboard', route: 'welcome' },
        { icon: <PersonOutlineOutlinedIcon fontSize='large'/>, key: 'Patients', route: 'patients' },
        { icon: <SettingsOutlinedIcon fontSize='large'/>, key: 'Settings', route:'settings' },
    ];

    React.useEffect(()=>{
        console.log('Current Path: ',currentPath);
    },[])

    const handleDrawerToggle = () => {
      setMobileOpen(!mobileOpen);
      if(drawerWidth == 240){
        setDrawerWidth(80);
      } else {
        setDrawerWidth(240);
      }
    };

    const handleSignOut = async () => {
        try{
            await logOut();
            router.push("/login");
        } catch(error) {
            console.log(error);
        }
    };

    // React.useEffect(() => {
    //     const checkAuthentication = async () => {
    //       await new Promise((resolve) => setTimeout(resolve, 200));
    //       if (user == null){
    //         await logOut();
    //         router.push("/login");
    //       }
    //       console.log(user);
    //       setisLoading(false);
    //     };
    //     checkAuthentication();
    //   }, [user]);
    
    const handleNavigation = (route) => {
        return () => {
            router.push(`/${route}`);
        };
    };

    const drawer = (
        <>
        <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            py: 1.25,
            px: 1
        }}>
            <IconButton
                onClick={handleDrawerToggle}
                sx={{ 
                    display: { sm: 'flex', xs: 'flex' },
                    background: 'rgba(0,0,0, 0)',
                    borderRadius: 2.25,
                    '.MuiTouchRipple-ripple .MuiTouchRipple-child': {
                        borderRadius: 2.25,
                      },
                }}
            >
                <ClearAllIcon sx={{color: '#696969'}}/>
            </IconButton>
        </Box>
        <Divider/>
        <List sx={{ flex: 1, overflowX: 'hidden' }}>
            {listItems.map(item => (
                <ListItem key={item.key} sx={{ mb: 2 }}>
                    <ListItemButton
                        onClick={handleNavigation(item.route)}
                        sx={{
                            justifyContent: 'center', 
                            borderRadius: 4,
                            backgroundColor: currentPath === `/${item.route}` ? 'rgba(255, 173, 51, 0.3)' : 'transparent', // Highlight if current path
                            '&:hover': {
                                backgroundColor: currentPath === `/${item.route}` ? 'rgba(255, 173, 51, 0.9)' : 'rgba(0, 0, 0, 0.04)',
                            },
                            pointerEvents: currentPath === `/${item.route}` ? 'none' : 'auto', // Disable clicking if current path
                        }}
                    >
                        <ListItemIcon 
                            sx={{ display: 'flex', justifyContent: 'center', fontSize: 'large', 
                                color: currentPath === `/${item.route}` ? 'rgba(242, 147, 5, 1)' : 'rgba(0,0,0,0.4)'
                            }}
                        >
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                            sx={{
                                color: currentPath === `/${item.route}` ? 'rgba(242, 147, 5, 1)' : 'rgba(0,0,0,0.4)'
                            }}
                            primary={item.key}/>
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
        <Divider/>
        <Box sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            py: 1.25,
            px: 1
        }}>
            <IconButton
                onClick={handleSignOut}
                sx={{ 
                    display: { sm: 'flex', xs: 'flex' },
                    gap: 1.25,
                }}>
                <LogoutIcon sx={{color: '#696969'}}/>
                <Typography>Log Out</Typography>
            </IconButton>
        </Box>
        </>
    )

    const drawerClose = (
        <>
            <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            py: 1.25,
            px: 1,
        }}>
            <IconButton
                onClick={handleDrawerToggle}
                sx={{ 
                    display: { sm: 'flex', xs: 'flex' },
                    background: 'rgba(0,0,0, 0)',
                    borderRadius: 2.25,
                    '.MuiTouchRipple-ripple .MuiTouchRipple-child': {
                        borderRadius: 2.25,
                      },
                }}
            >
                <ClearAllIcon sx={{color: '#696969'}}/>
            </IconButton>
        </Box>
        <Divider/>
        <List sx={{ flex: 1, overflowX: 'hidden' }}>
            {listItems.map(item => (
                <ListItem key={item.key} sx={{ mb: 2 }}>
                    <ListItemButton
                        onClick={handleNavigation(item.route)}
                        sx={{
                            justifyContent: 'center', 
                            borderRadius: 4,
                            backgroundColor: currentPath === `/${item.route}` ? 'rgba(255, 173, 51, 0.3)' : 'transparent', // Highlight if current path
                            '&:hover': {
                                backgroundColor: currentPath === `/${item.route}` ? 'rgba(255, 173, 51, 0.9)' : 'rgba(0, 0, 0, 0.04)',
                            },
                            pointerEvents: currentPath === `/${item.route}` ? 'none' : 'auto', // Disable clicking if current path
                        }}
                    >
                        <ListItemIcon 
                            sx={{ display: 'flex', justifyContent: 'center', fontSize: 'large', 
                                color: currentPath === `/${item.route}` ? 'rgba(242, 147, 5, 1)' : 'rgba(0,0,0,0.4)'
                            }}
                        >
                            {item.icon}
                        </ListItemIcon>
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
        <Divider/>
        <Box sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            py: 1.25,
            px: 1
        }}>
            <IconButton
                onClick={handleSignOut}
                sx={{ 
                    display: { sm: 'flex', xs: 'flex' },
                    gap: 1.25,
                }}>
                <LogoutIcon sx={{color: '#696969'}}/>
            </IconButton>
        </Box>
        </>
    )


    return(
        isLoading ? null : (
            <Box>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'block', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, transition: 'width .3s ease-in-out' },
                    }}
                >
                    {mobileOpen ? (
                        <>
                        {drawerClose}
                        </>
                    ) : (
                        <>
                        {drawer}
                        </>
                    )}
                </Drawer>
            </Box>
        )
    )
}


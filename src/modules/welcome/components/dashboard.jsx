import React from 'react';
import { Box, InputAdornment, List, ListItem, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

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

function DataCount({ cardTitle, cardData, cardDescription }){
    
    return(
        <Box sx={{border: '1.5px solid rgba(0,0,0,0.2)', width: '14vw', borderRadius: 2, px: 2, py: 2}}>
            <Box sx={{display: 'flex', width: '100%', alignItems:'center'}}>
                <PersonOutlineOutlinedIcon color='white' sx={{fontSize: 42,background: 'rgba(105, 205, 245, 0.5)', borderRadius: 1.25}}/>
                <Typography sx={{fontSize: 16, fontWeight: '500', ml: 1}}>{cardTitle || '---'}</Typography>
            </Box>
            <Typography sx={{fontSize: 48, fontWeight: '500'}}>{cardData || '---'}</Typography>
            <Typography>{cardDescription}</Typography>
        </Box>
    )

}

function Dashboard(){
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filteredProducts, setFilteredProducts] = React.useState([]);
    const products = ['Watch', 'Wallet', 'Shoe', 'Sunglasses'];

    React.useEffect(() => {
        if (searchQuery) {
            const filtered = products.filter(product => 
                product.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts([]);
        }
    }, [searchQuery]);

    return(
        <Box>
            <SearchBar onSearchChange={setSearchQuery} />
            {filteredProducts.length > 0 && (
                <List sx={{background: 'white', mt: 0.5, width: '40vw', borderRadius: 4, py: 2}}>
                    {filteredProducts.map((product, index) => (
                        <ListItem
                            sx={{cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.1)'
                                }
                            }}
                            key={index}>{product}</ListItem>
                    ))}
                </List>
            )}
            <Typography sx={{fontSize: 32, fontWeight: '500', mt: 4}}>Hey, Miles</Typography>
            <Box sx={{display: 'flex', gap: 2}}>
                <DataCount cardTitle={'Number of Patients'} cardData={32} cardDescription={'4 New Patients'}/>
                <DataCount cardTitle={'Upcoming Appointments'} cardData={4} cardDescription={'2 Pending'}/>
                <DataCount cardTitle={'New Assessments'} cardData={4} cardDescription={''}/>
            </Box>
        </Box>
    )

}

export default Dashboard;
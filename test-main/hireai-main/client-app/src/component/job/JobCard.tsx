import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Job } from '../../api/models';
import Modal from '@mui/material/Modal';
import * as React from 'react';
import JobDetailsPreview from './JobdetailPreview';
import Moment from 'react-moment';

export default function JobCard(props: { jobDetails: Job }) {
 const { jobDetails } = props;

 const [open, setOpen] = React.useState(false);
 const handleOpen = (e) => {
 e.stoppropagation()
 setOpen(true)
 };
 const handleClose = () => setOpen(false);

 const style = {
 position: 'absolute' as 'absolute',
 top: '50%',
 left: '50%',
 transform: 'translate(-50%, -50%)',
 width: 400,
 bgcolor: 'background.paper',
 border: '2px solid #000',
 boxShadow: 24,
 p: 4,
 };

 return (
 <Card
 key={jobDetails.id}
 variant="outlined"
 component={Button}
 // onClick={() => handleItemClick(index)}
 sx={{
 p: 3,
 height: 'fit-content',
 width: '100%',
 background: 'none',
 borderColor: (theme) => {
 return theme.palette.mode === 'light' ? 'grey.200' : 'grey.800';
 },
 }}>
 <Box
 sx={{
 width: '100%',
 display: 'flex',
 textAlign: 'left',
 flexDirection: { xs: 'column', md: 'row' },
 alignItems: { md: 'center' },
 gap: 2.5,
 }}>
 <Box
 sx={{
 width: '5%',
 color: (theme) => {
 return theme.palette.mode === 'light' ? 'grey.300' : 'grey.700';
 },
 }}>
 <img src="img/svg_icon/1.svg" alt="" />
 </Box>
 <Box sx={{ width: '80%', textTransform: 'none' }}>
 <Typography color="text.primary" variant="body2" fontWeight="bold">
 {jobDetails.title}
 </Typography>
 <Typography color="text.secondary" variant="body2" sx={{ my: 0.5 }} >
 {jobDetails.summary}
 </Typography>
 <JobDetailsPreview
 jobDetail_id={jobDetails.id} />
 </Box>
 <Box sx={{ width: '15%', textTransform: 'none' }}>
 <Button
 sx={{ p: 2.5 }}
 variant="contained"
 href={`job-details/${jobDetails.id}`}>
 Apply Now
 </Button>
 
 <Typography color="text.secondary" variant="body2" sx={{ my: 0.5 }}>
 <b >Created:</b> <Moment format="DD-MM-YYYY">
 {jobDetails.time_created}
 </Moment>
 </Typography>
 <Typography color="text.secondary" variant="body2" sx={{ my: 0.5 }}>
 <b >Location:</b>
 {jobDetails.job_locations}
 </Typography>
 </Box>
 </Box>
 </Card>
 );}
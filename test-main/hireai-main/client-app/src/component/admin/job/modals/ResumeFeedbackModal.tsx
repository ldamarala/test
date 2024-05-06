import { useState } from 'react';
import { AiInterview, JobApplication } from '../../../../api/models';
import { Box, Button, Card, CardMedia, Modal, Typography } from '@mui/material';
import { STATIC_CONTENT_GATEWAY_HOST } from '../../../../api/axios';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function ResumeFeedbackModal(props: {
  aiInterview: AiInterview;
  jobApplication: JobApplication;
}) {
  const { aiInterview, jobApplication } = props;
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>Feedback</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Resume: {jobApplication.candidate.firstname}{' '}
            {jobApplication.candidate.lastname}
          </Typography>
          <Card>
            <CardMedia
              sx={{ height: 500 }}
              component="iframe"
              src={`${STATIC_CONTENT_GATEWAY_HOST}/uploads/resumes/interview_feedback_${aiInterview.id}.pdf`}
            />
          </Card>
        </Box>
      </Modal>
    </div>
  );
}

export default ResumeFeedbackModal;

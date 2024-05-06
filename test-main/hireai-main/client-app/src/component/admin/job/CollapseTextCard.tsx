import { Collapse, Typography } from '@mui/material';
import { useState } from 'react';

function CollapseTextCard(props: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const { text } = props;

  return (
    <>
      {(text && text.length > 80 && (
        <span onClick={() => setExpanded(!expanded)}>
          <Collapse collapsedSize={200} in={expanded} style={{marginBottom:0}}>
            <Typography>{text}</Typography>
          </Collapse>
        </span>
      )) || <Typography>{text}</Typography>}
    </>
  );
}

export default CollapseTextCard;

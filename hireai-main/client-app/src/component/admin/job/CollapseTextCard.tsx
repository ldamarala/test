import { Collapse, Typography } from '@mui/material';
import { useState } from 'react';

function CollapseTextCard(props: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const { text } = props;

  return (
    <>
      {(text && text.length > 100 && (
        <span onClick={() => setExpanded(!expanded)}>
          <Collapse collapsedSize={100} in={expanded}>
            <Typography>{text}</Typography>
          </Collapse>
        </span>
      )) || <Typography>{text}</Typography>}
    </>
  );
}

export default CollapseTextCard;

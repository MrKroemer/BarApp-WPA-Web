import React from 'react';
import { Card, Fade, Grow } from '@mui/material';

const AnimatedCard = ({ 
  children, 
  delay = 0, 
  animation = 'fade',
  duration = 300,
  ...cardProps 
}) => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const AnimationComponent = animation === 'grow' ? Grow : Fade;

  return (
    <AnimationComponent in={show} timeout={duration}>
      <Card
        sx={{
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.palette.mode === 'light' 
              ? '0 8px 24px rgba(0,0,0,0.15)' 
              : '0 8px 24px rgba(0,0,0,0.4)',
          },
          ...cardProps.sx
        }}
        {...cardProps}
      >
        {children}
      </Card>
    </AnimationComponent>
  );
};

export default AnimatedCard;
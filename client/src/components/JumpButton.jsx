// src/components/JumpButton.jsx
import React from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

const JumpButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  border: '1px solid transparent',
  padding: '0.6em 1.4em',
  fontWeight: 600,
  backgroundColor: 'rgba(108, 75, 205, 0.85)',
  color: '#fff',
  boxShadow: '0 2px 8px rgba(108, 75, 205, 0.5)',
  transition: 'background-color 0.25s ease, border-color 0.25s ease, transform 0.15s ease',
  textTransform: 'none', // para que no ponga texto en mayúsculas
  '&:hover': {
    backgroundColor: '#b3aaff',
    borderColor: '#8c7bff',
    color: '#2c2c54',
    boxShadow: '0 4px 12px rgba(179, 170, 255, 0.8)',
    transform: 'translateY(-4px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&:focus-visible': {
    outline: '3px solid #b3aaff',
    outlineOffset: 2,
  },
}));

export default function CustomJumpButton(props) {
  return <JumpButton {...props} />;
}

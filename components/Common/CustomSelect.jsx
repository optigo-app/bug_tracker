import React from 'react';
import { Select, MenuItem, Box } from '@mui/material';

const CustomSelect = ({
  value,
  options = [],
  onChange,
  disabled = false,

  // config
  getOptionLabel = (opt) => opt.label,
  getOptionValue = (opt) => opt.value,

  // UI hooks
  renderOption,
  getOptionStyle, // (value) => { bg, color, border }

  height = 32,
  size = 'small'
}) => {

  const selectedStyle = getOptionStyle?.(value) || {
    bg: '#F1F5F9',
    color: '#334155',
    border: '#CBD5F5'
  };

  return (
    <Select
      fullWidth
      size={size}
      value={value || ''}
      onChange={(e) => {
        const next = e.target.value;
        if (String(next) === String(value || '')) return;
        onChange?.(next);
      }}
      disabled={disabled}
      sx={{
        height,
        borderRadius: 1,
        fontWeight: 600,
        fontSize: '0.8rem',

        bgcolor: selectedStyle.bg,
        color: selectedStyle.color,

        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',

        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'transparent'
        },

        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: selectedStyle.border
        },

        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: selectedStyle.border
        }
      }}

      MenuProps={{
        PaperProps: {
          elevation: 0,
          sx: {
            mt: 1,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            py: 0.5
          }
        },
        MenuListProps: {
          sx: { py: 0.5 }
        }
      }}
    >
      {options.map((opt) => {
        const val = getOptionValue(opt);
        const label = getOptionLabel(opt);

        return (
          <MenuItem
            key={val}
            value={val}
            sx={{
              fontWeight: 600,
              fontSize: '0.8rem',
              borderRadius: 1,
              mx: 0.5,
              my: 0.25,

              display: 'flex',
              alignItems: 'center',
              gap: 1,

              transition: 'all 0.15s ease',

              '&:hover': {
                backgroundColor: '#F1F5F9'
              },

              '&.Mui-selected': {
                backgroundColor: '#EEF2FF',
                color: '#4F46E5'
              },

              '&.Mui-selected:hover': {
                backgroundColor: '#E0E7FF'
              }
            }}
          >
            {renderOption ? renderOption(opt) : label}
          </MenuItem>
        );
      })}
    </Select>
  );
};

export default CustomSelect;
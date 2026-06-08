import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField, Typography, Box } from "@mui/material";
import dayjs from "dayjs";
import { commonTextFieldProps } from "@/utils/glocalfunc";

const CustomDatePicker = ({
    label,
    name,
    value,
    width,
    styleprops,
    onChange,
    customProps = {},
    sx = {},
    textFieldProps = {},
    disabled=false
}) => {
    const customDatePickerProps = {
        slotProps: {
            popper: {
                sx: {
                    '& .MuiDateCalendar-root': {
                        borderRadius: '8px',
                        fontFamily: '"Public Sans", sans-serif',
                    },
                    '& .MuiPaper-root': {
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    },
                    '& .MuiButtonBase-root, .MuiPickersCalendarHeader-label, .MuiPickersYear-yearButton': {
                        color: '#444050',
                        fontFamily: '"Public Sans", sans-serif',
                    },
                    '& .MuiPickersDay-root, .MuiPickersYear-yearButton': {
                        '&:hover': {
                            backgroundColor: '#7367f0',
                            color: '#fff',
                        },
                    },
                    '& .MuiPickersDay-root.Mui-selected, .Mui-selected ': {
                        backgroundColor: '#7367f0',
                        color: '#fff',
                    },
                    '& .MuiPickersDay-root.Mui-selected, .MuiPickersYear-yearButton:hover': {
                        backgroundColor: '#7367f0',
                        color: '#fff',
                    },
                },
            },
            textField: {
                ...commonTextFieldProps,
                size: "small",
                className: "textfieldsClass",
                ...textFieldProps,
                sx: {
                    "& .MuiInputBase-input": { fontWeight: 600 },
                    "& .MuiOutlinedInput-root": { height: '42px' },
                    ...textFieldProps.sx
                }
            }
        },
    };

    return (
        <Box className="form-group">
            {label && (
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.5, display: 'block' }}>
                    {label}
                </Typography>
            )}
            <DatePicker
                name={name}
                value={value ? dayjs(value) : null}
                onChange={(newValue) => onChange(newValue ? newValue.format('YYYY-MM-DD') : '')}
                {...customDatePickerProps}
                {...customProps}
                {...styleprops}
                disabled={disabled}
                sx={{ minWidth: width, ...sx }}
                format="DD/MM/YYYY"
            />
        </Box>
    );
};

export default CustomDatePicker;

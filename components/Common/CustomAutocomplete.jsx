import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { commonTextFieldProps } from "@/utils/glocalfunc";

export default function CustomAutocomplete({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  error = false,
  helperText = "",
  getOptionLabel = (option) => option.label || option,
  isOptionEqualToValue = (option, value) => option?.value === value?.value || option === value,
  getOptionDisabled,
}) {
  const [selectedValue, setSelectedValue] = useState(null);

  const toComparable = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).trim().toLowerCase();
  };

  const getOptionId = (option) => {
    if (option === null || option === undefined) return '';
    if (typeof option === 'object') {
      if (option.value !== undefined && option.value !== null && option.value !== '') return option.value;
      if (option.id !== undefined && option.id !== null && option.id !== '') return option.id;
    }
    return option;
  };

  const matchesOption = (option, incomingValue) => {
    const incomingComparable = toComparable(incomingValue);
    if (!incomingComparable) return false;

    const optionIdComparable = toComparable(getOptionId(option));
    const optionValueComparable = toComparable(option?.value);
    const optionLabelComparable = toComparable(option?.label);
    const optionLabelNameComparable = toComparable(option?.labelname);

    return (
      optionIdComparable === incomingComparable
      || optionValueComparable === incomingComparable
      || optionLabelComparable === incomingComparable
      || optionLabelNameComparable === incomingComparable
    );
  };

  const normalizeValue = (incomingValue) => {
    if (incomingValue === null || incomingValue === undefined || incomingValue === '') {
      return null;
    }

    if (typeof incomingValue === 'object') {
      const objectValue = getOptionId(incomingValue);
      const matchedObjectOption = (options || []).find((option) => {
        return matchesOption(option, objectValue) || option === incomingValue;
      });
      return matchedObjectOption || incomingValue;
    }

    const matchedOption = (options || []).find((option) => {
      return matchesOption(option, incomingValue) || option === incomingValue;
    });

    return matchedOption || incomingValue;
  };

  const safeGetOptionLabel = (option) => {
    if (option === null || option === undefined) return '';
    const label = getOptionLabel(option);
    if (label === null || label === undefined) return '';
    return String(label);
  };

  const safeIsOptionEqualToValue = (option, currentValue) => {
    if (currentValue === null || currentValue === undefined) return false;
    return isOptionEqualToValue(option, currentValue)
      || option === currentValue
      || matchesOption(option, currentValue);
  };

  useEffect(() => {
    setSelectedValue(normalizeValue(value));
  }, [value, options]);

  const handleChange = (event, newValue) => {
    setSelectedValue(newValue);
    if (onChange) {
      onChange(name, getOptionId(newValue), newValue);
    }
  };

  return (
    <Box className="form-group">
      {label && (
        <Typography variant="caption" className="form-label" sx={{ fontWeight: 700, color: '#334155', mb: 1, display: 'block' }}>
          {label}
        </Typography>
      )}
      <Autocomplete
        disabled={disabled}
        options={options}
        getOptionLabel={safeGetOptionLabel}
        isOptionEqualToValue={safeIsOptionEqualToValue}
        getOptionDisabled={getOptionDisabled}
        value={selectedValue}
        onChange={handleChange}
        slotProps={{
          paper: {
            sx: {
              borderRadius: "8px",
              backgroundColor: "#fff",
            },
          },
        }}
        sx={{
          "& .MuiAutocomplete-option": {
            fontFamily: '"Public Sans", sans-serif',
            color: "#444050",
            margin: "5px 10px",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: "#7367f0",
              color: "#fff",
            },
            "&.Mui-selected": {
              backgroundColor: "#6366f11a",
              color: "#6366f1",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#6366f1",
                color: "#fff",
              },
            },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            {...commonTextFieldProps}
            className="textfieldsClass"
            placeholder={placeholder}
            error={error}
            helperText={helperText}
            sx={{
              "& .MuiInputBase-input": { fontWeight: 600 },
              "& .MuiOutlinedInput-root": { height: '42px' }
            }}
          />
        )}
      />
    </Box>
  );
}

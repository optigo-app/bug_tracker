'use client';

import { useState } from "react";
import Link from "next/link";
import { Button, Chip, Menu, MenuItem, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import { Download, FileImage, FileType2, MoreVertical, Share2, X } from "lucide-react";
import styles from "./draw-editor.module.css";

export default function DrawTopbar({ onExportPng, onExportSvg, onSave, onSaveAndNew, onClose }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);

  const handleClose = () => setAnchorEl(null);

  return (
    <header className={styles.topbar}>
      <div className={styles.brandArea}>
        <div className={styles.logoTile}>B</div>
        <div className={styles.logoText}>BugEditor</div>
      </div>

      <div className={styles.topbarCenter}>
        <Chip
          size="small"
          label="Infinite canvas"
          className={styles.topbarChip}
        />
      </div>

      <div className={styles.topbarActions}>
        {onClose && (
          <Button
            startIcon={<X size={16} />}
            onClick={onClose}
            className="dangerbtnClassname"
            sx={{ padding: '4px 12px' }}
          >
            Close
          </Button>
        )}
        <Button
          variant="contained"
          className={styles.exportButton}
          disableElevation
          startIcon={<Download size={16} />}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          Export
        </Button>
        {onSaveAndNew && onSave ? (
          <>
            <Button
              variant="contained"
              disableElevation
              onClick={onSave}
              sx={{
                minHeight: 34,
                borderRadius: '10px',
                padding: '0 16px',
                bgcolor: '#7367f0',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#6366f1',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(115, 103, 240, 0.3)'
                }
              }}
            >
              Save
            </Button>
            <Button
              variant="contained"
              disableElevation
              onClick={onSaveAndNew}
              sx={{
                minHeight: 34,
                borderRadius: '10px',
                padding: '0 16px',
                bgcolor: '#28c76f',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#20a85c',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(40, 199, 111, 0.3)'
                }
              }}
            >
              Save & New
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            className={styles.continueButton}
            disableElevation
            onClick={onSaveAndNew || onSave}
          >
            {onSaveAndNew ? 'Save & New' : 'Continue'}
          </Button>
        )}
        <Menu
          anchorEl={anchorEl}
          open={isOpen}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }
          }}
        >
          <MenuItem
            onClick={() => {
              handleClose();
              onExportPng();
            }}
          >
            <ListItemIcon>
              <FileImage size={16} />
            </ListItemIcon>
            <ListItemText>Export PNG</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              onExportSvg();
            }}
          >
            <ListItemIcon>
              <FileType2 size={16} />
            </ListItemIcon>
            <ListItemText>Export SVG</ListItemText>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}

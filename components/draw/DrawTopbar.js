'use client';

import { useState } from "react";
import Link from "next/link";
import { Button, Chip, Menu, MenuItem, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import { Download, FileImage, FileJson, FileType2, MoreVertical, Share2, X } from "lucide-react";
import styles from "./draw-editor.module.css";

export default function DrawTopbar({ onExportJson, onExportPng, onExportSvg, onSave, onClose }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);

  const handleClose = () => setAnchorEl(null);

  return (
    <header className={styles.topbar}>
      <div className={styles.brandArea}>
        <div className={styles.logoTile}>B</div>
        <div className={styles.logoText}>BugEditor</div>
        <button className={styles.iconButton} aria-label="More options">
          <MoreVertical size={16} />
        </button>
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
        <Button
          variant="contained"
          className={styles.continueButton}
          disableElevation
          onClick={onSave}
        >
          Continue
        </Button>
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
          <MenuItem
            onClick={() => {
              handleClose();
              onExportJson();
            }}
          >
            <ListItemIcon>
              <FileJson size={16} />
            </ListItemIcon>
            <ListItemText>Export JSON</ListItemText>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}

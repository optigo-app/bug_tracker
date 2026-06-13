'use client';

import { useState } from "react";
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  ArrowUpRight,
  Circle,
  Diamond,
  Download,
  Eraser,
  FileImage,
  FileType2,
  Hand,
  Image,
  MousePointer2,
  Pencil,
  RectangleHorizontal,
  StickyNote,
  Type,
  Upload,
  X,
} from "lucide-react";
import { COLORS, DASH_STYLES } from "./constants";
import styles from "./draw-editor.module.css";

const TOOL_MAP = {
  select: { label: "Select", icon: MousePointer2 },
  pan: { label: "Pan", icon: Hand },
  draw: { label: "Draw", icon: Pencil },
  eraser: { label: "Delete", icon: Eraser },
  arrow: { label: "Arrow", icon: ArrowUpRight },
  text: { label: "Text", icon: Type },
  note: { label: "Sticky Note", icon: StickyNote },
  rect: { label: "Rectangle", icon: RectangleHorizontal },
  ellipse: { label: "Ellipse", icon: Circle },
  shape: { label: "Shape", icon: Diamond },
  media: { label: "Media", icon: Image },
};

const STROKE_OPTIONS = [
  { label: 1, value: 1 },
  { label: 2, value: 2 },
  { label: 4, value: 4 },
  { label: 6, value: 6 },
  { label: 8, value: 8 },
];

const SIZE_OPTIONS = [
  { label: "14", value: 14 },
  { label: "20", value: 20 },
  { label: "32", value: 32 },
  { label: "48", value: 48 },
  { label: "64", value: 64 },
];

export default function DrawTopbar({
  activeTool,
  applyStylesToSelected,
  currentColor,
  currentDash,
  currentFontSize,
  currentStrokeWidth,
  onExportPng,
  onExportSvg,
  onSave,
  onSaveAndNew,
  onClose,
  selectedShape,
  setCurrentColor,
  setCurrentDash,
  setCurrentFontSize,
  setCurrentStrokeWidth,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);

  const handleClose = () => setAnchorEl(null);

  const shouldEditSelected = Boolean(selectedShape) && activeTool === "select";
  const mode = shouldEditSelected ? selectedShape.type : activeTool;

  const handleColorChange = (color) => {
    if (shouldEditSelected) {
      applyStylesToSelected({ color });
    }
    setCurrentColor(color);
  };

  const handleStrokeWidthChange = (strokeWidth) => {
    if (shouldEditSelected) {
      applyStylesToSelected({ strokeWidth });
    }
    setCurrentStrokeWidth(strokeWidth);
  };

  const handleFillChange = (fill) => {
    if (shouldEditSelected) {
      applyStylesToSelected({ fill });
    }
    setCurrentFill(fill);
  };

  const handleDashChange = (dash) => {
    if (shouldEditSelected) {
      applyStylesToSelected({ dash });
    }
    setCurrentDash(dash);
  };

  const handleSizeChange = (option) => {
    if (shouldEditSelected) {
      applyStylesToSelected({ fontSize: option.value });
    }
    setCurrentFontSize(option.value);
  };

  const showStroke = ["draw", "arrow", "rect", "ellipse", "triangle", "diamond", "shape"].includes(mode);
  const showDash = ["draw", "rect", "ellipse", "triangle", "diamond", "shape"].includes(mode);
  const showSize = ["text", "note"].includes(mode);

  const activeFontSize = shouldEditSelected && selectedShape ? (selectedShape.fontSize || currentFontSize) : currentFontSize;

  return (
    <header className={styles.topbar}>
      <div className={styles.brandArea}>
        <div className={styles.logoTile}>B</div>
        <div className={styles.logoText}>BugEditor</div>
      </div>

      <div className={styles.topbarCenter}>
        <div className={styles.topbarToolbar}>
          {/* Active Tool */}
          {(() => {
            const toolInfo = TOOL_MAP[mode] || TOOL_MAP.select;
            const Icon = toolInfo.icon;
            return (
              <div className={styles.topbarToolInfo} title={toolInfo.label}>
                <div className={styles.topbarToolIconWrap}>
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <span className={styles.topbarToolLabel}>{toolInfo.label}</span>
              </div>
            );
          })()}

          {/* Colors */}
          <div className={styles.topbarColorRow}>
            {COLORS.map((color) => (
              <button
                key={color}
                className={`${styles.topbarColorDot} ${currentColor === color ? styles.topbarColorDotActive : ""}`}
                onClick={() => handleColorChange(color)}
                title={color}
              >
                <span
                  className={styles.topbarColorDotInner}
                  style={{ backgroundColor: color }}
                />
              </button>
            ))}
          </div>

          {showStroke && (
            <div className={styles.topbarStrokeRow}>
              {STROKE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`${styles.topbarStrokeBtn} ${currentStrokeWidth === opt.value ? styles.topbarStrokeBtnActive : ""}`}
                  onClick={() => handleStrokeWidthChange(opt.value)}
                  title={`Stroke ${opt.value}`}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <line
                      x1="2"
                      y1="9"
                      x2="16"
                      y2="9"
                      stroke="currentColor"
                      strokeWidth={opt.value}
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {showDash && (
            <div className={styles.topbarIconRow}>
              {DASH_STYLES.map((dash) => (
                <button
                  key={dash}
                  className={`${styles.topbarIconBtn} ${currentDash === dash ? styles.topbarIconBtnActive : ""}`}
                  onClick={() => handleDashChange(dash)}
                  title={dash}
                >
                  <DashIcon type={dash} />
                </button>
              ))}
            </div>
          )}

          {showSize && (
            <div className={styles.topbarSizeRow}>
              {SIZE_OPTIONS.map((option) => (
                <button
                  key={option.label}
                  className={`${styles.topbarSizeBtn} ${activeFontSize === option.value ? styles.topbarSizeBtnActive : ""}`}
                  onClick={() => handleSizeChange(option)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
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

function DashIcon({ type }) {
  const size = 18;
  if (type === "draw") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M4 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="3" y1="12" x2="21" y2="12" strokeDasharray={type === "dashed" ? "5 5" : type === "dotted" ? "1 5" : "none"} />
    </svg>
  );
}

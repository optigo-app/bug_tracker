import { IconButton, Paper, Tooltip } from "@mui/material";
import { Copy, Layers, MoveDiagonal2, Trash2 } from "lucide-react";
import styles from "./draw-editor.module.css";

export default function DrawContextToolbar({
  deleteShape,
  duplicateSelectedShape,
  moveSelectedShapeLayer,
  selectedBounds,
  selectedId,
  viewport,
}) {
  if (!selectedBounds || !selectedId || selectedId === "__all__") return null;

  const left =
    viewport.x + (selectedBounds.x + selectedBounds.w / 2) * viewport.scale;
  const top = viewport.y + selectedBounds.y * viewport.scale - 18;

  return (
    <Paper
      elevation={0}
      className={styles.contextToolbar}
      style={{
        left,
        top,
        transform: "translate(-50%, -100%)",
      }}
    >
      <Tooltip title="Duplicate">
        <IconButton size="small" onClick={duplicateSelectedShape}>
          <Copy size={16} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Bring forward">
        <IconButton size="small" onClick={() => moveSelectedShapeLayer("forward")}>
          <MoveDiagonal2 size={16} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Send backward">
        <IconButton size="small" onClick={() => moveSelectedShapeLayer("backward")}>
          <Layers size={16} />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete">
        <IconButton size="small" color="error" onClick={() => deleteShape(selectedId)}>
          <Trash2 size={16} />
        </IconButton>
      </Tooltip>
    </Paper>
  );
}

import { SHAPE_OPTIONS, getShapeIconStyle } from "./shapeOptions";
import styles from "./draw-editor.module.css";

export default function DrawShapeMenu({
  currentShapeType,
  onSelect,
  style,
}) {
  return (
    <div className={styles.shapeMenu} style={style}>
      {SHAPE_OPTIONS.map((shape) => {
        const ShapeIcon = shape.icon;
        return (
          <button
            key={shape.id}
            className={`${styles.shapeMenuButton} ${
              currentShapeType === shape.value ? styles.shapeMenuButtonActive : ""
            }`}
            title={shape.label}
            onClick={() => onSelect(shape.value)}
          >
            <ShapeIcon
              size={18}
              strokeWidth={1.8}
              style={getShapeIconStyle(shape.id)}
            />
          </button>
        );
      })}
    </div>
  );
}

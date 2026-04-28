import styles from "./draw-editor.module.css";

export default function DrawStatusBar({ setZoom, viewport }) {
  return (
    <>
      <div className={styles.zoomBadge}>
        <button
          className={styles.iconButton}
          onClick={() => setZoom(viewport.scale - 0.1)}
        >
          <ChevronLeftIcon />
        </button>
        <span>{Math.round(viewport.scale * 100)}%</span>
        <button
          className={styles.iconButton}
          onClick={() => setZoom(viewport.scale + 0.1)}
        >
          <ChevronRightIcon />
        </button>
      </div>
    </>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M15 6l-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

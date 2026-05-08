import styles from "./PresetButton.module.css";

interface PresetButtonProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export function PresetButton({
  label,
  isSelected,
  onClick,
}: PresetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.presetButton} ${isSelected ? styles.selected : ""}`}
    >
      {label}
    </button>
  );
}

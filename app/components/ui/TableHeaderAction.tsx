import styles from "./TableHeaderAction.module.css";

interface TableHeaderActionProps {
  hiddenCount: number;
  onShowMore: () => void;
  itemLabel?: string;
}

export function TableHeaderAction({
  hiddenCount,
  onShowMore,
  itemLabel = "item",
}: TableHeaderActionProps) {
  return (
    <div className={styles.wrapper}>
      <button onClick={onShowMore} className={styles.button}>
        Show {hiddenCount} more {itemLabel}
        {hiddenCount !== 1 ? "s" : ""}
      </button>
    </div>
  );
}

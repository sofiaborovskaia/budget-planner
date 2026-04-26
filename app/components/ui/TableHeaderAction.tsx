import { ITEMS_PER_PAGE } from "@/lib/constants";
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
  const itemsToLoad = Math.min(ITEMS_PER_PAGE, hiddenCount);

  return (
    <div className={styles.wrapper}>
      <button onClick={onShowMore} className={styles.button}>
        Load {itemsToLoad} more of {hiddenCount} hidden {itemLabel}
        {hiddenCount !== 1 ? "s" : ""}
      </button>
    </div>
  );
}

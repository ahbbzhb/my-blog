import styles from "./game.module.css";

type ControlsProps = {
  canUndo: boolean;
  onUndo: () => void;
  onReset: () => void;
};

export default function Controls({ canUndo, onUndo, onReset }: ControlsProps) {
  return (
    <>
      <div className={styles.controls}>
        <button
          className={styles.controlBtn}
          disabled={!canUndo}
          onClick={onUndo}
        >
          ↩ 撤销
        </button>
        <button className={styles.controlBtn} onClick={onReset}>
          🔄 重置
        </button>
      </div>
      <div className={styles.keyHints}>
        WASD / 方向键 移动 · Z 撤销 · R 重置
      </div>
    </>
  );
}

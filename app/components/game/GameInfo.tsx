import styles from "./game.module.css";

type GameInfoProps = {
  levelId: number;
  levelName: string;
  moveCount: number;
};

export default function GameInfo({ levelId, levelName, moveCount }: GameInfoProps) {
  return (
    <div className={styles.gameInfo}>
      第 {levelId} 关 · {levelName} · {moveCount} 步
    </div>
  );
}

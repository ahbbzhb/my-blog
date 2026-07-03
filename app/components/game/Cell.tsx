import { CellType } from "@/app/lib/game/type";
import styles from "./game.module.css";

type CellProps = {
  terrain: CellType;
  hasPlayer: boolean;
  hasBox: boolean;
  boxOnTarget: boolean;
};

export default function Cell({ terrain, hasPlayer, hasBox, boxOnTarget }: CellProps) {
  const classes = [styles.cell];

  if (terrain === CellType.Wall) {
    classes.push(styles.cellWall);
  } else {
    // 地形底色
    classes.push(terrain === CellType.Target ? styles.cellTarget : styles.cellFloor);
    // 实体覆盖（玩家优先于箱子）
    if (hasPlayer) {
      classes.push(styles.cellPlayer);
    } else if (boxOnTarget) {
      classes.push(styles.cellBoxOnTarget);
    } else if (hasBox) {
      classes.push(styles.cellBox);
    }
  }

  return <div className={classes.join(" ")} />;
}

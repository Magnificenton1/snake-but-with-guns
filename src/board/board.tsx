import { useState } from "react";
import "./board.css";
const DEFAULT_BOARD_SIZE = 20;
const COLS_IN_FIGHT_MODE = 30;
const ROWS_IN_FIGHT_MODE = 20;

const SNAKE_ENTITY_NUM = 1;
const AMMO_ENTITY_NUM = 2;

type Cell = {
  row: number;
  col: number;
  area: number;
  entity: number;
};

type Entity = {
  x: number;
  y: number;
  hp: number;
};

const createBoard = (BOARD_SIZE: number) => {
  const board: Cell[][] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    const currentRow: Cell[] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      currentRow.push({ row, col, area: 0, entity: 0 });
    }
    board.push(currentRow);
  }
  return board;
};

const expandBoard = (
  BOARD: Cell[][],
  NEW_ROWS: number,
  NEW_COLS: number
): Cell[][] => {
  const new_board = BOARD.map((row) => [...row]);
  const currentRows = new_board.length;
  const currentCols = new_board[0].length;

  if (NEW_ROWS < currentRows || NEW_COLS < currentCols) {
    console.error(
      "expandBoard can only expand the board size. Use shrinkBoard to shrink it."
    );
    return BOARD;
  }

  // EXPAND COLS IN EXISTING ROWS
  if (NEW_COLS != currentCols) {
    for (let row = 0; row < currentRows; row++) {
      const currentRow: Cell[] = new_board[row];
      for (let col = currentCols; col < NEW_COLS; col++) {
        currentRow.push({ row, col, area: 1, entity: 0 });
      }
    }
  }

  // EXPAND ROWS AND COLS
  if (NEW_ROWS != currentRows) {
    for (let row = currentRows; row < NEW_ROWS; row++) {
      const currentRow: Cell[] = [];
      for (let col = 0; col < NEW_COLS; col++) {
        currentRow.push({ row, col, area: 1, entity: 0 });
      }
      new_board.push(currentRow);
    }
  }

  return new_board;
};

const shrinkBoard = (
  BOARD: Cell[][],
  NEW_ROWS: number,
  NEW_COLS: number
): Cell[][] => {
  let trimmedBoard: Cell[][] = [];

  const currentRows = BOARD.length;
  const currentCols = BOARD[0].length;

  if (NEW_ROWS > currentRows || NEW_COLS > currentCols) {
    console.error(
      "shrinkBoard can only shrink the board size. Use expandBoard to grow it."
    );
    return BOARD;
  }

  // TRIM ROWS
  trimmedBoard = BOARD.slice(0, NEW_ROWS).map((row, rowIdx) =>
    // TRIM COLUMNS IN EACH ROW
    row.slice(0, NEW_COLS).map((cell, colIdx) => ({
      ...cell,
      row: rowIdx,
      col: colIdx,
    }))
  );

  return trimmedBoard;
};

const paintEntitiesOnBoard = (
  board: Cell[][],
  entities: Entity[],
  entityValue: number
): Cell[][] => {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell, entity: 0 })));
  for (const { x, y } of entities) {
    if (newBoard[y]?.[x]) {
      newBoard[y][x].entity = entityValue;
    }
  }

  return newBoard;
};

export const Board = () => {
  const [board, setBoard] = useState<Cell[][]>(createBoard(DEFAULT_BOARD_SIZE));
  const [direction, setDirection] = useState<string>("right");
  const [snake, setSnake] = useState<Entity[]>([
    { x: 5, y: 5, hp: 2 },
    { x: 5, y: 6, hp: 2 },
  ]);

  const handleExpand = () => {
    setBoard(expandBoard(board, ROWS_IN_FIGHT_MODE, COLS_IN_FIGHT_MODE));
  };

  const handleShrink = () => {
    setBoard(shrinkBoard(board, DEFAULT_BOARD_SIZE, DEFAULT_BOARD_SIZE));
  };

  const handlePaintSnake = () => {
    setBoard(paintEntitiesOnBoard(board, snake, SNAKE_ENTITY_NUM));
  }

  const moveSnake = () => {
    setSnake(prevSnake => {
    // Create a deep copy of the snake array
    const newSnake = [...prevSnake.map(segment => ({ ...segment }))];
    //not-head logic
    for (let i = newSnake.length - 1; i > 0; i--) {
      newSnake[i].x = newSnake[i - 1].x;
      newSnake[i].y = newSnake[i - 1].y;
    }
    //head logic
    switch (direction) {
      case "up":
        newSnake[0].y--;
        break;
      case "down":
        newSnake[0].y++;
        break;
      case "left":
        newSnake[0].x--;
        break;
      case "right":
        newSnake[0].x++;
        break;
    }

    return newSnake;
  });

  handlePaintSnake();
  }

  return (
    <div>
      <button onClick={handleExpand}>EXPAND</button>
      <button onClick={handleShrink}>SHRINK</button>
      <button onClick={handlePaintSnake}>SPAWN SNAKE</button>
      <button onClick={moveSnake}>MOVE SNAKE</button>
      <div className="board">
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="row">
            {row.map((col, cellIdx) => (
              <div
                key={cellIdx}
                className={`cell ${
                  col.entity == SNAKE_ENTITY_NUM
                    ? "snake"
                    : `${col.area == 1 ? "expanded" : ""}`
                }`}
              >
                {col.area}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

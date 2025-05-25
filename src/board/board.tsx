import { useEffect, useRef, useState } from "react";
import "./board.css";
const DEFAULT_BOARD_SIZE = 20;
const COLS_IN_FIGHT_MODE = 30;
const ROWS_IN_FIGHT_MODE = 20;
// entity numbers
const SNAKE_BODY_NUM = 1;
const SNAKE_HEAD_NUM = 2;
const AMMO_NUM = 3;

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
  en: number; //entity number (1 - snake body, 2 - snake head etc.)
};

const opposites: Record<string, string> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
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

const spawnAmmo = (n: number, board: Cell[][]): Entity[] => {
  const newAmmo: Entity[] = [];
  const maxTries = 1000;
  let tries = 0;

  while (newAmmo.length < n && tries < maxTries) {
    const randX = Math.floor(Math.random() * board[0].length);
    const randY = Math.floor(Math.random() * board.length);

    const cellOccupied = board[randY][randX].entity !== 0;
    const alreadyInList = newAmmo.some((a) => a.x === randX && a.y === randY);

    if (!cellOccupied && !alreadyInList) {
      newAmmo.push({ x: randX, y: randY, hp: 1, en: AMMO_NUM });
    }

    tries++;
  }

  return newAmmo;
};

const paintEntitiesOnBoard = (
  board: Cell[][],
  entitiesGroups: Entity[][]
): Cell[][] => {
  const newBoard = board.map((row) =>
    row.map((cell) => ({ ...cell, entity: 0 }))
  );

  for (const group of entitiesGroups) {
    for (const { x, y, en } of group) {
      if (newBoard[y]?.[x]) {
        newBoard[y][x].entity = en;
      }
    }
  }

  return newBoard;
};

export const Board = () => {
  const [board, setBoard] = useState<Cell[][]>(createBoard(DEFAULT_BOARD_SIZE));
  const [direction, setDirection] = useState<string>("right");
  const [stop, setStop] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [snake, setSnake] = useState<Entity[]>([
    { x: 5, y: 5, hp: 2, en: SNAKE_HEAD_NUM },
    { x: 5, y: 6, hp: 2, en: SNAKE_BODY_NUM },
    { x: 5, y: 7, hp: 2, en: SNAKE_BODY_NUM },
    { x: 5, y: 8, hp: 2, en: SNAKE_BODY_NUM },
    { x: 5, y: 9, hp: 2, en: SNAKE_BODY_NUM },
    { x: 5, y: 10, hp: 2, en: SNAKE_BODY_NUM },
    { x: 5, y: 11, hp: 2, en: SNAKE_BODY_NUM },
    { x: 5, y: 12, hp: 2, en: SNAKE_BODY_NUM },
    { x: 5, y: 13, hp: 2, en: SNAKE_BODY_NUM },
    { x: 5, y: 14, hp: 2, en: SNAKE_BODY_NUM },
    { x: 5, y: 15, hp: 2, en: SNAKE_BODY_NUM },
    { x: 5, y: 16, hp: 2, en: SNAKE_BODY_NUM },
    { x: 5, y: 17, hp: 2, en: SNAKE_BODY_NUM },
    { x: 5, y: 18, hp: 2, en: SNAKE_BODY_NUM },
  ]);
  const boardRef = useRef(board);
  const stopRef = useRef(stop);
  const directionRef = useRef(direction);
  const nextDirectionRef = useRef("right");
  const snakeRef = useRef(snake);
  const [ammo, setAmmo] = useState<Entity[]>(spawnAmmo(3, boardRef.current));

  useEffect(() => {
    snakeRef.current = snake;
    handlePaint();
  }, [snake, ammo]);

  useEffect(() => {

  }, [ammo])

  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyToDir: { [key: string]: string } = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      const newDir = keyToDir[e.key];
      if (!newDir) return;

      if (newDir !== opposites[directionRef.current]) {
        nextDirectionRef.current = newDir;
      }
    };

    let intervalId: number | undefined;
    if (!intervalId) {
      intervalId = window.setInterval(() => {
        if (!stopRef.current) {
          moveSnake();
        }
      }, 100);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(intervalId);
    };
  }, []);

  const isOutOfBounds = (x: number, y: number) => {
    return (
      y < 0 ||
      y >= boardRef.current.length ||
      x < 0 ||
      x >= boardRef.current[0].length
    );
  };

  const handleExpand = () => {
    setBoard(expandBoard(board, ROWS_IN_FIGHT_MODE, COLS_IN_FIGHT_MODE));
  };

  const handleShrink = () => {
    setBoard(shrinkBoard(board, DEFAULT_BOARD_SIZE, DEFAULT_BOARD_SIZE));
  };

  const handlePaint = () => {
    setBoard(paintEntitiesOnBoard(board, [snake, ammo]));
  };

  const handleResetGame = () => {
    setSnake([
      { x: 5, y: 5, hp: 2, en: SNAKE_HEAD_NUM },
      { x: 5, y: 6, hp: 2, en: SNAKE_BODY_NUM },
      { x: 5, y: 7, hp: 2, en: SNAKE_BODY_NUM },
      { x: 5, y: 8, hp: 2, en: SNAKE_BODY_NUM },
      { x: 5, y: 9, hp: 2, en: SNAKE_BODY_NUM },
      { x: 5, y: 10, hp: 2, en: SNAKE_BODY_NUM },
      { x: 5, y: 11, hp: 2, en: SNAKE_BODY_NUM },
      { x: 5, y: 12, hp: 2, en: SNAKE_BODY_NUM },
      { x: 5, y: 13, hp: 2, en: SNAKE_BODY_NUM },
      { x: 5, y: 14, hp: 2, en: SNAKE_BODY_NUM },
      { x: 5, y: 15, hp: 2, en: SNAKE_BODY_NUM },
      { x: 5, y: 16, hp: 2, en: SNAKE_BODY_NUM },
      { x: 5, y: 17, hp: 2, en: SNAKE_BODY_NUM },
      { x: 5, y: 18, hp: 2, en: SNAKE_BODY_NUM },
    ]);
    setBoard(createBoard(DEFAULT_BOARD_SIZE));
    setAmmo(spawnAmmo(3, boardRef.current));
  };

  const moveSnake = () => {
    setSnake((prevSnake) => {
      const newSnake = [...prevSnake.map((segment) => ({ ...segment }))];

      const next = nextDirectionRef.current;
      const current = directionRef.current;

      let moveDir = current;
      if (next && opposites[next] !== current) {
        moveDir = next;
        directionRef.current = next;
        setDirection(next);
      }

      //not-head logic
      for (let i = newSnake.length - 1; i > 0; i--) {
        newSnake[i].x = newSnake[i - 1].x;
        newSnake[i].y = newSnake[i - 1].y;
      }
      //head logic
      switch (moveDir) {
        case "up": {
          const newY = newSnake[0].y - 1;
          const newX = newSnake[0].x;
          if (
            isOutOfBounds(newX, newY) ||
            boardRef.current[newY][newX].entity === SNAKE_BODY_NUM
          ) {
            setStop(true);
            return prevSnake;
          }
          if (boardRef.current[newY][newX].entity === AMMO_NUM) {
            replaceAmmo(newX, newY);
            increaseSnakeSize();
          }
          newSnake[0].y = newY;
          break;
        }
        case "down": {
          const newY = newSnake[0].y + 1;
          const newX = newSnake[0].x;
          if (
            isOutOfBounds(newX, newY) ||
            boardRef.current[newY][newX].entity === SNAKE_BODY_NUM
          ) {
            setStop(true);
            return prevSnake;
          }
          if (boardRef.current[newY][newX].entity === AMMO_NUM) {
            replaceAmmo(newX, newY);
            increaseSnakeSize();
          }
          newSnake[0].y = newY;
          break;
        }
        case "left": {
          const newX = newSnake[0].x - 1;
          const newY = newSnake[0].y;
          if (
            isOutOfBounds(newX, newY) ||
            boardRef.current[newY][newX].entity === SNAKE_BODY_NUM
          ) {
            setStop(true);
            return prevSnake;
          }
          if (boardRef.current[newY][newX].entity === AMMO_NUM) {
            replaceAmmo(newX, newY);
            increaseSnakeSize();
          }
          newSnake[0].x = newX;
          break;
        }
        case "right": {
          const newX = newSnake[0].x + 1;
          const newY = newSnake[0].y;
          if (
            isOutOfBounds(newX, newY) ||
            boardRef.current[newY][newX].entity === SNAKE_BODY_NUM
          ) {
            setStop(true);
            return prevSnake;
          }
          if (boardRef.current[newY][newX].entity === AMMO_NUM) {
            replaceAmmo(newX, newY);
            increaseSnakeSize();
          }
          newSnake[0].x = newX;
          break;
        }
      }
      return newSnake;
    });
  };

  const removeAmmo = (x: number, y: number) => {
    setAmmo((prevAmmo) =>
      prevAmmo.filter((ammoEntity) => ammoEntity.x !== x || ammoEntity.y !== y)
    );
  };

  const replaceAmmo = (x: number, y: number) => {
  const newAmmo = spawnAmmo(1, boardRef.current)[0];

  setAmmo((prevAmmo) =>
    prevAmmo.map((ammoEntity) =>
      ammoEntity.x === x && ammoEntity.y === y ? newAmmo : ammoEntity
    )
  );
};


  const increaseSnakeSize = () => {
    setSnake((prevSnake) => {
      if (prevSnake.length < 2) {
        const newSegment = {
          x: prevSnake[0].x,
          y: prevSnake[0].y,
          hp: 2,
          en: SNAKE_BODY_NUM,
        };
        switch (directionRef.current) {
          case "up":
            newSegment.y++;
            return [...prevSnake, newSegment];
            break;
          case "down":
            newSegment.y--;
            return [...prevSnake, newSegment];
            break;
          case "left":
            newSegment.x++;
            return [...prevSnake, newSegment];
            break;
          case "right":
            newSegment.x--;
            return [...prevSnake, newSegment];
            break;
          default:
            return prevSnake;
            break;
        }
      }
      const tail = prevSnake[prevSnake.length - 1];
      const beforeTail = prevSnake[prevSnake.length - 2];

      const dx = tail.x - beforeTail.x;
      const dy = tail.y - beforeTail.y;

      const newSegment = {
        x: tail.x + dx,
        y: tail.y + dy,
        hp: 2,
        en: SNAKE_BODY_NUM,
      };

      return [...prevSnake, newSegment];
    });
  };
  return (
    <div>
      <button onClick={handleExpand}>EXPAND</button>
      <button onClick={handleShrink}>SHRINK</button>
      <button onClick={() => setStop(!stop)}>{stop ? "START" : "STOP"}</button>
      <button onClick={handleResetGame}>RESET</button>
      <div>{gameOver ? "GAME OVER!" : "PLAY"}</div>
      <div className="board">
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="row">
            {row.map((col, cellIdx) => (
              <div
                key={cellIdx}
                className={`cell ${
                  col.entity == SNAKE_BODY_NUM
                    ? "snake-body"
                    : `${
                        col.entity == SNAKE_HEAD_NUM
                          ? "snake-head"
                          : `${col.entity == AMMO_NUM ? "ammo" : ""}`
                      }`
                }`}
              >
                {/* {col.area} */}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

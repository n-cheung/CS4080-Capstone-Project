function randInt(min, max) {
    if (max == undefined) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min)) + min;
}

// fisher yates
function shuffleArray(array) {
    let i = array.length;
    while (i-- > 0) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function makeSprite(image) {
    var temp = document.createElement("canvas");
    temp.width = 500;
    temp.height = 500;
    var context = temp.getContext("2d");
    context.drawImage(image, 0, 0, 500, 500);

    var imgData = context.getImageData(0, 0, 500, 500);
    context.putImageData(imgData, 0, 0);

    var out = new Image();
    out.src = temp.toDataURL();
    temp.remove();
    return out;
}

function showVictory(moves) {
  document.getElementById("moves").innerHTML = "Steps:" + moves;
  document.getElementById('message').style.visibility = 'visible';
}

function Maze(Width, Height) {
  var mazeMap;
  var width = Width;
  var height = Height;
  var startCoord, endCoord;
  var dirs = ["n", "s", "e", "w"];
  var modDir = {
    n: {
      y: -1,
      x: 0,
      o: "s"
    },
    s: {
      y: 1,
      x: 0,
      o: "n"
    },
    e: {
      y: 0,
      x: 1,
      o: "w"
    },
    w: {
      y: 0,
      x: -1,
      o: "e"
    }
  };

  this.map = function() {
    return mazeMap;
  };
  this.startCoord = function() {
    return startCoord;
  };
  this.endCoord = function() {
    return endCoord;
  };

  function genMap() {
    mazeMap = new Array(height);
    for (y = 0; y < height; y++) {
      mazeMap[y] = new Array(width);
      for (x = 0; x < width; ++x) {
        mazeMap[y][x] = {
          n: false,
          s: false,
          e: false,
          w: false,
          visited: false,
          priorPos: null
        };
      }
    }
  }

  function defineMaze() {
    var isComp = false;
    var move = false;
    var cellsVisited = 1;
    var numLoops = 0;
    var maxLoops = 0;
    var pos = {
      x: 0,
      y: 0
    };
    var numCells = width * height;
    while (!isComp) {
      move = false;
      mazeMap[pos.x][pos.y].visited = true;

      if (numLoops >= maxLoops) {
        shuffleArray(dirs);
        maxLoops = randInt(height / 8);
        numLoops = 0;
      }
      numLoops++;
      for (index = 0; index < dirs.length; index++) {
        var direction = dirs[index];
        var nx = pos.x + modDir[direction].x;
        var ny = pos.y + modDir[direction].y;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          //Check if the tile is already visited
          if (!mazeMap[nx][ny].visited) {
            //Carve through walls from this tile to next
            mazeMap[pos.x][pos.y][direction] = true;
            mazeMap[nx][ny][modDir[direction].o] = true;

            //Set Currentcell as next cells Prior visited
            mazeMap[nx][ny].priorPos = pos;
            //Update Cell position to newly visited location
            pos = {
              x: nx,
              y: ny
            };
            cellsVisited++;
            //Recursively call this method on the next tile
            move = true;
            break;
          }
        }
      }

      if (!move) {
        //  If it failed to find a direction,
        //  move the current position back to the prior cell and Recall the method.
        pos = mazeMap[pos.x][pos.y].priorPos;
      }
      if (numCells == cellsVisited) {
        isComp = true;
      }
    }
  }

  function defineStartEnd() {
    switch (randInt(4)) {
      case 0:
        startCoord = {
          x: 0,
          y: 0
        };
        endCoord = {
          x: height - 1,
          y: width - 1
        };
        break;
      case 1:
        startCoord = {
          x: 0,
          y: width - 1
        };
        endCoord = {
          x: height - 1,
          y: 0
        };
        break;
      case 2:
        startCoord = {
          x: height - 1,
          y: 0
        };
        endCoord = {
          x: 0,
          y: width - 1
        };
        break;
      case 3:
        startCoord = {
          x: height - 1,
          y: width - 1
        };
        endCoord = {
          x: 0,
          y: 0
        };
        break;
    }
  }

  genMap();
  defineStartEnd();
  defineMaze();
}

function DrawMaze(Maze, ctx, cellsize, endSprite = null) {
  var map = Maze.map();
  var cellSize = cellsize;
  var drawEndMethod;
  ctx.lineWidth = cellSize / 40;

  this.redrawMaze = function(size) {
    cellSize = size;
    ctx.lineWidth = cellSize / 50;
    drawMap();
    drawEndMethod();
  };

  function drawCell(xCord, yCord, cell) {
    var x = xCord * cellSize;
    var y = yCord * cellSize;

    if (cell.n == false) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellSize, y);
      ctx.stroke();
    }
    if (cell.s === false) {
      ctx.beginPath();
      ctx.moveTo(x, y + cellSize);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if (cell.e === false) {
      ctx.beginPath();
      ctx.moveTo(x + cellSize, y);
      ctx.lineTo(x + cellSize, y + cellSize);
      ctx.stroke();
    }
    if (cell.w === false) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + cellSize);
      ctx.stroke();
    }
  }

  function drawMap() {
    for (x = 0; x < map.length; x++) {
      for (y = 0; y < map[x].length; y++) {
        drawCell(x, y, map[x][y]);
      }
    }
  }

  function drawEndFlag() {
    var coord = Maze.endCoord();
    var gridSize = 4;
    var fraction = cellSize / gridSize - 2;
    var colorSwap = true;
    for (let y = 0; y < gridSize; y++) {
      if (gridSize % 2 == 0) {
        colorSwap = !colorSwap;
      }
      for (let x = 0; x < gridSize; x++) {
        ctx.beginPath();
        ctx.rect(
          coord.x * cellSize + x * fraction + 4.5,
          coord.y * cellSize + y * fraction + 4.5,
          fraction,
          fraction
        );
        if (colorSwap) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        }
        ctx.fill();
        colorSwap = !colorSwap;
      }
    }
  }

  function drawEndSprite() {
    var offsetLeft = cellSize / 50;
    var offsetRight = cellSize / 25;
    var coord = Maze.endCoord();
    ctx.drawImage(
      endSprite,
      2,
      2,
      endSprite.width,
      endSprite.height,
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    );
  }

  function clear() {
    var canvasSize = cellSize * map.length;
    ctx.clearRect(0, 0, canvasSize, canvasSize);
  }

  if (endSprite != null) {
    drawEndMethod = drawEndSprite;
  } else {
    drawEndMethod = drawEndFlag;
  }
  clear();
  drawMap();
  drawEndMethod();
}

function Player(maze, c, _cellsize, onComplete, sprite = null) {
  var ctx = c.getContext("2d");
  var drawSprite;
  var moves = 0;
  drawSprite = drawSpriteCircle;
  if (sprite != null) {
    drawSprite = drawSpriteImg;
  }
  var player = this;
  var map = maze.map();
  var cellCoords = {
    x: maze.startCoord().x,
    y: maze.startCoord().y
  };
  var cellSize = _cellsize;
  var halfCellSize = cellSize / 2;

  this.redrawPlayer = function(_cellsize) {
    cellSize = _cellsize;
    drawSpriteImg(cellCoords);
  };

  function drawSpriteCircle(coord) {
    ctx.beginPath();
    ctx.fillStyle = "yellow";
    ctx.arc(
      (coord.x + 1) * cellSize - halfCellSize,
      (coord.y + 1) * cellSize - halfCellSize,
      halfCellSize - 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves);
      player.canMove = false;
    }
  }

  function drawSpriteImg(coord) {
    var offsetLeft = cellSize / 50;
    var offsetRight = cellSize / 25;
    ctx.drawImage(
      sprite,
      0,
      0,
      sprite.width,
      sprite.height,
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    );
    if (coord.x === maze.endCoord().x && coord.y === maze.endCoord().y) {
      onComplete(moves);
      player.canMove = false;
    }
  }

  function removeSprite(coord) {
    var offsetLeft = cellSize / 50;
    var offsetRight = cellSize / 25;
    ctx.clearRect(
      coord.x * cellSize + offsetLeft,
      coord.y * cellSize + offsetLeft,
      cellSize - offsetRight,
      cellSize - offsetRight
    );
  }

    function handleKeydown(e) {
        if (!player.canMove)
          return;
          
        var cell = map[cellCoords.x][cellCoords.y];
        const key = e.key;
        if ((key == 'a' || key == 'A' || key == 'ArrowLeft') && cell.w) {
            removeSprite(cellCoords);
            cellCoords = {
              x: cellCoords.x - 1,
              y: cellCoords.y
            };
            drawSprite(cellCoords);
            return;
        }
        if ((key == 'w' || key == 'W' || key == 'ArrowUp') && cell.n) {
            removeSprite(cellCoords);
            cellCoords = {
              x: cellCoords.x,
              y: cellCoords.y - 1
            };
            drawSprite(cellCoords);
            return;
        }
        if ((key == 'd' || key == 'D' || key == 'ArrowRight') && cell.e) {
            removeSprite(cellCoords);
            cellCoords = {
              x: cellCoords.x + 1,
              y: cellCoords.y
            };
            drawSprite(cellCoords);
            return;
        }
        if ((key == 's' || key == 'S' || key == 'ArrowDown') && cell.s) {
            removeSprite(cellCoords);
            cellCoords = {
              x: cellCoords.x,
              y: cellCoords.y + 1
            };
            drawSprite(cellCoords);
            return;
        }
    }

  this.canMove = true;
  window.addEventListener('keydown', handleKeydown, false);
  drawSprite(maze.startCoord());
}

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var sprite;
var finishSprite;
var maze, draw, player;
var cellSize;
// sprite.src = 'media/sprite.png';

window.onresize = function() {
  const view = document.getElementById('view').getClientRects();
  const min =  Math.floor(Math.min(view.width, view.height) * 0.9);
  canvas.style.width = min + 'px';
  canvas.style.height = min + 'px';

  cellSize = canvas.width / 10;
  if (player != null) {
    draw.redrawMaze(cellSize);
    player.redrawPlayer(cellSize);
  }
};

window.onload = function() {
  const view = document.getElementById('view').getClientRects();
  const min =  Math.floor(Math.min(view.width, view.height) * 0.9);
  canvas.style.width = min + 'px';
  canvas.style.height = min + 'px';

  //Load and edit sprites
  var completeOne = false;
  var completeTwo = false;
  var isComplete = () => {
    if(completeOne === true && completeTwo === true)
       {
         console.log("Runs");
         setTimeout(function(){
           makeMaze();
         }, 500);         
       }
  };

  sprite = new Image();
  sprite.src = 
    "https://i.postimg.cc/63zypcsN/horse.png" +
    
    "?" +
    new Date().getTime();
  sprite.setAttribute("crossOrigin", "*");
  sprite.onload = function() {
    sprite = makeSprite(sprite);
    completeOne = true;
    console.log(completeOne);
    isComplete();
  };

  finishSprite = new Image();
  finishSprite.src =  "https://i.postimg.cc/7YPS0Bwd/cpp-logo.png"+
  "?" +
  new Date().getTime();
  finishSprite.setAttribute("crossOrigin", "*");
  finishSprite.onload = function() {
    finishSprite = makeSprite(finishSprite);
    completeTwo = true;
    console.log(completeTwo);
    isComplete();
  };
  
};

function makeMaze() {
  if (player != undefined) {
    player.canMove = false;
    player = null;
  }
  cellSize = canvas.width / 10;
  maze = new Maze(10, 10);
  draw = new DrawMaze(maze, ctx, cellSize, finishSprite);
  player = new Player(maze, canvas, cellSize, showVictory, sprite);
}


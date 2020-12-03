

const blocks = [];
/*
L-shape:
    ::
    ::
    ::::
    color: blue
*/
const Lshape = {
  color: 0x00a9fe,
  size: 3,
  height: 3,
  width: 2,
  depth: 2,
  grid: [
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  ],
};
blocks.push(Lshape);
/*
T-shape:
    ::
  ::::::
  color: green
*/

/*
Z-shape:
    ::
    ::::
      ::
    color: yellow
*/



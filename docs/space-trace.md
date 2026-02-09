Below is a **clear, complete game specification** based on your description. It is written so it can be handed directly to an AI coder or developer.

---

## Game Concept

A fast paced 2D reflex game inspired by Space Waves.

The player controls a constantly moving object that travels forward automatically. The only control is the space bar, which changes vertical movement and allows riding on surfaces.

The challenge comes from precise timing, tight passages, spikes, and increasingly difficult level layouts.

---

## Core Mechanics

### Movement

The player moves forward at a constant speed at all times.
There is no forward or backward input.

Vertical control is handled entirely with the space bar.

When the space bar is not pressed
The player is pulled downward by gravity.

When the space bar is pressed
The player accelerates upward.

When the space bar is held against the ceiling
The player sticks to and rides along the ceiling.

When the player is on the floor
They ride along the floor naturally until space is pressed.

The player can smoothly transition between floor, air, and ceiling.

---

### Controls

Space bar
Primary and only control
Press to move up
Release to fall down

Optional restart key
R or Enter to restart the level after death

---

## Player Rules

The player dies instantly if they touch a spike.
The player dies if they collide with solid obstacles.
The player must stay within the level boundaries.
There is no health system. One hit equals death.

---

## Obstacles

### Spikes

Spikes instantly kill the player on contact.

They can appear
On the floor
On the ceiling
On walls
Inside narrow tunnels
As moving obstacles in later levels

Spike shapes
Triangles
Rows of triangles
Alternating patterns

---

### Narrow Passages

Tight corridors that require precise control.
Some require riding the ceiling.
Some require hugging the floor.
Some require quick switching between both.

Passages may curve up and down.

---

### Solid Blocks

Rectangular or irregular shapes that block the path.
Must be avoided entirely.
Used to create zigzag movement and rhythm based challenges.

---

## Levels

### Level Structure

The game is level based.
Each level is a fixed length.
Reaching the end completes the level.

Levels increase in difficulty gradually.

---

### Difficulty Progression

Early levels
Wide spaces
Few spikes
Slow speed
Simple up and down movement

Mid levels
Narrower paths
More spikes
Faster speed
Ceiling riding required
Quick transitions between floor and ceiling

Late levels
Very tight passages
Dense spike patterns
High speed
Perfect timing required
Pro level difficulty but still possible

All levels must be beatable.
No impossible jumps or traps.

---

### Level Count

Recommended
50 to 200 levels

Levels can be grouped into difficulty tiers.

---

## Game Flow

Start screen
Press space to start

Gameplay
Automatic forward movement
One button control
Instant restart on death

Level complete screen
Shows level number completed
Automatically moves to next level

Optional progress saving
The game remembers the highest unlocked level.

---

## Visual Style

Simple and clean 2D style.

Background
Dark or neutral color

Player
Bright color
Clear shape such as triangle or square

Spikes
High contrast color
Immediately recognizable as dangerous

---

## Audio

Background music
Fast paced and minimal

Sound effects
Short sound when jumping upward
Sharp sound on death
Clear sound on level completion

---

## Optional Enhancements

Moving obstacles
Speed changes within a level
Visual pulse effects synced to music
Ghost replay of best run
Practice mode per level

---

If you want, next steps could be
A level design template
A physics formula for movement
A full coding prompt for an AI game engine
A Scratch, JavaScript, or Unity version of this spec

Below is the complete, updated technical and design specification for your web platformer game, with the **Ground Spike obstacle** fully integrated.

---

# Web Game Specification

**Working Title:** Jumpy Dash Pro (Placeholder)

---

## 1. Overview

A browser based 2D precision platformer where the player must jump over hazards, avoid traps, and complete increasingly difficult levels. The game focuses on timing, memorization, and skill mastery. All levels are challenging but solvable.

Platform: Web browser
Technology: HTML5 Canvas or WebGL, JavaScript, Web Audio API
Target Devices: Desktop and Mobile

---

## 2. Core Gameplay

### Player Mechanics

Movement:

* Left and Right movement
* Single jump
* Optional advanced mechanics in later levels

Physics:

* Gravity based jumping
* Fixed jump height and distance
* Consistent movement physics

Rules:

* Contact with hazards causes instant death
* Player respawns at level start
* Level state fully resets on death

---

## 3. Level Structure

### Level Count

* Minimum: 100 levels
* Target: 150 to 200 levels

### Difficulty Progression

| Tier     | Levels     | Description            |
| -------- | ---------- | ---------------------- |
| Beginner | 1 to 20    | Basic movement         |
| Easy     | 21 to 40   | Simple hazards         |
| Medium   | 41 to 70   | Timing challenges      |
| Hard     | 71 to 110  | Precision play         |
| Expert   | 111 to 150 | Pattern mastery        |
| Pro      | 151+       | Near perfect execution |

Difficulty increases gradually.

---

## 4. Level Design Rules

### Core Rule

Every level must be beatable.

Requirements:

* All jumps within physics limits
* No forced damage
* No unavoidable traps

### Validation

* Max gap ≤ max jump distance
* Required reaction time ≥ 150 ms
* Obstacles leave valid paths

Automated testing recommended.

---

## 5. Obstacles and Hazards

### 5.1 Ground Spike (Primary Hazard)

Description:
A triangular spike emerging from the floor. Touching it instantly kills the player.

Visual:

* Upward pointing isosceles triangle
* High contrast color

Placement:

* Only on solid ground
* Cannot float
* Must leave valid jump space

Collision:

* Triangle hitbox preferred
* Rectangular fallback allowed

Behavior:

* Always active
* Instant death on contact

Variants:

* Static (default)
* Pop up (timed)
* Moving (advanced)

Reset:

* Returns to default state on death

---

### 5.2 Ceiling Spikes

* Drop when triggered
* Pattern based timing

### 5.3 Breakable Platforms

* Collapse after one use
* Reset on death

### 5.4 Moving Platforms

* Horizontal and vertical motion
* Fixed paths

### 5.5 Disappearing Blocks

* Vanish after timer
* Reappear on reset

### 5.6 Crushers

* Compress areas on timers

### 5.7 Optional Hazards

* Lasers
* Wind zones
* Rotating blades

---

## 6. Special Mechanics

### One Time Platforms

* Break after first contact

### Trap Triggers

* Activate hazards

### Checkpoints (Optional)

* Disabled in high difficulty tiers

---

## 7. Level Reset System

On death:

* Player returns to start
* All hazards reset
* All timers reset
* All platforms restored

Resets are deterministic.

---

## 8. Progress Saving System

Uses browser localStorage.

Saved Data:

```
{
  highestLevelCompleted,
  unlockedLevels,
  settings
}
```

Features:

* Auto save
* Resume
* Level select

---

## 9. Audio Design

| Event          | Sound   |
| -------------- | ------- |
| Jump           | Click   |
| Land           | Thud    |
| Death          | Impact  |
| Level Complete | Trumpet |
| Menu           | Click   |

Trumpet sound plays on completion.

---

## 10. Visual Design

Style:

* Minimalist
* High contrast
* Clear hitboxes

Resolution:

* Scalable
* Minimum 1280x720

Camera:

* Fixed per level

---

## 11. Controls

Desktop:

* Arrow Keys or WASD
* Space: Jump
* R: Restart
* Esc: Pause

Mobile:

* On screen buttons

---

## 12. User Interface

Menus:

* Start
* Continue
* Level Select
* Settings
* Credits

HUD:

* Level number
* Death count optional

---

## 13. Level Editor (Recommended)

Features:

* Grid placement
* Obstacle palette
* Jump preview
* Validation warnings

---

## 14. Technical Architecture

Structure:

```
/engine
  physics.js
  renderer.js
  audio.js
/game
  player.js
  levelManager.js
  obstacleManager.js
/ui
  menu.js
  hud.js
/save
  saveManager.js
```

Game Loop:

* Fixed 60 FPS timestep

---

## 15. Performance Targets

* 60 FPS
* Load under 2s
* Memory under 200MB

---

## 16. Testing Requirements

Automated:

* Jump reach
* Collision accuracy
* Reset consistency
* Save integrity

Manual:

* Playtesting
* Difficulty review

---

## 17. Level Data Format (Example)

```json
{
  "id": 12,
  "difficulty": "Medium",
  "start": { "x": 50, "y": 400 },
  "goal": { "x": 900, "y": 200 },

  "platforms": [
    { "x": 100, "y": 450, "w": 120 }
  ],

  "hazards": [
    {
      "type": "ground_spike",
      "x": 240,
      "y": 468,
      "w": 32,
      "h": 28
    }
  ]
}
```

---

## 18. Future Features (Optional)

* Speedrun mode
* Ghost replay
* Leaderboards
* Daily challenges
* Level sharing

---

## 19. Success Criteria

The game is complete when:

* All levels are beatable
* No impossible jumps exist
* Progress saves correctly
* Resets are consistent
* Difficulty ramps smoothly
* Trumpet plays on completion
* No softlocks occur

---

If you want, I can next provide:

* A development roadmap
* A starter codebase
* A level generator
* A validation system for impossible jumps

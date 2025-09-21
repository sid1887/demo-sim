// Grid utility functions for snapping and alignment
export const GRID_SIZES = {
  SMALL: 4,
  MEDIUM: 8,
  LARGE: 16
};

export class GridSystem {
  constructor(spacing = GRID_SIZES.MEDIUM) {
    this.spacing = spacing;
    this.tolerance = 2; // pixels
  }

  setSpacing(spacing) {
    this.spacing = spacing;
  }

  setTolerance(tolerance) {
    this.tolerance = tolerance;
  }

  snapToGrid(point, disabled = false) {
    if (disabled) return point;

    return {
      x: Math.round(point.x / this.spacing) * this.spacing,
      y: Math.round(point.y / this.spacing) * this.spacing
    };
  }

  snapToGridWithTolerance(point, disabled = false) {
    if (disabled) return point;

    const snapped = this.snapToGrid(point);
    const distance = Math.sqrt(
      Math.pow(point.x - snapped.x, 2) + Math.pow(point.y - snapped.y, 2)
    );

    return distance <= this.tolerance ? snapped : point;
  }

  getGridLines(viewport, zoom) {
    const { x, y, width, height } = viewport;
    const adjustedSpacing = this.spacing * zoom;
    
    // Don't show grid if too dense
    if (adjustedSpacing < 2) return { horizontal: [], vertical: [] };

    const startX = Math.floor(x / this.spacing) * this.spacing;
    const startY = Math.floor(y / this.spacing) * this.spacing;

    const horizontal = [];
    const vertical = [];

    // Generate grid lines within viewport
    for (let gx = startX; gx <= x + width; gx += this.spacing) {
      vertical.push(gx);
    }

    for (let gy = startY; gy <= y + height; gy += this.spacing) {
      horizontal.push(gy);
    }

    return { horizontal, vertical };
  }

  findNearestGridPoint(point) {
    return {
      x: Math.round(point.x / this.spacing) * this.spacing,
      y: Math.round(point.y / this.spacing) * this.spacing,
      distance: Math.sqrt(
        Math.pow(point.x % this.spacing, 2) + 
        Math.pow(point.y % this.spacing, 2)
      )
    };
  }

  isAlignedToGrid(point) {
    const remainder = {
      x: point.x % this.spacing,
      y: point.y % this.spacing
    };

    return Math.abs(remainder.x) < 0.1 && Math.abs(remainder.y) < 0.1;
  }
}

// Pin detection and connection utilities
export class PinSystem {
  constructor(gridSystem) {
    this.grid = gridSystem;
    this.connectionRadius = 8; // pixels
  }

  findPinsInRadius(point, nodes, radius = this.connectionRadius) {
    const pins = [];

    nodes.forEach(node => {
      const nodePins = this.getNodePins(node);
      nodePins.forEach(pin => {
        const distance = Math.sqrt(
          Math.pow(point.x - pin.x, 2) + Math.pow(point.y - pin.y, 2)
        );

        if (distance <= radius) {
          pins.push({
            ...pin,
            nodeId: node.id,
            distance
          });
        }
      });
    });

    return pins.sort((a, b) => a.distance - b.distance);
  }

  getNodePins(node) {
    const { position, data } = node;
    const pins = [];

    // Standard component pin positions (adjust based on component type)
    switch (node.type) {
      case 'resistor':
      case 'capacitor':
      case 'inductor':
      case 'diode':
        pins.push(
          { x: position.x, y: position.y + 15, id: 'left' },
          { x: position.x + 80, y: position.y + 15, id: 'right' }
        );
        break;
        
      case 'voltageSource':
      case 'currentSource':
        pins.push(
          { x: position.x + 24, y: position.y + 15, id: 'positive' },
          { x: position.x + 56, y: position.y + 15, id: 'negative' }
        );
        break;
        
      case 'ground':
        pins.push({ x: position.x + 40, y: position.y, id: 'terminal' });
        break;
        
      default:
        // Generic pins for unknown components
        pins.push(
          { x: position.x, y: position.y + 15, id: 'pin1' },
          { x: position.x + 80, y: position.y + 15, id: 'pin2' }
        );
    }

    return pins;
  }

  closestPinAtPointer(point, nodes) {
    const nearbyPins = this.findPinsInRadius(point, nodes);
    return nearbyPins.length > 0 ? nearbyPins[0] : null;
  }

  getPinConnectionPoint(nodeId, pinId, nodes) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const pins = this.getNodePins(node);
    return pins.find(pin => pin.id === pinId) || null;
  }
}

// Auto-routing utilities for orthogonal wire paths
export class AutoRouter {
  constructor(gridSystem, nodes = []) {
    this.grid = gridSystem;
    this.nodes = nodes;
    this.obstacles = this.buildObstacleMap();
  }

  updateNodes(nodes) {
    this.nodes = nodes;
    this.obstacles = this.buildObstacleMap();
  }

  buildObstacleMap() {
    const obstacles = new Set();
    
    this.nodes.forEach(node => {
      const { position } = node;
      // Mark node bounding box as obstacle
      for (let x = position.x; x < position.x + 80; x += this.grid.spacing) {
        for (let y = position.y; y < position.y + 30; y += this.grid.spacing) {
          obstacles.add(`${x},${y}`);
        }
      }
    });

    return obstacles;
  }

  isObstacle(point) {
    const snapped = this.grid.snapToGrid(point);
    return this.obstacles.has(`${snapped.x},${snapped.y}`);
  }

  findOrthogonalPath(start, end) {
    const startSnapped = this.grid.snapToGrid(start);
    const endSnapped = this.grid.snapToGrid(end);

    // Simple orthogonal routing: try L-shape paths
    const paths = [
      // Horizontal first, then vertical
      [
        startSnapped,
        { x: endSnapped.x, y: startSnapped.y },
        endSnapped
      ],
      // Vertical first, then horizontal  
      [
        startSnapped,
        { x: startSnapped.x, y: endSnapped.y },
        endSnapped
      ]
    ];

    // Choose path with fewer obstacles
    let bestPath = paths[0];
    let minObstacles = this.countPathObstacles(bestPath);

    for (const path of paths.slice(1)) {
      const obstacles = this.countPathObstacles(path);
      if (obstacles < minObstacles) {
        bestPath = path;
        minObstacles = obstacles;
      }
    }

    return this.simplifyPath(bestPath);
  }

  countPathObstacles(path) {
    let count = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
      const segment = this.getLinePoints(path[i], path[i + 1]);
      count += segment.filter(point => this.isObstacle(point)).length;
    }

    return count;
  }

  getLinePoints(start, end) {
    const points = [];
    const dx = Math.sign(end.x - start.x);
    const dy = Math.sign(end.y - start.y);

    let current = { ...start };
    
    while (current.x !== end.x || current.y !== end.y) {
      points.push({ ...current });
      
      if (current.x !== end.x) current.x += dx * this.grid.spacing;
      if (current.y !== end.y) current.y += dy * this.grid.spacing;
    }
    
    points.push({ ...end });
    return points;
  }

  simplifyPath(path) {
    if (path.length <= 2) return path;

    const simplified = [path[0]];
    
    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const curr = path[i];
      const next = path[i + 1];

      // Check if current point is necessary (not collinear)
      const dx1 = curr.x - prev.x;
      const dy1 = curr.y - prev.y;
      const dx2 = next.x - curr.x;
      const dy2 = next.y - curr.y;

      // If not collinear, keep the point
      if (dx1 * dy2 !== dy1 * dx2) {
        simplified.push(curr);
      }
    }

    simplified.push(path[path.length - 1]);
    return simplified;
  }
}

// Export default instances
export const defaultGrid = new GridSystem(GRID_SIZES.MEDIUM);
export const defaultPinSystem = new PinSystem(defaultGrid);
export const defaultAutoRouter = new AutoRouter(defaultGrid);
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseIcon } from './generate.mjs'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

const strokeWidth = 1.5
// Centre-line distance for a painted clear of 2 (strokes) and 1.5 (dots).
const strokeLimit = 3.5
const dotLimit = 3.0
// Rounding of flattened curves and of 0.25-grid coordinates must not raise a finding.
const slack = 0.03
// Two commands closer than this touch: they cross or share an endpoint, which is a join.
const touchTolerance = 0.05
// A point on an arc may sit this far off the stroke it joins: a 2-decimal radius such as 3.54 (bike rim joints).
const arcTouchTolerance = 0.2
// An endpoint this close to another stroke's centre-line is painted into it, clear below 0 (help ticks,
// gender-male and gender-fluid shafts, search and lost-property handles, contrast stripes).
const paintedJoin = 0.75
// Two paths that meet or cross and leave each other at 45 degrees or more are one join: pairs within
// one arm length of it pass (refresh and history heads, bike joints, ferry cabin walls, train rails,
// walk shoulder, marriage rings crossing in a neighbouring command).
const divergence = Math.SQRT1_2
const armLength = 5
// A single stroke is compared with itself only as a hairpin: a semicircle's two ends one diameter apart
// (bulky-waste armrest r 1.75, id-card head). Flattened arcs of radius 2 or less get this slack.
const hairpinSlack = 0.1
// A clear gap of 1.5 to 2.0 (centre-line 3.0 to 3.5) is allowed only for the pairs listed below.
const smallGapReason =
  'a meaningful icon is at least 20px, where 1.5 units is 1.25px and the gap stays open (design review 2026-10-17)'
// Accepted exceptions, each exact by icon name and by the two strokes (their commands), never by age.
const allowList = [
  {
    icon: 'settings',
    distance: 2.0,
    reason: 'gear teeth: teeth are 2.0 apart by design',
  },
  {
    icon: 'delete',
    distance: 2.5,
    reason: 'the pilot handle sits 1.0 clear of the lid',
    pairs: [
      ['H (4,6.5)->(20,6.5)', 'A (9.5,5)->(10.5,4)'],
      ['H (4,6.5)->(20,6.5)', 'H (10.5,4)->(13.5,4)'],
      ['H (4,6.5)->(20,6.5)', 'A (13.5,4)->(14.5,5)'],
    ],
  },
  {
    icon: 'train',
    distance: 3.0,
    reason: 'the closed window slot: opposite edges are 3.0 apart',
    pairs: [['H (10,8.5)->(14,8.5)', 'H (14,11.5)->(10,11.5)']],
  },
  {
    icon: 'tram',
    distance: 3.0,
    reason: 'the closed window slot: opposite edges are 3.0 apart',
    pairs: [['H (10,10)->(14,10)', 'H (14,13)->(10,13)']],
  },
  {
    icon: 'ambulance',
    distance: 3.0,
    reason: smallGapReason,
    pairs: [['A (7.5,5)->(10.5,5)', 'A (7.5,5)->(10.5,5)']],
  },
  {
    icon: 'signature',
    distance: 3.0,
    reason: smallGapReason,
    pairs: [
      ['A (9,12.5)->(12,12.5)', 'A (9,12.5)->(12,12.5)'],
      ['A (12,12.5)->(15,12.5)', 'A (12,12.5)->(15,12.5)'],
    ],
  },
  {
    icon: 'warning',
    distance: 3.1,
    reason: smallGapReason,
    pairs: [
      ['L (12,3.25)->(21.25,20.25)', 'V (12,9.75)->(12,13.25)'],
      ['Z (2.75,20.25)->(12,3.25)', 'V (12,9.75)->(12,13.25)'],
    ],
  },
  {
    icon: 'quick-exit',
    distance: 3.1,
    reason: smallGapReason,
    pairs: [['H (9.5,10)->(14.5,10)', 'L (9,15.5)->(11.5,13)']],
  },
  {
    icon: 'bike',
    distance: 3.3,
    reason: smallGapReason,
    pairs: [['A (20,11.5)->(15,16.5)', 'L (15,11.5)->(17.5,14)']],
  },
]

// Points this close along one outline are one bend (a rounded corner), not two strokes.
const bendLength = 4.5
const dotLength = 0.05
// A closed outline this short is a large dot (a ring around a point, diameter 3.0), held to the dot rule.
const markLength = 10
const flattenStep = 0.25

const tokenPattern = /[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g
const argumentCounts = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 }

function flattenArc(startX, startY, radiusX, radiusY, rotation, largeArc, sweep, endX, endY) {
  if (radiusX === 0 || radiusY === 0) return [[endX, endY]]
  const angle = (rotation * Math.PI) / 180
  const cosine = Math.cos(angle)
  const sine = Math.sin(angle)
  const halfX = (startX - endX) / 2
  const halfY = (startY - endY) / 2
  const rotatedX = cosine * halfX + sine * halfY
  const rotatedY = -sine * halfX + cosine * halfY
  radiusX = Math.abs(radiusX)
  radiusY = Math.abs(radiusY)
  const scale = rotatedX ** 2 / radiusX ** 2 + rotatedY ** 2 / radiusY ** 2
  if (scale > 1) {
    radiusX *= Math.sqrt(scale)
    radiusY *= Math.sqrt(scale)
  }
  const numerator =
    radiusX ** 2 * radiusY ** 2 - radiusX ** 2 * rotatedY ** 2 - radiusY ** 2 * rotatedX ** 2
  const denominator = radiusX ** 2 * rotatedY ** 2 + radiusY ** 2 * rotatedX ** 2
  let factor = denominator ? Math.sqrt(Math.max(0, numerator / denominator)) : 0
  if (largeArc === sweep) factor = -factor
  const centreXRotated = (factor * radiusX * rotatedY) / radiusY
  const centreYRotated = (-factor * radiusY * rotatedX) / radiusX
  const centreX = cosine * centreXRotated - sine * centreYRotated + (startX + endX) / 2
  const centreY = sine * centreXRotated + cosine * centreYRotated + (startY + endY) / 2
  const startAngle = Math.atan2(
    (rotatedY - centreYRotated) / radiusY,
    (rotatedX - centreXRotated) / radiusX,
  )
  let sweepAngle =
    Math.atan2((-rotatedY - centreYRotated) / radiusY, (-rotatedX - centreXRotated) / radiusX) -
    startAngle
  if (sweep && sweepAngle < 0) sweepAngle += 2 * Math.PI
  if (!sweep && sweepAngle > 0) sweepAngle -= 2 * Math.PI
  const steps = Math.max(
    4,
    Math.ceil((Math.abs(sweepAngle) * Math.max(radiusX, radiusY)) / flattenStep),
  )
  const points = []
  for (let step = 1; step <= steps; step += 1) {
    const theta = startAngle + (sweepAngle * step) / steps
    const x = radiusX * Math.cos(theta)
    const y = radiusY * Math.sin(theta)
    points.push([cosine * x - sine * y + centreX, sine * x + cosine * y + centreY])
  }
  points[points.length - 1] = [endX, endY]
  return points
}

function flattenBezier(controlPoints) {
  const steps = 32
  const points = []
  for (let step = 1; step <= steps; step += 1) {
    const t = step / steps
    let level = controlPoints
    while (level.length > 1) {
      level = level
        .slice(1)
        .map((point, index) => [
          level[index][0] + (point[0] - level[index][0]) * t,
          level[index][1] + (point[1] - level[index][1]) * t,
        ])
    }
    points.push(level[0])
  }
  return points
}

/** Splits a path into commands. Each command is a stroke piece: its start, its end and the flattened points between. */
function pathCommands(data) {
  const tokens = data.match(tokenPattern) ?? []
  const commands = []
  let index = 0
  let command = ''
  let x = 0
  let y = 0
  let startX = 0
  let startY = 0
  let previousControl = null
  let subpath = null
  const next = () => Number(tokens[index++])
  const begin = () => {
    subpath = { closed: false, length: 0 }
  }
  const add = (name, points) => {
    if (!subpath) begin()
    commands.push({ name, subpath, start: [x, y], points })
    x = points[points.length - 1][0]
    y = points[points.length - 1][1]
  }
  while (index < tokens.length) {
    if (/[A-Za-z]/.test(tokens[index])) command = tokens[index++]
    const relative = command === command.toLowerCase()
    const kind = command.toUpperCase()
    const offsetX = relative ? x : 0
    const offsetY = relative ? y : 0
    if (kind === 'Z') {
      if (subpath) subpath.closed = true
      if (x !== startX || y !== startY) add('Z', [[startX, startY]])
      x = startX
      y = startY
      subpath = null
      previousControl = null
      continue
    }
    const values = Array.from({ length: argumentCounts[kind] }, next)
    if (kind === 'M') {
      x = values[0] + offsetX
      y = values[1] + offsetY
      startX = x
      startY = y
      begin()
      command = relative ? 'l' : 'L'
      previousControl = null
    } else if (kind === 'L') {
      add('L', [[values[0] + offsetX, values[1] + offsetY]])
      previousControl = null
    } else if (kind === 'H') {
      add('H', [[relative ? x + values[0] : values[0], y]])
      previousControl = null
    } else if (kind === 'V') {
      add('V', [[x, relative ? y + values[0] : values[0]]])
      previousControl = null
    } else if (kind === 'C' || kind === 'S') {
      const first =
        kind === 'C'
          ? [values[0] + offsetX, values[1] + offsetY]
          : previousControl
            ? [2 * x - previousControl[0], 2 * y - previousControl[1]]
            : [x, y]
      const rest = kind === 'C' ? values.slice(2) : values
      const second = [rest[0] + offsetX, rest[1] + offsetY]
      const end = [rest[2] + offsetX, rest[3] + offsetY]
      add(kind, flattenBezier([[x, y], first, second, end]))
      previousControl = second
    } else if (kind === 'Q' || kind === 'T') {
      const control =
        kind === 'Q'
          ? [values[0] + offsetX, values[1] + offsetY]
          : previousControl
            ? [2 * x - previousControl[0], 2 * y - previousControl[1]]
            : [x, y]
      const rest = kind === 'Q' ? values.slice(2) : values
      add(kind, flattenBezier([[x, y], control, [rest[0] + offsetX, rest[1] + offsetY]]))
      previousControl = control
    } else if (kind === 'A') {
      const [radiusX, radiusY, rotation, largeArc, sweep, endX, endY] = values
      add(
        'A',
        flattenArc(
          x,
          y,
          radiusX,
          radiusY,
          rotation,
          largeArc,
          sweep,
          endX + offsetX,
          endY + offsetY,
        ),
      )
      previousControl = null
    }
  }
  return commands
}

function shapePathData(tag, attributes) {
  const number = (name, fallback = 0) => Number(attributes[name] ?? fallback)
  if (tag === 'path') return attributes.d
  if (tag === 'line') {
    return `M${attributes.x1} ${attributes.y1}L${attributes.x2} ${attributes.y2}`
  }
  if (tag === 'polyline') return `M${attributes.points.trim().replace(/\s+/g, ' L')}`
  if (tag === 'circle' || tag === 'ellipse') {
    const centreX = number('cx')
    const centreY = number('cy')
    const radiusX = number(tag === 'circle' ? 'r' : 'rx')
    const radiusY = number(tag === 'circle' ? 'r' : 'ry')
    return (
      `M${centreX + radiusX} ${centreY}` +
      `A${radiusX} ${radiusY} 0 0 1 ${centreX} ${centreY + radiusY}` +
      `A${radiusX} ${radiusY} 0 0 1 ${centreX - radiusX} ${centreY}` +
      `A${radiusX} ${radiusY} 0 0 1 ${centreX} ${centreY - radiusY}` +
      `A${radiusX} ${radiusY} 0 0 1 ${centreX + radiusX} ${centreY}Z`
    )
  }
  const x = number('x')
  const y = number('y')
  const width = number('width')
  const height = number('height')
  const radiusX = Math.min(number('rx', attributes.ry ?? 0), width / 2)
  const radiusY = Math.min(number('ry', attributes.rx ?? 0), height / 2)
  const corner = (dx, dy) => `a${radiusX} ${radiusY} 0 0 1 ${dx} ${dy}`
  return (
    `M${x + radiusX} ${y}h${width - 2 * radiusX}${corner(radiusX, radiusY)}` +
    `v${height - 2 * radiusY}${corner(-radiusX, radiusY)}` +
    `h${-(width - 2 * radiusX)}${corner(-radiusX, -radiusY)}` +
    `v${-(height - 2 * radiusY)}${corner(radiusX, -radiusY)}Z`
  )
}

const format = (value) => String(Math.round(value * 100) / 100)

const lineStep = 0.5

function subdivide(from, to) {
  const steps = Math.max(1, Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1]) / lineStep))
  return Array.from({ length: steps }, (_, step) => [
    from[0] + ((to[0] - from[0]) * (step + 1)) / steps,
    from[1] + ((to[1] - from[1]) * (step + 1)) / steps,
  ])
}

const directionOf = (edge) => Math.atan2(edge.to[1] - edge.from[1], edge.to[0] - edge.from[0])

function iconCommands(shapes) {
  const raw = shapes.flatMap(([tag, attributes], shapeIndex) =>
    pathCommands(shapePathData(tag, attributes)).map((command, commandIndex) => ({
      ...command,
      tag,
      shapeIndex,
      commandIndex,
    })),
  )
  // A path that ends where it started is a closed outline even without a Z (a ring drawn as two arcs).
  const outlines = new Map()
  for (const command of raw) {
    const outline = outlines.get(command.subpath) ?? { first: command, last: command }
    outline.last = command
    outlines.set(command.subpath, outline)
  }
  for (const [subpath, { first, last }] of outlines) {
    const end = last.points[last.points.length - 1]
    if (Math.hypot(end[0] - first.start[0], end[1] - first.start[1]) < touchTolerance) {
      subpath.closed = true
    }
  }
  const nodeCounts = new Map()
  const commands = raw.map((command) => {
    const straight = ['L', 'H', 'V', 'Z'].includes(command.name)
    const points = straight ? subdivide(command.start, command.points[0]) : command.points
    const { subpath } = command
    if (!nodeCounts.has(subpath)) nodeCounts.set(subpath, 0)
    const edges = []
    let [fromX, fromY] = command.start
    let length = 0
    for (const [toX, toY] of points) {
      const edgeLength = Math.hypot(toX - fromX, toY - fromY)
      const node = nodeCounts.get(subpath)
      nodeCounts.set(subpath, node + 1)
      edges.push({
        from: [fromX, fromY],
        to: [toX, toY],
        before: subpath.length + length,
        after: subpath.length + length + edgeLength,
        nodes: [node, node + 1],
      })
      length += edgeLength
      fromX = toX
      fromY = toY
    }
    subpath.length += length
    const end = points[points.length - 1]
    const turn = Math.abs(
      ((directionOf(edges[edges.length - 1]) - directionOf(edges[0]) + 3 * Math.PI) %
        (2 * Math.PI)) -
        Math.PI,
    )
    const deltaX = Math.abs(end[0] - command.start[0])
    const deltaY = Math.abs(end[1] - command.start[1])
    const built = {
      signature: `${command.name} (${format(command.start[0])},${format(command.start[1])})->(${format(end[0])},${format(end[1])})`,
      shapeIndex: command.shapeIndex,
      subpath,
      edges,
      length,
      turn,
      curved: !straight,
      diagonal: straight && deltaX > 0.5 && Math.abs(deltaX - deltaY) < 0.05,
    }
    built.label = `${command.tag}#${command.shapeIndex + 1}.${command.commandIndex + 1} ${built.signature}`
    for (const edge of edges) edge.command = built
    return built
  })
  for (const command of commands) {
    if (command.subpath.closed) {
      const last = command.edges[command.edges.length - 1]
      if (last.nodes[1] === nodeCounts.get(command.subpath)) last.nodes[1] = 0
    }
    command.isMark =
      command.length < dotLength || (command.subpath.closed && command.subpath.length < markLength)
  }
  const members = Map.groupBy(commands, (command) => command.subpath)
  commands.forEach((command, index) => {
    const siblings = members.get(command.subpath)
    const position = siblings.indexOf(command)
    command.previous = siblings[position - 1]
    command.next = siblings[position + 1]
    command.index = index
    command.ring = command.subpath.closed && siblings.every((sibling) => sibling.curved)
    // A rounded corner of a straight outline: its straight edges are what must keep the gap.
    command.corner =
      command.curved &&
      command.length <= 4 &&
      command.turn <= (100 * Math.PI) / 180 &&
      Boolean(command.previous && !command.previous.curved) !== false &&
      siblings.some((sibling) => !sibling.curved)
  })
  return commands
}

function segmentDistance([ax, ay], [bx, by], [cx, cy], [dx, dy]) {
  const crossing = (px, py, qx, qy, rx, ry) => (qx - px) * (ry - py) - (qy - py) * (rx - px)
  const first = crossing(ax, ay, bx, by, cx, cy)
  const second = crossing(ax, ay, bx, by, dx, dy)
  const third = crossing(cx, cy, dx, dy, ax, ay)
  const fourth = crossing(cx, cy, dx, dy, bx, by)
  if (first * second < 0 && third * fourth < 0) return 0
  const toSegment = (px, py, qx, qy, rx, ry) => {
    const lengthSquared = (rx - qx) ** 2 + (ry - qy) ** 2
    const t = lengthSquared
      ? Math.max(0, Math.min(1, ((px - qx) * (rx - qx) + (py - qy) * (ry - qy)) / lengthSquared))
      : 0
    return Math.hypot(px - (qx + t * (rx - qx)), py - (qy + t * (ry - qy)))
  }
  return Math.min(
    toSegment(ax, ay, cx, cy, dx, dy),
    toSegment(bx, by, cx, cy, dx, dy),
    toSegment(cx, cy, ax, ay, bx, by),
    toSegment(dx, dy, ax, ay, bx, by),
  )
}

const tangent = (edge) => {
  const length = Math.hypot(edge.to[0] - edge.from[0], edge.to[1] - edge.from[1]) || 1
  return [(edge.to[0] - edge.from[0]) / length, (edge.to[1] - edge.from[1]) / length]
}
const alignment = (first, second) => {
  const [one, other] = [tangent(first), tangent(second)]
  return Math.abs(one[0] * other[0] + one[1] * other[1])
}
const midpoint = (edge) => [(edge.from[0] + edge.to[0]) / 2, (edge.from[1] + edge.to[1]) / 2]

/** Strokes that meet, and the walk along them, so a bend or a junction is told from two strokes side by side. */
function buildJunctions(commands) {
  const subpathIds = new Map()
  for (const command of commands) {
    if (!subpathIds.has(command.subpath)) subpathIds.set(command.subpath, subpathIds.size)
  }
  const nodeKey = (subpath, node) => `${subpathIds.get(subpath)}:${node}`
  const links = new Map()
  const link = (first, second, cost) => {
    if (!links.has(first)) links.set(first, [])
    if (!links.has(second)) links.set(second, [])
    links.get(first).push([second, cost])
    links.get(second).push([first, cost])
  }
  const edges = commands.flatMap((command) =>
    command.edges.map((edge) => ({
      edge,
      keys: edge.nodes.map((node) => nodeKey(command.subpath, node)),
      command,
    })),
  )
  for (const { edge, keys } of edges) {
    link(keys[0], keys[1], Math.hypot(edge.to[0] - edge.from[0], edge.to[1] - edge.from[1]))
  }
  const boxes = edges.map(({ edge }) => [
    Math.min(edge.from[0], edge.to[0]) - paintedJoin,
    Math.min(edge.from[1], edge.to[1]) - paintedJoin,
    Math.max(edge.from[0], edge.to[0]) + paintedJoin,
    Math.max(edge.from[1], edge.to[1]) + paintedJoin,
  ])
  const touching = new Set()
  const tangentRings = new Set()
  const joints = []
  const pairKey = (first, second) => `${Math.min(first, second)}:${Math.max(first, second)}`
  for (let first = 0; first < edges.length; first += 1) {
    for (let second = first + 1; second < edges.length; second += 1) {
      const [a, b] = [boxes[first], boxes[second]]
      if (a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]) continue
      const [one, other] = [edges[first], edges[second]]
      if (one.command === other.command) continue
      const distance = segmentDistance(one.edge.from, one.edge.to, other.edge.from, other.edge.to)
      if (distance >= paintedJoin) continue
      for (const left of one.keys) {
        for (const right of other.keys) link(left, right, lineStep / 2)
      }
      const tolerance =
        one.command.curved || other.command.curved ? arcTouchTolerance : touchTolerance
      if (distance < tolerance) {
        touching.add(pairKey(one.command.index, other.command.index))
        for (const [ring, stroke] of [
          [one.command, other.command],
          [other.command, one.command],
        ]) {
          if (ring.ring && !stroke.ring && alignment(one.edge, other.edge) > 0.95) {
            tangentRings.add(`${subpathIds.get(ring.subpath)}:${stroke.index}`)
          }
        }
      }
      if (one.command.shapeIndex !== other.command.shapeIndex) {
        const [left, right] = [midpoint(one.edge), midpoint(other.edge)]
        if (alignment(one.edge, other.edge) <= divergence + 0.02)
          joints.push({
            shapes: pairKey(one.command.shapeIndex, other.command.shapeIndex),
            point: [(left[0] + right[0]) / 2, (left[1] + right[1]) / 2],
          })
      }
    }
  }
  const walk = (sources, targets) => {
    const best = new Map(sources.map((key) => [key, 0]))
    const queue = [...sources]
    while (queue.length) {
      queue.sort((left, right) => best.get(right) - best.get(left))
      const key = queue.pop()
      const cost = best.get(key)
      if (targets.includes(key)) return cost
      for (const [other, step] of links.get(key) ?? []) {
        const total = cost + step
        if (total < bendLength && total < (best.get(other) ?? Infinity)) {
          best.set(other, total)
          queue.push(other)
        }
      }
    }
    return Infinity
  }
  return {
    touches: (first, second) => touching.has(pairKey(first, second)),
    tangentToRing: (ring, stroke) =>
      tangentRings.has(`${subpathIds.get(ring.subpath)}:${stroke.index}`),
    walk: (first, second, firstCommand, secondCommand) =>
      walk(
        first.nodes.map((node) => nodeKey(firstCommand.subpath, node)),
        second.nodes.map((node) => nodeKey(secondCommand.subpath, node)),
      ),
    nearDivergingJoint: (first, second) => {
      if (first.command.shapeIndex === second.command.shapeIndex) return false
      const shapes = pairKey(first.command.shapeIndex, second.command.shapeIndex)
      const [left, right] = [midpoint(first), midpoint(second)]
      return joints.some(
        ({ shapes: jointShapes, point }) =>
          jointShapes === shapes &&
          Math.hypot(left[0] - point[0], left[1] - point[1]) < armLength &&
          Math.hypot(right[0] - point[0], right[1] - point[1]) < armLength,
      )
    },
  }
}

const geometryOf = (label) => label.replace(/^\S+ /, '')
const allowed = (finding) =>
  allowList.some(
    (entry) =>
      entry.icon === finding.icon &&
      finding.distance >= entry.distance - slack &&
      (!entry.pairs ||
        entry.pairs.some(
          ([one, other]) =>
            (geometryOf(finding.first) === one && geometryOf(finding.second) === other) ||
            (geometryOf(finding.first) === other && geometryOf(finding.second) === one),
        )),
  )

/**
 * Pairs of strokes of one icon that never meet but come within the centre-line limit.
 * The patterns listed with the constants above are joins, not gaps, and pass.
 */
export function findGaps(file, source) {
  const commands = iconCommands(parseIcon(file, source))
  const junctions = buildJunctions(commands)
  const findings = []
  const isEnd = (command, edge) =>
    edge === command.edges[0] || edge === command.edges[command.edges.length - 1]
  for (let firstIndex = 0; firstIndex < commands.length; firstIndex += 1) {
    for (let secondIndex = firstIndex; secondIndex < commands.length; secondIndex += 1) {
      const first = commands[firstIndex]
      const second = commands[secondIndex]
      const sameCommand = firstIndex === secondIndex
      if (!sameCommand && junctions.touches(firstIndex, secondIndex)) continue
      if (
        (second.ring &&
          first.subpath !== second.subpath &&
          junctions.tangentToRing(second, first)) ||
        (first.ring && first.subpath !== second.subpath && junctions.tangentToRing(first, second))
      ) {
        continue
      }
      if (isWedge(first, second)) continue
      const limit = first.isMark || second.isMark ? dotLimit : strokeLimit
      let nearest = Infinity
      if (sameCommand) {
        const [start, end] = [first.edges[0], first.edges[first.edges.length - 1]]
        const hairpin = alignment(start, end) > 0.98 && Math.cos(first.turn) < 0
        if (hairpin) nearest = Math.hypot(start.from[0] - end.to[0], start.from[1] - end.to[1])
      } else {
        for (const firstEdge of first.edges) {
          if (first.corner && !isEnd(first, firstEdge)) continue
          for (const secondEdge of second.edges) {
            if (second.corner && !isEnd(second, secondEdge)) continue
            const distance = segmentDistance(
              firstEdge.from,
              firstEdge.to,
              secondEdge.from,
              secondEdge.to,
            )
            if (distance >= nearest || distance >= limit - slack) continue
            if (distance < paintedJoin) continue
            if (junctions.walk(firstEdge, secondEdge, first, second) < bendLength) continue
            if (junctions.nearDivergingJoint(firstEdge, secondEdge)) continue
            nearest = distance
          }
        }
      }
      if (nearest === Infinity) continue
      if (
        sameCommand &&
        nearest >= limit - (first.curved && first.length < 12 ? hairpinSlack : slack)
      ) {
        continue
      }
      if (first.isMark && second.isMark && nearest < 1) continue
      const joinedByCorner = commands.some(
        (connector, index) =>
          index !== firstIndex &&
          index !== secondIndex &&
          connector.curved &&
          connector.length <= 4 &&
          connector.turn <= (100 * Math.PI) / 180 &&
          junctions.touches(index, firstIndex) &&
          junctions.touches(index, secondIndex),
      )
      if (joinedByCorner) continue
      const finding = {
        icon: file.replace(/\.svg$/, ''),
        first: first.label,
        second: second.label,
        distance: nearest,
        clear: nearest - strokeWidth,
      }
      if (!allowed(finding)) findings.push(finding)
    }
  }
  return findings
}

// A wedge: a straight run, a longer link and a third stroke of one path, one of them at 45 degrees.
function isWedge(first, second) {
  if (first.subpath !== second.subpath || first.next?.next !== second) return false
  const link = first.next
  return link.length >= strokeLimit && (first.diagonal || link.diagonal || second.diagonal)
}

export function findAllGaps(svgDirectory) {
  return readdirSync(svgDirectory)
    .filter((file) => file.endsWith('.svg'))
    .sort()
    .flatMap((file) => findGaps(file, readFileSync(join(svgDirectory, file), 'utf8')))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const findings = findAllGaps(process.argv[2] ?? join(packageRoot, 'svg'))
  for (const finding of findings) {
    console.log(
      `${finding.icon}: ${finding.first} | ${finding.second} centre-line ${finding.distance.toFixed(2)}, clear ${finding.clear.toFixed(2)}`,
    )
  }
  process.exitCode = findings.length ? 1 : 0
}

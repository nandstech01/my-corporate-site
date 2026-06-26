/**
 * Convert a world GeoJSON (Polygon/MultiPolygon countries) into a single
 * Float32Array of line-segment vertices on a sphere — one draw call for all
 * country borders / coastlines. Keeps the kiosk globe performant.
 */

import * as THREE from 'three'

export function llToVec(lat: number, lon: number, r = 1): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lon + 180) * Math.PI) / 180
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

interface GeoJSON {
  features?: Array<{ geometry?: { type: string; coordinates: unknown } }>
}

/** Returns segment vertices (pairs) for <lineSegments>. step decimates dense rings. */
export function geojsonToSegments(geo: GeoJSON, r = 1.002, step = 1): Float32Array {
  const out: number[] = []
  const pushRing = (ring: number[][]) => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i < ring.length; i += step) {
      const c = ring[i]
      if (!c || c.length < 2) continue
      pts.push(llToVec(c[1], c[0], r))
    }
    // ensure ring closes
    if (ring.length && (ring.length - 1) % step !== 0) {
      const c = ring[ring.length - 1]
      if (c && c.length >= 2) pts.push(llToVec(c[1], c[0], r))
    }
    for (let i = 0; i < pts.length - 1; i++) {
      out.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z)
    }
  }
  for (const f of geo.features ?? []) {
    const g = f.geometry
    if (!g) continue
    if (g.type === 'Polygon') {
      for (const ring of g.coordinates as number[][][]) pushRing(ring)
    } else if (g.type === 'MultiPolygon') {
      for (const poly of g.coordinates as number[][][][]) for (const ring of poly) pushRing(ring)
    }
  }
  return new Float32Array(out)
}

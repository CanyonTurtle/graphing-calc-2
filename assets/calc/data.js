// Point data type. represents a place and a type of point.
// Used extensively thruought graphing functions.
export function Point (t, x, y) {
  var pt = { mtype: 'normal' }
  pt.mtype = t
  pt.mx = x
  pt.my = y
  return pt
}

// Represents a set of:
// - normal points
// - special points (zeros, inflection, etc.)
//
// also has information about the biggest and smallest Y value
// which is used for calculating the view size later.
export function PointSet () {
  var ptset = {}
  ptset.pts = []
  ptset.spts = []
  ptset.minYV = 0
  ptset.maxYV = 0
  ptset.addNormalPoint = (pt) => {
    ptset.pts.push(pt)
  }
  ptset.addSpecialPoint = (pt) => {
    ptset.spts.push(pt)
  }
  ptset.clearSpecialsByName = (name) => {
    ptset.spts = ptset.spts.filter((spt) => {
      if (spt.mtype === name) {
        return false
      }
      return true
    })
  }
  return ptset
}

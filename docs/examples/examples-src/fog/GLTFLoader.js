/* TAKEN FROM https://www.patreon.com/posts/raw-gltf-parsing-28395927 */

export default class GLTF {
  /**
   * Returns the geometry data for all the primatives that make up a Mesh based on the name
   * that the mesh appears in the nodes list.
   * @param {string} name - Name of a node in the GLTF Json file
   * @param {object} json - GLTF Json Object
   * @param {ArrayBuffer} bin - Array buffer of a bin file
   * @public @return {Array.{name,mode,position,vertices,normal,uv,weights,joints}}
   */
  static getMesh(name, json, bin) {
    // Find Mesh to parse out.
    var i,
      nn,
      n = null
    for (i = 0; i < json.nodes.length; i++) {
      nn = json.nodes[i]
      if (nn.name === name && nn.mesh != undefined) {
        n = nn
        break
      }
    }

    if (!n) {
      console.error('Node by the name', name, 'not found in GLTF Node Array')
      return null
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Loop through all the primatives that make up a single mesh
    var m = json.meshes[n.mesh],
      ary = new Array(m.primitives.length),
      itm,
      prim,
      attr

    for (var i = 0; i < m.primitives.length; i++) {
      //.......................................
      // Setup some vars
      prim = m.primitives[i]
      attr = prim.attributes
      itm = {
        name: name + '_p' + i,
        mode: prim.mode != undefined ? prim.mode : GLTF.MODE_TRIANGLES,
      }

      //.......................................
      // Save Position, Rotation and Scale if Available.
      if (n.translation) itm.position = n.translation.slice(0)
      if (n.rotation) itm.rotation = n.rotation.slice(0)
      if (n.scale) itm.scale = n.scale.slice(0)

      //.......................................
      // Parse out all the raw Geometry Data from the Bin file
      itm.vertices = GLTF.parseAccessor(attr.POSITION, json, bin)
      if (prim.indices != undefined)
        itm.indices = GLTF.parseAccessor(prim.indices, json, bin)
      if (attr.NORMAL != undefined)
        itm.normal = GLTF.parseAccessor(attr.NORMAL, json, bin)
      if (attr.TEXCOORD_0 != undefined)
        itm.uv = GLTF.parseAccessor(attr.TEXCOORD_0, json, bin)
      if (attr.WEIGHTS_0 != undefined)
        itm.weights = GLTF.parseAccessor(attr.WEIGHTS_0, json, bin)
      if (attr.JOINTS_0 != undefined)
        itm.joints = GLTF.parseAccessor(attr.JOINTS_0, json, bin)

      //.......................................
      // Save to return array
      ary[i] = itm
    }

    return ary
  }

  /**
   * Parse out a single buffer of data from the bin file based on an accessor index. (Vertices, Normal, etc)
   * @param {number} idx - Index of an Accessor
   * @param {object} json - GLTF Json Object
   * @param {ArrayBuffer} bin - Array buffer of a bin file
   * @public @return {data:TypeArray, min, max, elmCount, compLen}
   */
  static parseAccessor(idx, json, bin) {
    var acc = json.accessors[idx], // Reference to Accessor JSON Element
      bView = json.bufferViews[acc.bufferView], // Buffer Information
      compLen = GLTF['COMP_' + acc.type], // Component Length for Data Element
      ary = null, // Final Type array that will be filled with data
      TAry, // Reference to Type Array to create
      DFunc // Reference to GET function in Type Array

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Figure out which Type Array we need to save the data in
    switch (acc.componentType) {
      case GLTF.TYPE_FLOAT:
        TAry = Float32Array
        DFunc = 'getFloat32'
        break
      case GLTF.TYPE_SHORT:
        TAry = Int16Array
        DFunc = 'getInt16'
        break
      case GLTF.TYPE_UNSIGNED_SHORT:
        TAry = Uint16Array
        DFunc = 'getUint16'
        break
      case GLTF.TYPE_UNSIGNED_INT:
        TAry = Uint32Array
        DFunc = 'getUint32'
        break
      case GLTF.TYPE_UNSIGNED_BYTE:
        TAry = Uint8Array
        DFunc = 'getUint8'
        break

      default:
        console.log(
          'ERROR processAccessor',
          'componentType unknown',
          a.componentType,
        )
        return null
        break
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Data is Interlaced
    if (bView.byteStride) {
      var stride = bView.byteStride, // Stride Length in bytes
        elmCnt = acc.count, // How many stride elements exist.
        bOffset = bView.byteOffset || 0, // Buffer Offset
        sOffset = acc.byteOffset || 0, // Stride Offset
        bPer = TAry.BYTES_PER_ELEMENT, // How many bytes to make one value of the data type
        aryLen = elmCnt * compLen, // How many "floats/ints" need for this array
        dView = new DataView(bin), // Access to Binary Array Buffer
        p = 0, // Position Index of Byte Array
        j = 0, // Loop Component Length ( Like a Vec3 at a time )
        k = 0 // Position Index of new Type Array

      ary = new TAry(aryLen) //Final Array

      //Loop for each element of by stride
      for (var i = 0; i < elmCnt; i++) {
        // Buffer Offset + (Total Stride * Element Index) + Sub Offset within Stride Component
        p = bOffset + stride * i + sOffset //Calc Starting position for the stride of data

        //Then loop by compLen to grab stuff out of the DataView and into the Typed Array
        for (j = 0; j < compLen; j++)
          ary[k++] = dView[DFunc](p + j * bPer, true)
      }

      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      // Data is NOT interlaced
      // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#data-alignment
      // TArray example from documentation works pretty well for data that is not interleaved.
    } else {
      var bOffset = (acc.byteOffset || 0) + (bView.byteOffset || 0),
        elmCnt = acc.count

      ary = new TAry(bin, bOffset, elmCnt * compLen)
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    return {
      data: ary,
      min: acc.min,
      max: acc.max,
      elmCount: acc.count,
      compLen: GLTF['COMP_' + acc.type],
    }
  }
}

////////////////////////////////////////////////////////
// CONSTANTS
////////////////////////////////////////////////////////
GLTF.MODE_POINTS = 0 //Mode Constants for GLTF and WebGL are identical
GLTF.MODE_LINES = 1 //https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Constants
GLTF.MODE_LINE_LOOP = 2
GLTF.MODE_LINE_STRIP = 3
GLTF.MODE_TRIANGLES = 4
GLTF.MODE_TRIANGLE_FAN = 6

GLTF.TYPE_BYTE = 5120
GLTF.TYPE_UNSIGNED_BYTE = 5121
GLTF.TYPE_SHORT = 5122
GLTF.TYPE_UNSIGNED_SHORT = 5123
GLTF.TYPE_UNSIGNED_INT = 5125
GLTF.TYPE_FLOAT = 5126

GLTF.COMP_SCALAR = 1
GLTF.COMP_VEC2 = 2
GLTF.COMP_VEC3 = 3
GLTF.COMP_VEC4 = 4
GLTF.COMP_MAT2 = 4
GLTF.COMP_MAT3 = 9
GLTF.COMP_MAT4 = 16

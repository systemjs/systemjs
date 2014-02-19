"use strict"

/* var shell = require("npm:gl-now@0.0")()
var createTileMap = require("npm:gl-tile-map@0.3")
var createBuffer = require("npm:gl-buffer@0.1")
var createVAO = require("npm:gl-vao@0.0")
var glm = require("npm:gl-matrix@2.0")
var ndarray = require("npm:ndarray@1.0")
var fill = require("npm:ndarray-fill@0.1")
var ops = require("npm:ndarray-ops@1.1")
var createAOMesh = require("npm:ao-mesher@0.2")

var shaderVsh = require("npm:ao-shader@0.2/lib/ao.vsh!text");
var shaderFsh = require("npm:ao-shader@0.2/lib/ao.fsh!text"); */

var createShader = require('npm:gl-shader@0.0.6');

var mat4 = glm.mat4

//The shader
var shader

//Tile texture
var texture

//Mesh data variables
var vao, vertexCount

shell.on("gl-init", function() {
  var gl = shell.gl

  //Create shader
  shader = createShader(gl, shaderVsh, shaderFsh);
  
  //Create some voxels
  var voxels = ndarray(new Uint16Array(32*32*32), [32,32,32])
  voxels.set(16,16,16, 1<<15)
  
  fill(voxels, function(i,j,k) {
    var x = Math.abs(i - 16)
    var y = Math.abs(j - 16)
    var z = Math.abs(k - 16)
    return (x*x+y*y+z*z) < 30 ? 1<<15 : 0
  })
  
  //Compute mesh
  var vert_data = createAOMesh(voxels)
  
  //Convert mesh to WebGL buffer
  vertexCount = Math.floor(vert_data.length/8)
  var vert_buf = createBuffer(gl, vert_data)
  vao = createVAO(gl, undefined, [
    { "buffer": vert_buf,
      "type": gl.UNSIGNED_BYTE,
      "size": 4,
      "offset": 0,
      "stride": 8,
      "normalized": false
    },
    { "buffer": vert_buf,
      "type": gl.UNSIGNED_BYTE,
      "size": 4,
      "offset": 4,
      "stride": 8,
      "normalized": false
    }
  ])
  
  //Just create all white texture for now
  var tiles = ndarray(new Uint8Array(256*256*4), [16,16,16,16,4])
  fill(tiles, function(x,y,i,j,c) {
    if(c === 3) {
      return 255
    }
    return x*c+y*y*c+((i>>2)+(j>>2))&1 ? 255 : 0
  })
  texture = createTileMap(gl, tiles, true)
})

shell.on("gl-render", function(t) {
  var gl = shell.gl

  gl.enable(gl.CULL_FACE)
  gl.enable(gl.DEPTH_TEST)

  //Bind the shader
  shader.bind()
  
  //Set shader attributes
  shader.attributes.attrib0.location = 0
  shader.attributes.attrib1.location = 1
  
  //Set up camera parameters
  var A = new Float32Array(16)
  shader.uniforms.projection = mat4.perspective(A, Math.PI/4.0, shell.width/shell.height, 1.0, 1000.0)
  
  var t = 0.0001*Date.now()
  
  shader.uniforms.view = mat4.lookAt(A, [30*Math.cos(t) + 16,20,30*Math.sin(t)+16], [16,16,16], [0, 1, 0])

  //Set tile size
  shader.uniforms.tileSize = 16.0
  
  //Set texture
  if(texture) {
    shader.uniforms.tileMap = texture.bind()
  }
  
  //Draw instanced mesh
  shader.uniforms.model = mat4.identity(A)
  vao.bind()
  gl.drawArrays(gl.TRIANGLES, 0, vertexCount)
  vao.unbind()
})
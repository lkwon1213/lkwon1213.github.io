/**
 * Implemented from Liam Egan's Tutorial here: 
 * https://tympanus.net/codrops/2019/04/24/how-to-build-an-underwater-style-navigation-using-pixijs/
 *
 * @class ScreenFilter
 * @augments PIXI.Filter
 */
export class ScreenFilter extends PIXI.Filter {

    /**
     * The Screenfilter constructor assembles all of the uniforms 
     * and initialises the superclass.
     *
     * @constructor
     * @param {Number} resolution         The resolution of the application, essentially the pixel depth
     */
    constructor(resolution) {
      // Construct the super class based on the default vertex shader and the fragment shader from the ScreenFilter
      super(PIXI.Filter.defaultVertexSrc, ScreenFilter.fragmentSrc);
  
      this.resolution = resolution;
  
      // Set up the filter uniforms
      this.uniforms.time = 0;
      this.uniforms.mouse = [0,0];
      this.uniforms.u_resolution = [window.innerWidth*this.resolution,window.innerHeight*this.resolution];
      this.uniforms.ratio = this.uniforms.u_resolution[1] < this.uniforms.u_resolution[0] ? this.uniforms.u_resolution[0] / this.uniforms.u_resolution[1] : this.uniforms.u_resolution[1] / this.uniforms.u_resolution[0];
  
      // This simply stops the filter from passing unexpected params to our shader
      this.autoFit = false;
      
      // Bund our resize handler
      this.onResize = this.onResize.bind(this);
      window.addEventListener('resize', this.onResize);
    }
  
    /**
     * Reacts to the window resize event. Calculates the new size of the filter
     *
     * @public
     * @return null
     */
    onResize() {
      this.uniforms.u_resolution = [window.innerWidth*this.resolution,window.innerHeight*this.resolution];
      this.uniforms.ratio = this.uniforms.u_resolution[1] < this.uniforms.u_resolution[0] ? this.uniforms.u_resolution[0] / this.uniforms.u_resolution[1] : this.uniforms.u_resolution[1] / this.uniforms.u_resolution[0];
    }
  
    /**
     * (getter) The fragment shader for the screen filter
     *
     * @static
     * @type {string}
     */
    static get fragmentSrc() {
      return `
    /*
      Sceen distortion filter
      -------------------
      
      This shader expects to operate on a screen sized container (essentailly the whole menu)
      and take the output of the program and distort it in a radial pattern, applying some
      bloomed blur and noisy waves toward the edge, centered on the mouse.
  
    */  
    precision highp float;
    varying vec2 vTextureCoord;
  
    uniform sampler2D uSampler;
    uniform vec4 inputClamp;
    uniform vec4 inputSize;
    uniform vec4 inputPixel;
    uniform vec4 outputFrame;
    uniform vec2 mouse;
    uniform vec2 u_resolution;
    uniform float ratio;
    uniform float time;
  
    #define PI 3.14159265359
    
    // Return a random number between 0 and 1 based on a vec2
    float rand(vec2 c){
        return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }
  
    // This is sort of a cheap and dirty precursor to full on
    // Perlin noise. We could have happily used a more expensive
    // noise algorithm here, but this is more than sufficient 
    // for our needs.
    float noise(vec2 p, float freq ){
      float unit = inputSize.x/freq;
      vec2 ij = floor(p/unit);
      vec2 xy = mod(p,unit)/unit;
      //xy = 3.*xy*xy-2.*xy*xy*xy;
      xy = .5*(1.-cos(PI*xy));
      float a = rand((ij+vec2(0.,0.)));
      float b = rand((ij+vec2(1.,0.)));
      float c = rand((ij+vec2(0.,1.)));
      float d = rand((ij+vec2(1.,1.)));
      float x1 = mix(a, b, xy.x);
      float x2 = mix(c, d, xy.x);
      return mix(x1, x2, xy.y);
    }
  
    // Blur a texture based on a 7 sample laplacian
    // Fast gaussien blur - https://github.com/Jam3/glsl-fast-gaussian-blur
    vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
      vec4 color = vec4(0.0);
      vec2 off1 = vec2(1.411764705882353) * direction;
      vec2 off2 = vec2(3.2941176470588234) * direction;
      vec2 off3 = vec2(5.176470588235294) * direction;
      color += texture2D(image, uv) * 0.1964825501511404;
      color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
      color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
      color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
      color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
      color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
      color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
      return color;
    }
  
    void main(void){
      // Generate our normalized, centered UV coordinates
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      // Get the mouse coordinates in relation to the frament coords
      vec2 uvm = uv - mouse;
      uvm /= ratio;
      // The radial mouse gradient. We use this to apply our blur
      vec2 raidalmouse = smoothstep(.3, 2., abs(uvm) * 2.);
  
      // Initialise our texture output
      vec4 tex = vec4(0.);
  
      // The centered texture coordinates
      vec2 textureCoord = vTextureCoord - .5;
      // The polar texture coordinates
      vec2 polar = vec2(length(textureCoord), atan(textureCoord.y,textureCoord.x));
      // This distorts the texture in a wave pattern around our mouse position.
      polar.y += smoothstep(.1, 2., abs(uvm.x) * 2.);
      // polar.y += smoothstep(.1, 2., abs(uvm.x) * 4.); // uncomment this to see the effects of ramping up the mouse vector
      // This is just converting our polar texture coordinates back into cartesian coordinates
      textureCoord = vec2( cos(polar.y) * polar.x, sin(polar.y) * polar.x );
  
      // This just increases the size of the text slightly as it gets further from the middle of the mouse position
      // Essentially this is multiplying texture in the Y direction based on the distance from the centre of the mouse
      textureCoord.y *= 1. - abs(uvm.x * 1.5) * .3;
      // textureCoord *= 1. - smoothstep(.2, .5, length(uvm)) * .3; // Uncomment this line to ramp up this effect
  
      // Now, the good stuff!
      // Add some noise to the texture coordinate (with a time component, naturally) and 
      // multiply the effect by a gradient centered on the mouse's position.
      textureCoord += noise(uv, 10000. + sin(time) * 5000.) * smoothstep(.15, 2., abs(uvm.x)) * .6;
      // This just recenters the coordinate
      textureCoord += .5;
  
      // Gather the blur samples build the texture
      //tex = blur13(uSampler, textureCoord, u_resolution, vec2(clamp(raidalmouse.x*20., 0., 5.), 0.));
      //tex += blur13(uSampler, textureCoord, u_resolution, vec2(0., clamp(raidalmouse.x*20., 0., 5.)));
      //tex *= .5;
  
      // If you want to get rid of the blur, use the below instead of the above, it will just spit out the 
      // exact texture based on all of the above
      tex = texture2D(uSampler, textureCoord);
  
      // assemble the colour based on the texture multiplied by a gradient of the mouse position - this 
      // just fades the texture out at the edges
      gl_FragColor = tex * 1. - smoothstep(.5, 1.5, length(uvm)*2.);
  
      // Uncomment the below to output the combination of the blurred, distorted texture and a gradient
      // representing the mouse position
      // gl_FragColor = vec4(vec3(1. - smoothstep(.2, .25, length(uvm)) * .3), 1.);
      // gl_FragColor = mix(gl_FragColor, tex, tex.a);
    }
  `;
    }
  
    /**
     * Override the parent apply method so that we can increment the time uniform for
     * the purpose of supplying a time component to the shader.
     */
    apply(filterManager, input, output) {
      // Increment the time uniform
      this.uniforms.time += .01;
      // Apply the filter.
      filterManager.applyFilter(this, input, output);
    }
    
    /**
     * (getter/setter) The mouse position. Setting this will update the mouse
     * uniform that's supplied to the shader.
     *
     * @type {array}
     * @default [0,0]
     */
    set mousepos(value) {
      if(value instanceof Array && value.length === 2 && !isNaN(value[0]) && !isNaN(value[1])) {
        this._mousepos = value;
        this.uniforms.mouse = value;
      }
    }
    get mousepos() {
      return this._mousepos || [0,0];
    }
  }
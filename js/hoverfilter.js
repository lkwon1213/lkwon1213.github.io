/**
 * Implemented from Liam Egan's Tutorial here: 
 * https://tympanus.net/codrops/2019/04/24/how-to-build-an-underwater-style-navigation-using-pixijs/
 *
 * @class HoverFilter
 * @augments PIXI.Filter
 */
export class HoverFilter extends PIXI.Filter {

    constructor() {
      super(PIXI.Filter.defaultVertexSrc, HoverFilter.fragmentSrc);
      this.uniforms.time = 0;
    }
  
    static get fragmentSrc() {
      return `
    /*
      Hover filter
      -------------------
      
      This shader expects to operate on a display object within a pixi application.
      It takes the output of the display object and applies some noise to it based
      on the objects alpha channel, in this way clamping the colour to the bounts
      of the text that makes up the button
  
    */  
    precision highp float;
    varying vec2 vTextureCoord;
  
    uniform sampler2D uSampler;
    uniform vec4 inputClamp;
    uniform vec4 inputSize;
    uniform vec4 inputPixel;
    uniform vec4 outputFrame;
    uniform float time;
  
    #define PI 3.14159265359
    
    // Return a random number between 0 and 1 based on a vec2
    float rand(vec2 c){
        return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
    }
  
    // Some FBM noise based on a value component
    // see https://thebookofshaders.com/13/ for more details
    #define NUM_OCTAVES 3
    float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}
    float noise(vec3 p){
        vec3 a = floor(p);
        vec3 d = p - a;
        d = d * d * (3.0 - 2.0 * d);
  
        vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
        vec4 k1 = perm(b.xyxy);
        vec4 k2 = perm(k1.xyxy + b.zzww);
  
        vec4 c = k2 + a.zzzz;
        vec4 k3 = perm(c);
        vec4 k4 = perm(c + 1.0);
  
        vec4 o1 = fract(k3 * (1.0 / 41.0));
        vec4 o2 = fract(k4 * (1.0 / 41.0));
  
        vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
        vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);
  
        return o4.y * d.y + o4.x * (1.0 - d.y);
    }
    float fbm(vec3 x) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100);
      for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }
  
    float distortedFBM(in vec3 x) {
      float t = fbm(x);
      x.xy += (t -.5);
      t *= fbm(x);
      x.xy += (t -.5) * .6;
      t = fbm(x);
      return t;
    }
  
    // Create a pattern based on a normalised uv coordinate. In this
    // example we're making some noise and setting a couple of colours,
    // but you could make this any sort of pattern
    vec4 pattern(vec2 uv) {
  
      // Increasing the frequency of the noise
      uv *= 4.;
      // modify our time component, making it faster
      float t = time*2.;
  
      // Create our noise
  
      float pattern = distortedFBM(vec3(uv, t));
      pattern *= pattern * 1.2;
      // Create our base colour
      //vec4 rtn = vec4( 0.55, 0.65, 0.85, 1. ); // light blue 
      vec4 rtn = vec4( 0.35, 0.43, 0.65, 1. ); // lime yellow 
      // mix this colour with another based on the noise value
      rtn = mix(rtn, vec4( 1. ), smoothstep(.0, 1., pattern)); // sort of a light light grey colour
      return rtn;
      
    }
  
    void main(void){
      // Generate our normalized, centered UV coordinates
      vec2 uv = (gl_FragCoord.xy - 0.5 * inputSize.xy) / min(inputSize.x, inputSize.y);
      // Get the base texture - this is the display object from pixi
      vec4 tex = texture2D(uSampler, vTextureCoord);
  
      // output the pattern constrained by the texture's alpha
      gl_FragColor = vec4((tex.a) * pattern(uv));
    }
  `;
    }
  
    /**
     * Override the parent apply method so that we can increment the time uniform for
     * the purpose of supplying a time component to the shader.
     */
    apply(filterManager, input, output)
    {
      this.uniforms.time += .01;
  
      filterManager.applyFilter(this, input, output);
    }
  }
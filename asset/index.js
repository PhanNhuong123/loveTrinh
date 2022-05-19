const imgl = document.querySelector("img");

var typed = new Typed("#typed", {
  // stringsElement: '#typed-strings',
  strings: [
    "20/05/2020",
    "Mới đó mà",
    "2 năm rồi ấy nhỉ !",
    "Thời gian trôi nhanh ghê",
    "Dù nhiều lúc hơi",
    "Không ngoan !",
    'Có lúc cải nhau',
    'Giận nhau',
    'Nhưng mình vẫn',
    'Thông cảm,',
    'Bao dung cho nhau',
    'Cảm ơn ,',
    'vì đã không',
    'đánh mất nhau',
    'Cùng nhau',
    'bước đến chân trời mới bạn nhé !!!',
    'I LOVE YOU 3000',
    
  ],

  typeSpeed: 0,
  backSpeed: 0,
  backDelay: 500,
  startDelay: 2000,
  loop: false,
  showCursor: true
});
particlesJS("particles-js", {
  particles: {
    number: {
      value: 400,
      density: {
        enable: true,
        value_area: 800,
      },
    },
    color: {
      value: "#fff",
    },
    shape: {
      type: "circle",
      stroke: {
        width: 0,
        color: "#000000",
      },
      polygon: {
        nb_sides: 5,
      },
      image: {
        src: "img/github.svg",
        width: 100,
        height: 100,
      },
    },
    opacity: {
      value: 0.5,
      random: true,
      anim: {
        enable: false,
        speed: 1,
        opacity_min: 0.1,
        sync: false,
      },
    },
    size: {
      value: 10,
      random: true,
      anim: {
        enable: false,
        speed: 40,
        size_min: 0.1,
        sync: false,
      },
    },
    line_linked: {
      enable: false,
      distance: 500,
      color: "#ffffff",
      opacity: 0.4,
      width: 2,
    },
    move: {
      enable: true,
      speed: 6,
      direction: "bottom",
      random: false,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200,
      },
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: true,
        mode: "bubble",
      },
      onclick: {
        enable: true,
        mode: "repulse",
      },
      resize: true,
    },
    modes: {
      grab: {
        distance: 400,
        line_linked: {
          opacity: 0.5,
        },
      },
      bubble: {
        distance: 400,
        size: 4,
        duration: 0.3,
        opacity: 1,
        speed: 3,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
      push: {
        particles_nb: 4,
      },
      remove: {
        particles_nb: 2,
      },
    },
  },
  retina_detect: true,
});

// ------------------------------------------------------
//
var canvas = document.getElementById("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var gl = canvas.getContext("webgl");
if (!gl) {
  console.error("Unable to initialize WebGL.");
}

var time = 0.0;

var vertexSource = `
attribute vec2 position;
void main() {
	gl_Position = vec4(position, 0.0, 1.0);
}
`;

var fragmentSource = `
precision highp float;

uniform float width;
uniform float height;
vec2 resolution = vec2(width, height);

uniform float time;

#define POINT_COUNT 8

vec2 points[POINT_COUNT];
const float speed = -0.5;
const float len = 0.25;
float intensity = 1.3;
float radius = 0.008;

//https://www.shadertoy.com/view/MlKcDD
//Signed distance to a quadratic bezier
float sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C){    
	vec2 a = B - A;
	vec2 b = A - 2.0*B + C;
	vec2 c = a * 2.0;
	vec2 d = A - pos;

	float kk = 1.0 / dot(b,b);
	float kx = kk * dot(a,b);
	float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
	float kz = kk * dot(d,a);      

	float res = 0.0;

	float p = ky - kx*kx;
	float p3 = p*p*p;
	float q = kx*(2.0*kx*kx - 3.0*ky) + kz;
	float h = q*q + 4.0*p3;

	if(h >= 0.0){ 
		h = sqrt(h);
		vec2 x = (vec2(h, -h) - q) / 2.0;
		vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
		float t = uv.x + uv.y - kx;
		t = clamp( t, 0.0, 1.0 );

		// 1 root
		vec2 qos = d + (c + b*t)*t;
		res = length(qos);
	}else{
		float z = sqrt(-p);
		float v = acos( q/(p*z*2.0) ) / 3.0;
		float m = cos(v);
		float n = sin(v)*1.732050808;
		vec3 t = vec3(m + m, -n - m, n - m) * z - kx;
		t = clamp( t, 0.0, 1.0 );

		// 3 roots
		vec2 qos = d + (c + b*t.x)*t.x;
		float dis = dot(qos,qos);
        
		res = dis;

		qos = d + (c + b*t.y)*t.y;
		dis = dot(qos,qos);
		res = min(res,dis);
		
		qos = d + (c + b*t.z)*t.z;
		dis = dot(qos,qos);
		res = min(res,dis);

		res = sqrt( res );
	}
    
	return res;
}


//http://mathworld.wolfram.com/HeartCurve.html
vec2 getHeartPosition(float t){
	return vec2(16.0 * sin(t) * sin(t) * sin(t),
							-(13.0 * cos(t) - 5.0 * cos(2.0*t)
							- 2.0 * cos(3.0*t) - cos(4.0*t)));
}

//https://www.shadertoy.com/view/3s3GDn
float getGlow(float dist, float radius, float intensity){
	return pow(radius/dist, intensity);
}

float getSegment(float t, vec2 pos, float offset, float scale){
	for(int i = 0; i < POINT_COUNT; i++){
		points[i] = getHeartPosition(offset + float(i)*len + fract(speed * t) * 6.28);
	}
    
	vec2 c = (points[0] + points[1]) / 2.0;
	vec2 c_prev;
	float dist = 10000.0;
    
	for(int i = 0; i < POINT_COUNT-1; i++){
		//https://tinyurl.com/y2htbwkm
		c_prev = c;
		c = (points[i] + points[i+1]) / 2.0;
		dist = min(dist, sdBezier(pos, scale * c_prev, scale * points[i], scale * c));
	}
	return max(0.0, dist);
}

void main(){
	vec2 uv = gl_FragCoord.xy/resolution.xy;
	float widthHeightRatio = resolution.x/resolution.y;
	vec2 centre = vec2(0.5, 0.5);
	vec2 pos = centre - uv;
	pos.y /= widthHeightRatio;
	//Shift upwards to centre heart
	pos.y += 0.02;
	float scale = 0.000015 * height;
	
	float t = time;
    
	//Get first segment
  float dist = getSegment(t, pos, 0.0, scale);
  float glow = getGlow(dist, radius, intensity);
  
  vec3 col = vec3(0.0);

	//White core
  col += 10.0*vec3(smoothstep(0.003, 0.001, dist));
  //Pink glow
  col += glow * vec3(1.0,0.05,0.3);
  
  //Get second segment
  dist = getSegment(t, pos, 3.4, scale);
  glow = getGlow(dist, radius, intensity);
  
  //White core
  col += 10.0*vec3(smoothstep(0.003, 0.001, dist));
  //Blue glow
  col += glow * vec3(0.1,0.4,1.0);
        
	//Tone mapping
	col = 1.0 - exp(-col);

	//Gamma
	col = pow(col, vec3(0.4545));

	//Output to screen
 	gl_FragColor = vec4(col,1.0);
}
`;

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform1f(widthHandle, window.innerWidth);
  gl.uniform1f(heightHandle, window.innerHeight);
}

function compileShader(shaderSource, shaderType) {
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw "Shader compile failed with: " + gl.getShaderInfoLog(shader);
  }
  return shader;
}

function getAttribLocation(program, name) {
  var attributeLocation = gl.getAttribLocation(program, name);
  if (attributeLocation === -1) {
    throw "Cannot find attribute " + name + ".";
  }
  return attributeLocation;
}

function getUniformLocation(program, name) {
  var attributeLocation = gl.getUniformLocation(program, name);
  if (attributeLocation === -1) {
    throw "Cannot find uniform " + name + ".";
  }
  return attributeLocation;
}

var vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
var fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

gl.useProgram(program);

var vertexData = new Float32Array([
  -1.0,
  1.0, // top left
  -1.0,
  -1.0, // bottom left
  1.0,
  1.0, // top right
  1.0,
  -1.0, // bottom right
]);

var vertexDataBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

var positionHandle = getAttribLocation(program, "position");

gl.enableVertexAttribArray(positionHandle);
gl.vertexAttribPointer(
  positionHandle,
  2, // position is a vec2 (2 values per component)
  gl.FLOAT, // each component is a float
  false, // don't normalize values
  2 * 4, // two 4 byte float components per vertex (32 bit float is 4 bytes)
  0 // how many bytes inside the buffer to start from
);

var timeHandle = getUniformLocation(program, "time");
var widthHandle = getUniformLocation(program, "width");
var heightHandle = getUniformLocation(program, "height");

gl.uniform1f(widthHandle, window.innerWidth);
gl.uniform1f(heightHandle, window.innerHeight);

var lastFrame = Date.now();
var thisFrame;

function draw() {
  thisFrame = Date.now();
  time += (thisFrame - lastFrame) / 1000;
  lastFrame = thisFrame;

  gl.uniform1f(timeHandle, time);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(draw);
}

draw();

// ----------------------------------------------
const ParticleImageDisplayer = function (tag_id, canvas_el, params) {
  "use strict";
  this.pImageConfig = {
    particles: {
      array: [],
      density: 100,
      color: "#fff",
      size: {
        value: 2,
        random: false,
      },
      movement: {
        speed: 1,
        restless: {
          enabled: false,
          value: 10,
          sync: false,
        },
      },
      interactivity: {
        on_hover: {
          enabled: true,
          action: "repulse",
        },
        on_click: {
          enabled: true,
          action: "big_repulse",
        },
        on_touch: {
          enabled: false,
          action: "repulse",
        },
        fn_array: [],
      },
    },
    image: {
      src: {
        path: imgl.src,
        is_external: true,
      },

      size: {
        canvas_pct: 60,
        min_px: 100,
        max_px: 800,
      },
    },
    interactions: {
      repulse: {
        distance: 100,
        strength: 200,
      },
      big_repulse: {
        distance: 300,
        strength: 250,
      },
      grab: {
        distance: 100,
        line_width: 1,
      },
    },
    canvas: {
      el: canvas_el,
      w: canvas_el.offsetWidth,
      h: canvas_el.offsetHeight,
    },
    functions: {
      particles: {},
      image: {},
      canvas: {},
      interactivity: {},
      utils: {},
    },
    mouse: {
      x: null,
      y: null,
      click_x: null,
      click_y: null,
    },
  };

  const pImg = this.pImageConfig;
  if (params) {
    Object.deepExtend(pImg, params);
  }

  /*
    ========================================
    =           CANVAS FUNCTIONS           =
    ========================================
    */
  pImg.functions.canvas.init = function () {
    pImg.canvas.context = pImg.canvas.el.getContext("2d");
    pImg.canvas.el.width = pImg.canvas.w;
    pImg.canvas.el.height = pImg.canvas.h;
    pImg.canvas.aspect_ratio = pImg.canvas.w / pImg.canvas.h;
    window.addEventListener(
      "resize",
      pImg.functions.utils.debounce(pImg.functions.canvas.onResize, 200)
    );
  };

  pImg.functions.canvas.onResize = function () {
    pImg.canvas.w = pImg.canvas.el.offsetWidth;
    pImg.canvas.h = pImg.canvas.el.offsetHeight;
    pImg.canvas.el.width = pImg.canvas.w;
    pImg.canvas.el.height = pImg.canvas.h;
    pImg.canvas.aspect_ratio = pImg.canvas.w / pImg.canvas.h;
    pImg.particles.array = [];
    pImg.functions.image.resize();
    const image_pixels = pImg.functions.canvas.getImagePixels();
    pImg.functions.particles.createImageParticles(image_pixels, true);
  };

  pImg.functions.canvas.clear = function () {
    pImg.canvas.context.clearRect(0, 0, pImg.canvas.w, pImg.canvas.h);
  };

  pImg.functions.canvas.getImagePixels = function () {
    pImg.functions.canvas.clear();
    pImg.canvas.context.drawImage(
      pImg.image.obj,
      pImg.image.x,
      pImg.image.y,
      pImg.image.obj.width,
      pImg.image.obj.height
    );
    const pixel_data = pImg.canvas.context.getImageData(
      pImg.image.x,
      pImg.image.y,
      pImg.image.obj.width,
      pImg.image.obj.height
    );
    pImg.functions.canvas.clear();
    return pixel_data;
  };

  /*
    ========================================
    =           IMAGE FUNCTIONS            =
    ========================================
    */
  pImg.functions.image.resize = function () {
    if (pImg.image.aspect_ratio < pImg.canvas.aspect_ratio) {
      // canvas height constrains image size
      pImg.image.obj.height = pImg.functions.utils.clamp(
        Math.round((pImg.canvas.h * pImg.image.size.canvas_pct) / 100),
        pImg.image.size.min_px,
        pImg.image.size.max_px
      );
      pImg.image.obj.width = Math.round(
        pImg.image.obj.height * pImg.image.aspect_ratio
      );
    } else {
      // canvas width constrains image size
      pImg.image.obj.width = pImg.functions.utils.clamp(
        Math.round((pImg.canvas.w * pImg.image.size.canvas_pct) / 100),
        pImg.image.size.min_px,
        pImg.image.size.max_px
      );
      pImg.image.obj.height = Math.round(
        pImg.image.obj.width / pImg.image.aspect_ratio
      );
    }
    // set x,y coords to center image on canvas
    pImg.image.x = pImg.canvas.w / 2 - pImg.image.obj.width / 2;
    pImg.image.y = pImg.canvas.h / 2 - pImg.image.obj.height / 2;
  };

  pImg.functions.image.init = function () {
    pImg.image.obj = new Image();
    pImg.image.obj.addEventListener("load", function () {
      // get aspect ratio (only have to compute once on initial load)
      pImg.image.aspect_ratio = pImg.image.obj.width / pImg.image.obj.height;
      pImg.functions.image.resize();
      const img_pixels = pImg.functions.canvas.getImagePixels();
      pImg.functions.particles.createImageParticles(img_pixels);
      pImg.functions.particles.animateParticles();
    });
    pImg.image.obj.src = pImg.image.src.path;
    if (pImg.image.src.is_external) {
      pImg.image.obj.crossOrigin = "anonymous";
    }
  };

  /*
    ========================================
    =          PARTICLE FUNCTIONS          =
    ========================================
    */
  pImg.functions.particles.SingleImageParticle = function (init_xy, dest_xy) {
    this.x = init_xy.x;
    this.y = init_xy.y;
    this.dest_x = dest_xy.x;
    this.dest_y = dest_xy.y;
    this.vx = (Math.random() - 0.5) * pImg.particles.movement.speed;
    this.vy = (Math.random() - 0.5) * pImg.particles.movement.speed;
    this.acc_x = 0;
    this.acc_y = 0;
    this.friction = Math.random() * 0.01 + 0.92;
    this.restlessness = {
      max_displacement: Math.ceil(
        Math.random() * pImg.particles.movement.restless.value
      ),
      x_jitter: pImg.functions.utils.randIntInRange(-3, 3),
      y_jitter: pImg.functions.utils.randIntInRange(-3, 3),
      on_curr_frame: false,
    };
    if (pImg.particles.color instanceof Array) {
      this.color =
        pImg.particles.color[
          Math.floor(Math.random() * (pImg.particles.color.length + 1))
        ];
    } else {
      this.color = pImg.particles.color;
    }
    this.radius = Math.round(
      (pImg.particles.size.random ? Math.max(Math.random(), 0.5) : 1) *
        pImg.particles.size.value
    );
  };

  pImg.functions.particles.SingleImageParticle.prototype.draw = function () {
    pImg.canvas.context.fillStyle = this.color;
    pImg.canvas.context.beginPath();
    pImg.canvas.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    pImg.canvas.context.fill();
  };

  pImg.functions.particles.createImageParticles = function (
    pixel_data,
    at_dest = false
  ) {
    const increment = Math.round(pixel_data.width / pImg.particles.density);
    for (let i = 0; i < pixel_data.width; i += increment) {
      for (let j = 0; j < pixel_data.height; j += increment) {
        if (pixel_data.data[(i + j * pixel_data.width) * 4 + 3] > 128) {
          const dest_xy = { x: pImg.image.x + i, y: pImg.image.y + j };
          const init_xy = at_dest
            ? dest_xy
            : {
                x: Math.random() * pImg.canvas.w,
                y: Math.random() * pImg.canvas.h,
              };
          pImg.particles.array.push(
            new pImg.functions.particles.SingleImageParticle(init_xy, dest_xy)
          );
        }
      }
    }
  };

  pImg.functions.particles.updateParticles = function () {
    for (let p of pImg.particles.array) {
      if (
        pImg.particles.movement.restless.enabled &&
        p.restlessness.on_curr_frame
      ) {
        // if restless activity is enabled & particle is in restless mode, animate some random movement
        pImg.functions.particles.jitterParticle(p);
      } else {
        // otherwise, update position with approach to destination
        p.acc_x = (p.dest_x - p.x) / 500;
        p.acc_y = (p.dest_y - p.y) / 500;
        p.vx = (p.vx + p.acc_x) * p.friction;
        p.vy = (p.vy + p.acc_y) * p.friction;
        p.x += p.vx;
        p.y += p.vy;
      }

      pImg.functions.interactivity.interactWithClient(p);
    }
  };

  pImg.functions.particles.jitterParticle = function (p) {
    p.x += p.restlessness.x_jitter;
    p.y += p.restlessness.y_jitter;
    if (
      Math.sqrt((p.dest_x - p.x) ** 2 + (p.dest_y - p.y) ** 2) >=
      pImg.particles.movement.restless.value
    ) {
      p.restlessness.on_curr_frame = false;
    }
  };

  pImg.functions.particles.animateParticles = function () {
    pImg.functions.canvas.clear();
    pImg.functions.particles.updateParticles();
    for (let p of pImg.particles.array) {
      p.draw();
    }
    requestAnimFrame(pImg.functions.particles.animateParticles);
  };

  /*
    ========================================
    =        INTERACTIVITY FUNCTIONS       =
    ========================================
    */
  pImg.functions.interactivity.repulseParticle = function (p, args) {
    // compute distance to mouse
    const dx_mouse = p.x - pImg.mouse.x,
      dy_mouse = p.y - pImg.mouse.y,
      mouse_dist = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse),
      inv_strength = pImg.functions.utils.clamp(300 - args.strength, 10, 300);
    if (mouse_dist <= args.distance) {
      p.acc_x = (p.x - pImg.mouse.x) / inv_strength;
      p.acc_y = (p.y - pImg.mouse.y) / inv_strength;
      p.vx += p.acc_x;
      p.vy += p.acc_y;
    }
  };

  pImg.functions.interactivity.grabParticle = function (p, args) {
    const dx_mouse = p.x - pImg.mouse.x,
      dy_mouse = p.y - pImg.mouse.y,
      mouse_dist = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse);
    if (mouse_dist <= args.distance) {
      pImg.canvas.context.strokeStyle = p.color;
      pImg.canvas.context.lineWidth = Math.min(args.line_width, p.radius * 2);
      pImg.canvas.context.beginPath();
      pImg.canvas.context.moveTo(p.x, p.y);
      pImg.canvas.context.lineTo(pImg.mouse.x, pImg.mouse.y);
      pImg.canvas.context.stroke();
      pImg.canvas.context.closePath();
    }
  };

  pImg.functions.interactivity.onMouseMove = function (func, args, p) {
    if (pImg.mouse.x != null && pImg.mouse.y != null) {
      func(p, args);
    }
  };

  pImg.functions.interactivity.onMouseClick = function (func, args, p) {
    if (pImg.mouse.click_x != null && pImg.mouse.click_y != null) {
      func(p, args);
    }
  };

  pImg.functions.interactivity.addEventListeners = function () {
    if (
      pImg.particles.interactivity.on_hover.enabled ||
      pImg.particles.interactivity.on_click.enabled
    ) {
      pImg.canvas.el.addEventListener("mousemove", function (e) {
        let pos_x = e.offsetX || e.clientX,
          pos_y = e.offsetY || e.clientY;
        pImg.mouse.x = pos_x;
        pImg.mouse.y = pos_y;
      });
      pImg.canvas.el.addEventListener("mouseleave", function (e) {
        pImg.mouse.x = null;
        pImg.mouse.y = null;
      });
      pImg.functions.utils.addEventActions("on_hover");
    }
    if (pImg.particles.interactivity.on_click.enabled) {
      pImg.canvas.el.addEventListener("mousedown", function (e) {
        pImg.mouse.click_x = pImg.mouse.x;
        pImg.mouse.click_y = pImg.mouse.y;
      });
      pImg.canvas.el.addEventListener("mouseup", function (e) {
        pImg.mouse.click_x = null;
        pImg.mouse.click_y = null;
      });
      pImg.functions.utils.addEventActions("on_click");
    }
    if (pImg.particles.interactivity.on_touch.enabled) {
      pImg.canvas.el.addEventListener("touchmove", function (e) {
        let pos_x = e.touches[0].clientX,
          pos_y = e.touches[0].clientY;
        pImg.mouse.x = pos_x;
        pImg.mouse.y = pos_y;
      });
      pImg.canvas.el.addEventListener("touchend", function (e) {
        pImg.mouse.x = null;
        pImg.mouse.y = null;
      });
      pImg.functions.utils.addEventActions("on_touch");
    }
  };

  pImg.functions.interactivity.interactWithClient = function (p) {
    for (let func of pImg.particles.interactivity.fn_array) {
      func(p);
    }
  };

  /*
    ========================================
    =           UTILS FUNCTIONS            =
    ========================================
    */
  pImg.functions.utils.randIntInRange = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  pImg.functions.utils.clamp = function (n, min, max) {
    return Math.min(Math.max(n, min), max);
  };

  pImg.functions.utils.debounce = function (func, min_interval) {
    let timer;
    return function (event) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(func, min_interval, event);
    };
  };

  pImg.functions.utils.addEventActions = function (event) {
    const action_funcs = {
      repulse: pImg.functions.interactivity.repulseParticle,
      big_repulse: pImg.functions.interactivity.repulseParticle,
      grab: pImg.functions.interactivity.grabParticle,
    };
    let event_wrapper =
      event === "on_click"
        ? pImg.functions.interactivity.onMouseClick
        : pImg.functions.interactivity.onMouseMove;
    if (pImg.particles.interactivity[event].enabled) {
      const func = action_funcs[pImg.particles.interactivity[event].action],
        args = pImg.interactions[pImg.particles.interactivity[event].action];
      const partial_func = event_wrapper.bind(null, func, args);
      pImg.particles.interactivity.fn_array.push(partial_func);
    }
  };

  /*
    ========================================
    =           LAUNCH FUNCTIONS           =
    ========================================
    */
  pImg.functions.launch = function () {
    pImg.functions.interactivity.addEventListeners();
    pImg.functions.canvas.init();
    pImg.functions.image.init();
  };

  if (!pImg.disabled) {
    pImg.functions.launch();
  }
};

/*
  ========================================
  =           GLOBAL FUNCTIONS           =
  ========================================
  */
Object.deepExtend = function (destination, source) {
  // credit: https://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
  for (let property in source) {
    if (
      source[property] &&
      source[property].constructor &&
      source[property].constructor === Object
    ) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};

window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

window.cancelRequestAnimFrame = (function () {
  return (
    window.cancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    clearTimeout
  );
})();

window.pImgDom = [];

window.particleImageDisplay = function (tag_id) {
  // get target element by ID, check for existing canvases
  const pImage_el = document.getElementById(tag_id),
    canvas_classname = "particle-image-canvas-el",
    existing_canvases = pImage_el.getElementsByClassName(canvas_classname);

  // remove any existing canvases within div
  if (existing_canvases.length) {
    while (existing_canvases.length > 0) {
      pImage_el.removeChild(existing_canvases[0]);
    }
  }

  // create canvas element, set size, append to target element
  const canvas_el = document.createElement("canvas");
  canvas_el.className = canvas_classname;
  canvas_el.style.width = "100%";
  canvas_el.style.height = "100%";
  const canvas = document.getElementById(tag_id).appendChild(canvas_el);

  if (canvas != null) {
    pImgDom.push(new ParticleImageDisplayer(tag_id, canvas, {}));
    /*
      NOTE: The this chunk normally deals with loading the params.json file. It's disabled for the CodePen demo so you can play with the parameters live by editing the pImageConfig object at the top.
      
      // get params.json filepath from load parameters from element's data-params-src property
      const params_json = pImage_el.dataset.paramsSrc,
        xhr = new XMLHttpRequest();
      xhr.overrideMimeType("application/json")
      xhr.open("GET", params_json, false);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          // parse parameters & launch display
          const params = JSON.parse(xhr.responseText);
          pImgDom.push(new ParticleImageDisplayer(tag_id, canvas, params));
        } else {
          console.log(`failed to load params.json. XMLHTTPRequest status: ${xhr.statusText}`);
        }
      };
      xhr.send();
      */
  }
};

window.particleImageDisplay("particle-image");

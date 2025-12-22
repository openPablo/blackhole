# blackhole

## Running locally

```
npm install
npm run dev
```

## What is this

Blackhole simulation in WebGL

- Raytraces every pixel on your screen like it's a ray of light.
- Uses Schwarzschild's geodesics to calculate how the light rays are affected by the blackhole's gravity
- Raytracing every pixel is very resource intensive, that's why I wrote this in a WebGL fragment shader.
- Fragment shaders are optimized for GPU computing, and use GLSL, a C like language.
- This scene is optimized to run smoothly on a mobile phone or a laptop with integrated graphics.

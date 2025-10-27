<script>
  import { onMount } from 'svelte';

  let canvas;
  let gl;

  onMount(() => {
    gl = canvas.getContext('webgl');
    if (!gl) {
      alert('WebGL not supported');
      return;
    }

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  });
</script>

<canvas bind:this={canvas} width="800" height="600" style="display:block;margin:auto;"></canvas>

<style>
  canvas { background: #111; }
</style>
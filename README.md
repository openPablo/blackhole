# blackhole

## Running locally

```
npm install
npm run dev
```

## Inspiration

I was inspired by this super interesting youtube video, in which the OP created a blackhole simulation using C++ and openGL.
https://www.youtube.com/watch?v=8-B6ryuBkCM (great channel!)

I saw an interesting comment giving math advice:
``` 
There is the lesser well-known brother of the geodesic equation.

You can use the Hamiltonian H = 1/2 g^munu p_mu p_nu to get:
1. d/dlambda q^mu = g^munu p_nu
2. d/dlambda p_\alpha = -1/2 (dg^munu / dq^alpha) p_mu p_nu

This way, not only are the geodesic equations much easier to derive, but conserved quatities, such as energy and angular momentum, are conserved during integration.

Sidenote: p_mu p^mu = 0 is true analytically for light rays, but in praxis this is only true up to machine accuracy, i.e. p_mu p^mu = epsilon.
You can NOT use this equation to simpllify the eoms unfortunately. 

Also, you can consider using an integrator with variable stepsize. This will shorten simulation time significantly. 
```
So I decided to give it a go and try to implement a blackhole efficient enough, that it could be ran in the browser.

I learned Threejs/webGL through this exercise :).


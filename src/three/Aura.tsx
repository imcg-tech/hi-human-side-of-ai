import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScreenQuad } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";

/**
 * HI living aura, ported from the design system, with TWO atmospheres:
 *   variant "signature" → blue (Home & Onboarding)
 *   variant "warm"      → pink/lilac (Reflexion & Mood)
 * uWarm is GSAP-morphed between them. Flows (liquid domain-warp), breathes,
 * follows the cursor.
 */
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec2  uRes;
  uniform float uTime, uBreath, uIntensity, uWarm;
  uniform vec2  uMouse;

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    vec2 u=f*f*(3.0-2.0*f);
    return mix(mix(hash(i+vec2(0.0,0.0)),hash(i+vec2(1.0,0.0)),u.x),
               mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);
  }
  float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }

  void main(){
    vec2 uv = vUv;
    float asp = uRes.x/uRes.y;
    vec2 p = uv; p.x *= asp;
    vec2 m = uMouse; m.x *= asp;

    float t = uTime*0.10;
    vec2 q  = vec2(fbm(p*1.25 + vec2(0.0, t)), fbm(p*1.25 + vec2(5.2,1.3) - vec2(t*0.8,0.0)));
    vec2 r2 = vec2(fbm(p*1.9 + 1.6*q + vec2(1.7,9.2) + t*0.7), fbm(p*1.9 + 1.6*q + vec2(8.3,2.8) - t*0.6));
    vec2 warp = p + 0.30*(r2 - 0.5);

    float d = distance(warp, m);
    float radius = mix(0.42, 0.66, uBreath);
    float glow = pow(smoothstep(radius, 0.0, d), 1.5);
    float amb = smoothstep(1.40, 0.0, distance(p, vec2(asp*0.5, 0.5))) * 0.18;
    glow = clamp(glow + amb*uBreath, 0.0, 1.0) * uIntensity;

    vec3 sand     = vec3(0.902,0.882,0.847);
    vec3 paleBlue = mix(vec3(0.878,0.914,0.953), vec3(0.949,0.905,0.910), uWarm);
    vec3 soft     = mix(vec3(0.800,0.868,0.945), vec3(0.914,0.800,0.843), uWarm);
    vec3 mid      = mix(vec3(0.717,0.812,0.929), vec3(0.878,0.631,0.690), uWarm);
    vec3 core     = mix(vec3(0.624,0.753,0.910), vec3(0.725,0.651,0.824), uWarm);

    vec3 col = sand;
    col = mix(col, paleBlue, smoothstep(0.00,0.22,glow));
    col = mix(col, soft,     smoothstep(0.16,0.50,glow));
    col = mix(col, mid,      smoothstep(0.42,0.76,glow));
    col = mix(col, core,     smoothstep(0.70,0.97,glow));

    col += (hash(uv*uRes.xy)-0.5)*0.016;
    gl_FragColor = vec4(col,1.0);
  }
`;

function AuraQuad({ intensity, warm }: { intensity: number; warm: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();
  const target = useRef(new THREE.Vector2(0.5, 0.55));
  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.55) },
      uBreath: { value: 0.4 },
      uIntensity: { value: intensity },
      uWarm: { value: warm },
    }),
    []
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) =>
      target.current.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    const tw = gsap.to(uniforms.uBreath, { value: 0.74, duration: 4.2, ease: "sine.inOut", repeat: -1, yoyo: true });
    return () => { tw.kill(); };
  }, [uniforms]);

  useEffect(() => {
    const a = gsap.to(uniforms.uIntensity, { value: intensity, duration: 1.1, ease: "power2.inOut" });
    const b = gsap.to(uniforms.uWarm, { value: warm, duration: 1.2, ease: "power2.inOut" });
    return () => { a.kill(); b.kill(); };
  }, [intensity, warm, uniforms]);

  useFrame((_, dt) => {
    uniforms.uTime.value += Math.min(dt, 0.05);
    uniforms.uRes.value.set(size.width * viewport.dpr, size.height * viewport.dpr);
    uniforms.uMouse.value.lerp(target.current, 0.05);
  });

  return (
    <ScreenQuad>
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
    </ScreenQuad>
  );
}

export default function Aura({ intensity = 1, variant = "signature" }: { intensity?: number; variant?: "signature" | "warm" }) {
  return (
    <Canvas frameloop="always" gl={{ antialias: true }} dpr={[1, 1.5]} style={{ position: "fixed", inset: 0, zIndex: 0 }}>
      <AuraQuad intensity={intensity} warm={variant === "warm" ? 1 : 0} />
    </Canvas>
  );
}

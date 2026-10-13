import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type SceneProps = { section: number; gentle: boolean; quiet: boolean; lowParticles: boolean; mood: string | null; reducedMotion: boolean };

function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 19.19) * 43758.5453;
  return x - Math.floor(x);
}

function SkyObjects({ section, gentle, quiet, mood, reducedMotion }: Omit<SceneProps, 'lowParticles'>) {
  const drift = useRef<THREE.Group>(null!);
  const stars = useRef<THREE.InstancedMesh>(null!);
  const fireflies = useRef<THREE.InstancedMesh>(null!);
  const flowerHeads = useRef<THREE.InstancedMesh>(null!);
  const flowerStems = useRef<THREE.InstancedMesh>(null!);
  const quietMood = mood === 'quiet';
  const starCount = quiet ? 0 : quietMood ? 10 : gentle ? 90 : 250;
  const flyCount = quiet ? 0 : quietMood ? 1 : gentle ? 8 : 34;
  const starData = useMemo(() => Array.from({ length: starCount }, (_, i) => ({
    x: (seeded(i + 1) - 0.5) * 27,
    y: (seeded(i + 91) - 0.5) * 16,
    z: -seeded(i + 193) * 11 - 1,
    s: 0.016 + seeded(i + 341) * 0.045
  })), [starCount]);
  const flyData = useMemo(() => Array.from({ length: flyCount }, (_, i) => ({
    x: (seeded(i + 501) - 0.5) * 17,
    y: (seeded(i + 601) - 0.5) * 8,
    z: -seeded(i + 701) * 5,
    phase: seeded(i + 801) * Math.PI * 2,
    s: 0.025 + seeded(i + 901) * 0.035
  })), [flyCount]);
  const flowerData = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    x: -6.7 + seeded(i + 1101) * 12.8,
    y: -3.28 + seeded(i + 1201) * 0.18,
    z: -3.3 - seeded(i + 1301) * 1.8,
    s: 0.065 + seeded(i + 1401) * 0.055,
    color: ['#efbdd4', '#f0d899', '#d4c6ef', '#dca2b6'][i % 4]
  })), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const accent = mood === 'rose' ? '#f3b5c5' : mood === 'gold' ? '#ffe2a1' : mood === 'blue' ? '#a9c9ee' : mood === 'quiet' ? '#aa9cc5' : mood === 'lilac' ? '#e0b6ed' : '#e9cf9d';

  useEffect(() => {
    if (!stars.current) return;
    starData.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.s);
      dummy.updateMatrix();
      stars.current.setMatrixAt(i, dummy.matrix);
      stars.current.setColorAt(i, new THREE.Color(i % 13 === 0 ? '#f3dca7' : '#c9c4ee'));
    });
    stars.current.instanceMatrix.needsUpdate = true;
    if (stars.current.instanceColor) stars.current.instanceColor.needsUpdate = true;
  }, [dummy, starData]);

  useEffect(() => {
    if (!flowerHeads.current || !flowerStems.current) return;
    flowerData.forEach((flower, i) => {
      dummy.position.set(flower.x, flower.y, flower.z);
      dummy.scale.set(flower.s, flower.s * 0.8, flower.s);
      dummy.updateMatrix(); flowerHeads.current.setMatrixAt(i, dummy.matrix);
      flowerHeads.current.setColorAt(i, new THREE.Color(flower.color));
      dummy.position.set(flower.x, flower.y - flower.s * 1.7, flower.z);
      dummy.scale.set(flower.s * 0.12, flower.s * 1.8, flower.s * 0.12);
      dummy.updateMatrix(); flowerStems.current.setMatrixAt(i, dummy.matrix);
    });
    flowerHeads.current.instanceMatrix.needsUpdate = true;
    flowerStems.current.instanceMatrix.needsUpdate = true;
    if (flowerHeads.current.instanceColor) flowerHeads.current.instanceColor.needsUpdate = true;
  }, [dummy, flowerData]);

  useFrame((state) => {
    if (!drift.current) return;
    const t = state.clock.elapsedTime;
    if (!gentle && !quiet && !reducedMotion) {
      drift.current.position.x = Math.sin(t * 0.085) * 0.26;
      drift.current.position.y = Math.sin(t * 0.12) * 0.12;
      drift.current.rotation.z = Math.sin(t * 0.045) * 0.006;
    } else {
      drift.current.position.set(0, 0, 0);
      drift.current.rotation.z = 0;
    }
    if (!fireflies.current) return;
    flyData.forEach((p, i) => {
      const still = gentle || quiet || reducedMotion;
      const bob = still ? 0 : Math.sin(t * (quietMood ? 0.09 : 0.28) + p.phase) * (quietMood ? 0.07 : 0.22);
      dummy.position.set(p.x + (still ? 0 : Math.sin(t * (quietMood ? 0.06 : 0.17) + p.phase) * (quietMood ? 0.04 : 0.13)), p.y + bob, p.z);
      dummy.scale.setScalar(p.s * (0.8 + (still ? 0 : Math.sin(t * 0.45 + p.phase) * 0.16)));
      dummy.updateMatrix();
      fireflies.current.setMatrixAt(i, dummy.matrix);
    });
    fireflies.current.instanceMatrix.needsUpdate = true;
  });

  return <group ref={drift}>
    <ambientLight intensity={0.72} />
    <pointLight position={[-3, 4, 5]} color={accent} intensity={2.2} distance={22} />
    <pointLight position={[5, -1, 1]} color="#8876ba" intensity={1.2} distance={18} />
    <group position={[-7.3, 1.5, -3.5]} scale={[1.25, 0.68, 0.42]}>
      <mesh position={[-0.7, 0, 0]}><sphereGeometry args={[0.92, 18, 14]} /><meshBasicMaterial color="#a8a4cb" transparent opacity={quiet ? 0.035 : 0.12} depthWrite={false} /></mesh>
      <mesh position={[0, 0.3, 0]}><sphereGeometry args={[0.8, 18, 14]} /><meshBasicMaterial color="#b5a8cd" transparent opacity={quiet ? 0.035 : 0.13} depthWrite={false} /></mesh>
      <mesh position={[0.72, 0.02, 0]}><sphereGeometry args={[1.02, 18, 14]} /><meshBasicMaterial color="#9b9abb" transparent opacity={quiet ? 0.035 : 0.1} depthWrite={false} /></mesh>
    </group>
    <group position={[6.5, 0.1, -5.8]} scale={[1.6, 0.7, 0.48]}>
      <mesh position={[-0.55, 0, 0]}><sphereGeometry args={[0.8, 18, 14]} /><meshBasicMaterial color="#a6a3c5" transparent opacity={quiet ? 0.03 : 0.1} depthWrite={false} /></mesh>
      <mesh position={[0.1, 0.25, 0]}><sphereGeometry args={[0.82, 18, 14]} /><meshBasicMaterial color="#b3a7cc" transparent opacity={quiet ? 0.03 : 0.11} depthWrite={false} /></mesh>
      <mesh position={[0.75, 0, 0]}><sphereGeometry args={[0.86, 18, 14]} /><meshBasicMaterial color="#9292b4" transparent opacity={quiet ? 0.03 : 0.09} depthWrite={false} /></mesh>
    </group>
    <instancedMesh ref={stars} args={[undefined, undefined, starData.length]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#d7d3f4" transparent opacity={quiet ? 0.38 : 0.82} />
    </instancedMesh>
    <instancedMesh ref={fireflies} args={[undefined, undefined, flyData.length]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.65} transparent opacity={quiet ? 0.35 : 0.85} />
    </instancedMesh>
    <instancedMesh ref={flowerStems} args={[undefined, undefined, flowerData.length]} visible={section === 2} frustumCulled={false}>
      <cylinderGeometry args={[0.045, 0.055, 1, 6]} />
      <meshBasicMaterial color="#9caa91" transparent opacity={0.64} />
    </instancedMesh>
    <instancedMesh ref={flowerHeads} args={[undefined, undefined, flowerData.length]} visible={section === 2} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#f4d8a3" transparent opacity={quiet ? 0.55 : 0.9} />
    </instancedMesh>
    <mesh position={[5.2, 3.25, -6]}>
      <sphereGeometry args={[1.12, 32, 32]} />
      <meshBasicMaterial color="#fff1d2" />
    </mesh>
    <mesh position={[5.66, 3.72, -5.82]}>
      <sphereGeometry args={[1.05, 32, 32]} />
      <meshBasicMaterial color="#111738" />
    </mesh>
    <group position={[-4, -3.65, -3]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[10, 64]} />
        <meshStandardMaterial color={section === 2 ? '#29314f' : '#171d3c'} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.2, -0.9]} scale={[1.3, 0.42, 0.65]}>
        <sphereGeometry args={[1, 28, 20]} />
        <meshStandardMaterial color="#353455" roughness={1} />
      </mesh>
      <mesh position={[8, 0.1, -0.4]} scale={[1.8, 0.34, 0.58]}>
        <sphereGeometry args={[1, 28, 20]} />
        <meshStandardMaterial color="#292d50" roughness={1} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => <mesh key={i} position={[-4.8 + i * 1.55, 0.045, 0.2 - i * 0.08]} scale={[0.3, 0.06, 0.19]} rotation={[0, 0.07 * i, 0]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color="#c9b78c" transparent opacity={quiet ? 0.12 : 0.22} />
      </mesh>)}
    </group>
    <group position={[7.2, -3.2, -6]}>
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[2.25, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#aaa4d1" transparent opacity={quiet ? 0.035 : 0.1} roughness={0.17} metalness={0.16} transmission={0.22} thickness={0.6} depthWrite={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.25, 0.035, 8, 64]} />
        <meshBasicMaterial color="#d8c997" transparent opacity={0.42} />
      </mesh>
      <mesh position={[0.35, 0.6, 0.02]} scale={[0.44, 0.42, 0.045]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#f1d69d" transparent opacity={0.12} />
      </mesh>
    </group>
    {section === 5 && <group position={[0, -1.3, -2]}>
      <mesh><torusGeometry args={[1.75, 0.018, 8, 96]} /><meshBasicMaterial color="#e7d298" transparent opacity={0.55} /></mesh>
      <mesh rotation={[0.5, 0.3, 0.2]}><torusGeometry args={[2.2, 0.012, 8, 96]} /><meshBasicMaterial color="#b8afd9" transparent opacity={0.5} /></mesh>
    </group>}
  </group>;
}

export default function DreamScene(props: SceneProps) {
  const dpr = useMemo(() => Math.min(props.lowParticles ? 1.25 : window.innerWidth <= 640 ? 1.5 : 2, Math.max(1, window.devicePixelRatio || 1)), [props.lowParticles]);
  const [visible, setVisible] = useState(document.visibilityState !== 'hidden');
  useEffect(() => {
    const change = () => setVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  return <Canvas
    className="dream-canvas"
    dpr={dpr}
    frameloop={visible ? 'always' : 'never'}
    camera={{ position: [0, 0, 10], fov: 45 }}
    gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
    aria-hidden="true"
  >
    <fog attach="fog" args={['#111638', 11, 29]} />
    <SkyObjects {...props} />
  </Canvas>;
}

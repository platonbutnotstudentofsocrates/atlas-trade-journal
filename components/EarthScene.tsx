import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader, Mesh, DoubleSide, Vector3, MeshBasicMaterial, Group, MathUtils } from 'three';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import { latLongToVector3 } from './utils';
import { countryCoordinates } from './countryData';

// Fix for missing R3F types in JSX
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      sphereGeometry: any;
      meshBasicMaterial: any;
      meshStandardMaterial: any;
      meshPhongMaterial: any;
      ambientLight: any;
      directionalLight: any;
      spotLight: any;
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      sphereGeometry: any;
      meshBasicMaterial: any;
      meshStandardMaterial: any;
      meshPhongMaterial: any;
      ambientLight: any;
      directionalLight: any;
      spotLight: any;
    }
  }
}

interface EconomicEvent {
  event: string;
  time: string;
  importance: 'High' | 'Medium' | 'Low';
  actual?: string;
  forecast?: string;
  country?: string;
}

interface MarkerProps {
  lat: number;
  lon: number;
  label: string;
  radius: number;
  color?: string;
  isOpen?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onClose: () => void;
  customEvents?: EconomicEvent[];
}

interface EarthSceneProps {
    events?: Record<string, EconomicEvent[]>;
    focusTarget?: string | null;
}

// Map English country keys (from globe data) to Turkish API keys
const countryNameMapping: Record<string, string> = {
    "USA": "ABD",
    "Turkey": "Türkiye",
    "UK": "İngiltere",
    "Japan": "Japonya",
    "Germany": "Euro Bölgesi",
    "France": "Euro Bölgesi",
    "Italy": "Euro Bölgesi",
    "Spain": "Euro Bölgesi"
};

const PulseDot: React.FC<{ color: string; isOpen: boolean }> = ({ color, isOpen }) => {
  const meshRef = useRef<Mesh>(null!);
  const offset = useMemo(() => Math.random() * 100, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as MeshBasicMaterial;
      const t = state.clock.getElapsedTime() + offset;

      const worldPos = new Vector3();
      meshRef.current.getWorldPosition(worldPos);
      const dist = state.camera.position.distanceTo(worldPos);
      const distScale = Math.max(0.01, dist / 4);

      if (isOpen) {
        const speed = 3.0;
        const pulse = (Math.sin(t * speed) + 1) / 2; 
        const baseScale = 1.5 + pulse * 2.0; 
        meshRef.current.scale.setScalar(baseScale * distScale);
        material.opacity = 0.7 + (1 - pulse) * 0.3; 
      } else {
        const speed = 1.5;
        const pulse = (Math.sin(t * speed) + 1) / 2; 
        const baseScale = 1.0 + pulse * 0.5; 
        meshRef.current.scale.setScalar(baseScale * distScale);
        material.opacity = 0.2 + pulse * 0.3;
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.012, 16, 16]} />
      <meshBasicMaterial color={color} transparent toneMapped={false} depthWrite={false} />
    </mesh>
  );
};

const LocationMarker: React.FC<MarkerProps> = ({ 
  lat, lon, label, radius, color = "#ffdd00", 
  isOpen, isSelected, onSelect, onClose, customEvents
}) => {
  const position = useMemo(() => latLongToVector3(lat, lon, radius), [lat, lon, radius]);
  const centerDotRef = useRef<Mesh>(null!);
  
  // Filter for High Importance events
  const highImpactEvents = useMemo(() => {
    if (!customEvents) return [];
    return customEvents.filter(e => e.importance === 'High');
  }, [customEvents]);

  // Active state: True if explicitly open (markets) OR selected (countries)
  const active = isOpen !== undefined ? isOpen : isSelected;

  // Calculate positions for the "High Importance" event boxes
  const eventNodes = useMemo(() => {
    if (!isSelected || highImpactEvents.length === 0) return [];
    
    const normal = position.clone().normalize(); 
    const globalUp = new Vector3(0, 1, 0);
    
    // Create a local coordinate system on the surface
    // tangentX is roughly East-West
    let tangentX = new Vector3().crossVectors(globalUp, normal).normalize();
    if (tangentX.lengthSq() < 0.001) tangentX = new Vector3(1, 0, 0); // Handle poles
    
    // tangentY is roughly North-South (on the tangent plane)
    const tangentY = new Vector3().crossVectors(normal, tangentX).normalize();
    
    const count = highImpactEvents.length;
    // Parameters for distribution
    const stemHeight = 0.35; // Height from surface to the center of the cluster
    const clusterRadius = 0.25; // How far spread out the items are from the stem center

    return highImpactEvents.map((evt, i) => {
       // Base position just above the country (the stem top)
       const stemTop = position.clone().add(normal.clone().multiplyScalar(stemHeight));

       if (count === 1) {
           // Single event: Just floats directly above
           return { event: evt, position: stemTop };
       }

       // Multiple events: Distribute in a circle (Radial/Flower pattern)
       // Add an offset to angle so 4 items look like a square (X shape) rather than a cross (+)
       const angleOffset = Math.PI / 4; 
       const angle = (i / count) * Math.PI * 2 + angleOffset;

       const xOffset = Math.cos(angle) * clusterRadius;
       const yOffset = Math.sin(angle) * clusterRadius;

       // Calculate final position in 3D space using tangent vectors
       const finalPos = stemTop.clone()
           .add(tangentX.clone().multiplyScalar(xOffset))
           .add(tangentY.clone().multiplyScalar(yOffset));
       
       return { event: evt, position: finalPos };
    });
  }, [isSelected, highImpactEvents, position]);

  useFrame(({ camera }) => {
    if (centerDotRef.current) {
      const worldPos = new Vector3();
      centerDotRef.current.getWorldPosition(worldPos);
      const dist = camera.position.distanceTo(worldPos);
      const distScale = Math.max(0.01, dist / 4);
      centerDotRef.current.scale.setScalar(distScale);
    }
  });

  const labelOffset = useMemo(() => {
    return position.clone().normalize().multiplyScalar(0.02);
  }, [position]);

  return (
    <group>
      <group 
        position={position} 
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh visible={false}>
           <sphereGeometry args={[0.08, 8, 8]} />
           <meshBasicMaterial />
        </mesh>
        <mesh ref={centerDotRef}>
          <sphereGeometry args={[0.012, 16, 16]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
        <PulseDot color={color} isOpen={active} />
        
        {/* Country Label */}
        {isSelected && (
          <Html 
            position={labelOffset} 
            zIndexRange={[100, 0]} 
            style={{ pointerEvents: 'none' }}
            transform={false}
          >
             <div className="
                px-1.5 py-0.5
                bg-black/40 backdrop-blur-[1px] rounded-sm
                text-white/90 font-sans font-medium
                select-none whitespace-nowrap
                transform -translate-x-1/2 -translate-y-[180%]
             "
             style={{ 
               fontSize: '10px', 
               letterSpacing: '0.5px',
               textShadow: '0 1px 2px rgba(0,0,0,0.8)'
             }}
             >
                {label}
             </div>
          </Html>
        )}
      </group>

      {/* Render High Importance Event Boxes with Lines */}
      {isSelected && eventNodes.map((node, i) => (
         <React.Fragment key={`evt-${i}-${label}`}>
            <Line
                points={[position, node.position]}
                color="#ef4444" // Red line
                lineWidth={1}
                transparent
                opacity={0.6}
            />
            <Html
                position={node.position}
                zIndexRange={[100, 0]}
                style={{ pointerEvents: 'none' }}
                transform={false} 
            >
                <div className="
                    px-1.5 py-0.5
                    bg-black/40 backdrop-blur-[1px] rounded-sm
                    text-white/90 font-sans font-medium
                    select-none whitespace-nowrap
                    transform -translate-x-1/2 -translate-y-1/2
                    border-l-2 border-red-500
                    hover:bg-black/60 transition-colors
                "
                style={{ 
                   fontSize: '10px', 
                   letterSpacing: '0.5px',
                   textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                }}
                >
                    {node.event.time} • {node.event.event}
                </div>
            </Html>
         </React.Fragment>
      ))}
    </group>
  );
};

const financialCenters = [
  { name: "New York", lat: 40.7128, lon: -74.0060, color: "#0088ff", timezone: "America/New_York", openHour: 9.5, closeHour: 16 },
  { name: "London", lat: 51.5074, lon: -0.1278, color: "#00ff44", timezone: "Europe/London", openHour: 8, closeHour: 16.5 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, color: "#ff2222", timezone: "Asia/Tokyo", openHour: 9, closeHour: 15 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, color: "#ffaa00", timezone: "Australia/Sydney", openHour: 10, closeHour: 16 }
];

export const EarthScene: React.FC<EarthSceneProps> = ({ events = {}, focusTarget }) => {
  const textureUrl = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
  const colorMap = useLoader(TextureLoader, textureUrl);
  const earthRef = useRef<Mesh>(null!);
  const cloudsRef = useRef<Mesh>(null!);
  const { camera } = useThree();
  
  const [marketStatus, setMarketStatus] = useState<Record<string, boolean>>({});
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  // Animation Refs
  const targetRotationY = useRef<number | null>(null);
  const isAnimating = useRef(false);

  const R = 2;

  // Handle Search Target Change
  useEffect(() => {
    if (focusTarget && countryCoordinates[focusTarget]) {
        setSelectedMarker(focusTarget);
        const coords = countryCoordinates[focusTarget];
        
        // Accurate Rotation Math to align target longitude with camera
        
        // 1. Get local vector of the country on the sphere (normalized, radius 1)
        const localPos = latLongToVector3(coords.lat, coords.lon, 1);
        
        // 2. Calculate the angle of the Camera in the XZ plane
        // Math.atan2(x, z) gives the angle starting from Z-axis (0) towards X-axis.
        const targetAngle = Math.atan2(camera.position.x, camera.position.z);
        
        // 3. Calculate the angle of the Country point in the local XZ plane
        const pointAngle = Math.atan2(localPos.x, localPos.z);
        
        // 4. Determine required rotation.
        // We want: currentRotation + pointAngle = targetAngle
        // So: currentRotation_Target = targetAngle - pointAngle
        const desiredRotation = targetAngle - pointAngle;

        // 5. Calculate shortest path delta
        const currentRot = earthRef.current.rotation.y;
        let delta = desiredRotation - currentRot;
        
        // Normalize delta to -PI to +PI range for shortest turn
        while (delta > Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;

        targetRotationY.current = currentRot + delta;
        isAnimating.current = true;
    }
  }, [focusTarget, camera]);

  useEffect(() => {
    const checkMarkets = () => {
      const now = new Date();
      const status: Record<string, boolean> = {};

      financialCenters.forEach((center) => {
        try {
          const day = now.toLocaleDateString('en-US', { timeZone: center.timezone, weekday: 'long' });
          const timeParts = now.toLocaleTimeString('en-US', { timeZone: center.timezone, hour12: false }).split(':');
          
          const hour = parseInt(timeParts[0]);
          const minute = parseInt(timeParts[1]);
          const decimalTime = hour + (minute / 60);

          const isWeekend = day === 'Saturday' || day === 'Sunday';
          const isOpen = !isWeekend && decimalTime >= center.openHour && decimalTime < center.closeHour;

          status[center.name] = isOpen;
        } catch (e) {
          status[center.name] = false;
        }
      });

      setMarketStatus(status);
    };

    checkMarkets();
    const interval = setInterval(checkMarkets, 60000);
    return () => clearInterval(interval);
  }, []);

  useFrame(() => {
    if (!earthRef.current) return;

    if (isAnimating.current && targetRotationY.current !== null) {
       // Interpolate to target
       earthRef.current.rotation.y = MathUtils.lerp(earthRef.current.rotation.y, targetRotationY.current, 0.08);
       
       if (cloudsRef.current) {
          cloudsRef.current.rotation.y = earthRef.current.rotation.y * 1.05; 
       }

       // Stop animating when close enough
       if (Math.abs(earthRef.current.rotation.y - targetRotationY.current) < 0.001) {
           isAnimating.current = false;
           targetRotationY.current = null;
       }
    } else if (!selectedMarker) {
        // Auto rotate only if nothing is selected
        earthRef.current.rotation.y += 0.0005;
        if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0007;
    }
    // If selectedMarker is present and animation finished, rotation stays frozen
  });

  const handleBgClick = () => {
    setSelectedMarker(null);
    isAnimating.current = false;
    targetRotationY.current = null;
  };

  return (
    <>
      <ambientLight intensity={0.3} color="#ffffff" />
      <directionalLight position={[5, 3, 5]} intensity={2.5} castShadow />
      <spotLight position={[-5, 0, -5]} intensity={0.5} color="#4455ff" />

      <group>
        <mesh ref={earthRef} onClick={handleBgClick}>
          <sphereGeometry args={[R, 64, 64]} />
          <meshStandardMaterial map={colorMap} roughness={0.6} metalness={0.1} />

          {Object.entries(countryCoordinates).map(([name, coords]) => {
            // Determine relevant events for this country based on mapping
            const apiCountryKey = countryNameMapping[name] || name;
            const relevantEvents = events[apiCountryKey] || [];

            return (
                <LocationMarker 
                key={name} 
                lat={coords.lat} 
                lon={coords.lon} 
                radius={R + 0.01} 
                label={name} 
                isSelected={selectedMarker === name}
                onSelect={() => setSelectedMarker(selectedMarker === name ? null : name)}
                onClose={() => setSelectedMarker(null)}
                customEvents={relevantEvents}
                />
            );
          })}

          {financialCenters.map((city) => (
            <LocationMarker 
              key={city.name} 
              lat={city.lat} 
              lon={city.lon} 
              radius={R + 0.01} 
              label={city.name}
              color={city.color}
              isOpen={marketStatus[city.name]}
              isSelected={selectedMarker === city.name}
              onSelect={() => setSelectedMarker(selectedMarker === city.name ? null : city.name)}
              onClose={() => setSelectedMarker(null)}
            />
          ))}
        </mesh>
      </group>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[R + 0.03, 64, 64]} />
        <meshPhongMaterial color="#4faeff" opacity={0.15} transparent side={DoubleSide} blending={2} depthWrite={false} />
      </mesh>

      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} minDistance={3} maxDistance={12} zoomSpeed={0.6} rotateSpeed={0.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </>
  );
};
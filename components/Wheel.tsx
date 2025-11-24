import React, { useEffect, useRef, useState } from 'react';
import { select, pie as d3Pie, arc as d3Arc, easeCubicInOut, PieArcDatum } from 'd3';
import { getSegmentColor } from '../utils/colors';
import { playTickSound, playWinSound, TickSoundType, WinSoundType } from '../utils/audio';

interface WheelProps {
  items: string[];
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinEnd: (winner: string) => void;
  spinDuration: number; // in seconds
  tickSoundId: TickSoundType;
  winSoundId: WinSoundType;
}

const Wheel: React.FC<WheelProps> = ({ 
  items, 
  isSpinning, 
  onSpinStart, 
  onSpinEnd,
  spinDuration,
  tickSoundId,
  winSoundId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });
  
  // Physics state
  const rotationRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastIndexRef = useRef<number>(-1);
  
  // State to track if we are in the "stopping" phase of the spin to prevent re-triggering logic
  const isFinishedRef = useRef(false);

  // Keyboard support (Ctrl+Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'Enter') {
            if (!isSpinning && items.length > 0) {
                onSpinStart();
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, items, onSpinStart]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const size = Math.min(width, height);
        setDimensions({ width: size, height: size });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // D3 Drawing (Static Parts)
  // We only redraw the structure when dimensions or items change.
  // The rotation is handled separately in the animation loop for performance.
  useEffect(() => {
    drawWheelStructure();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, dimensions]); 

  // Helper to determine winner based on pointer at 90 degrees
  const getWinnerIndex = (rotation: number, totalItems: number) => {
     // D3 draws 0 degrees at 12 o'clock, clockwise.
     // The pointer is at 90 degrees (3 o'clock).
     // When the wheel rotates by `rotation` degrees clockwise:
     // The segment originally at angle A moves to A + rotation.
     // We want the segment where (A + rotation) covers 90 degrees.
     // So A = 90 - rotation.
     const pointerAngle = 90;
     const effectiveAngle = (pointerAngle - rotation) % 360;
     const normalizedAngle = effectiveAngle < 0 ? effectiveAngle + 360 : effectiveAngle;
     const segmentAngle = 360 / totalItems;
     return Math.floor(normalizedAngle / segmentAngle);
  };

  // Animation Loop (Handles both Idle and Active Spin)
  useEffect(() => {
    // Reset finish flag when spin starts
    if (isSpinning) {
        isFinishedRef.current = false;
        lastIndexRef.current = -1;
    }

    let startTime: number | null = null;
    const initialRotation = rotationRef.current;
    
    // Add extra rotations for speed
    const totalRotationToAdd = 360 * 10 + Math.random() * 360; 
    const finalRotation = initialRotation + totalRotationToAdd;

    const tick = (currentTime: number) => {
        // 1. Calculate Rotation
        if (isSpinning) {
            if (!startTime) startTime = currentTime;
            const elapsed = (currentTime - startTime) / 1000;

            if (elapsed >= spinDuration) {
                if (!isFinishedRef.current) {
                    isFinishedRef.current = true;
                    rotationRef.current = finalRotation;
                    updateVisuals(finalRotation, true);
                    
                    // Winner Calc
                    playWinSound(winSoundId);
                    const winnerIndex = getWinnerIndex(finalRotation, items.length);
                    const winner = items[winnerIndex];
                    onSpinEnd(winner);
                }
            } else {
                // Modified Physics for "Hand Flick" feel
                // t goes from 0 to 1 over spinDuration
                const t = elapsed / spinDuration;
                
                // We warp time to make the acceleration phase faster and deceleration longer.
                // t^0.5 makes the curve start faster but accelerate smoother than t^0.25
                // It provides a "heavy" but fast flick feeling.
                const tModified = Math.pow(t, 0.5);
                const ease = easeCubicInOut(tModified);
                
                const currentRot = initialRotation + (totalRotationToAdd * ease);
                
                // Tick Sound Check
                const curIndex = getWinnerIndex(currentRot, items.length);
                if (curIndex !== lastIndexRef.current) {
                    playTickSound(tickSoundId);
                    lastIndexRef.current = curIndex;
                }

                rotationRef.current = currentRot;
                updateVisuals(currentRot, true);
                animationFrameRef.current = requestAnimationFrame(tick);
            }
        } else {
            // IDLE ANIMATION
            // Rotate slowly
            rotationRef.current = (rotationRef.current + 0.2) % 36000; // Keep it increasing but reset eventually
            updateVisuals(rotationRef.current, false);
            animationFrameRef.current = requestAnimationFrame(tick);
        }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isSpinning, items, spinDuration, onSpinEnd, tickSoundId, winSoundId]);


  // Helper to update transforms and LED colors without full redraw
  const updateVisuals = (rotation: number, spinning: boolean) => {
     // 1. Rotate Wheel Group
     select('#wheel-group').attr('transform', `rotate(${rotation})`);

     // 2. LED Effect
     const now = Date.now();
     let color;
     if (spinning) {
         // Strobe effect (Vivid Neon Colors)
         const colors = [
           "#FF00FF", // Magenta
           "#00FFFF", // Cyan
           "#FFFF00", // Yellow
           "#FF3300", // Neon Red
           "#39FF14", // Neon Green
           "#FFFFFF"  // White
         ];
         // Change color every 80ms based on time
         const idx = Math.floor(now / 80) % colors.length;
         color = colors[idx];
     } else {
         // Smooth Rainbow (Brighter)
         const hue = (now / 40) % 360; 
         color = `hsl(${hue}, 100%, 60%)`;
     }
     
     // Update LED Center
     select('#led-inner').attr('fill', color).attr('opacity', spinning ? 0.9 : 0.5);

     // 3. Dynamic Pointer Color
     // Determine which segment is under the pointer
     const currentIndex = getWinnerIndex(rotation, items.length);
     // Get its color
     const segmentColor = getSegmentColor(currentIndex, items.length);
     // Apply to the pointer fill
     select('#pointer-dynamic-fill').attr('fill', segmentColor);
  };

  const drawWheelStructure = () => {
    const svg = select('#wheel-svg');
    svg.selectAll("*").remove(); 

    const width = dimensions.width;
    const height = dimensions.height;
    const margin = 40; // More margin for external pointer
    const outerRadius = (Math.min(width, height) / 2) - margin;
    const innerRadius = 45; // Center hole size

    // Define Gradients, Filters, Styles
    const defs = svg.append("defs");

    // CSS for Breathing Text
    defs.append("style").text(`
      @keyframes breath {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); }
      }
      .breathing-text {
        animation: breath 2s ease-in-out infinite;
        transform-box: fill-box;
        transform-origin: center;
      }
    `);

    // Drop Shadow
    const filter = defs.append("filter").attr("id", "drop-shadow").attr("height", "130%");
    filter.append("feGaussianBlur").attr("in", "SourceAlpha").attr("stdDeviation", 8);
    filter.append("feOffset").attr("dx", 4).attr("dy", 8).attr("result", "offsetblur");
    filter.append("feComponentTransfer").append("feFuncA").attr("type", "linear").attr("slope", "0.5");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "offsetblur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Gloss
    const radialGradient = defs.append("radialGradient")
        .attr("id", "gloss-gradient")
        .attr("cx", "50%").attr("cy", "50%").attr("r", "50%").attr("fx", "30%").attr("fy", "30%");
    radialGradient.append("stop").attr("offset", "0%").attr("stop-color", "white").attr("stop-opacity", 0.5);
    radialGradient.append("stop").attr("offset", "100%").attr("stop-color", "white").attr("stop-opacity", 0);

    // Pointer Shadow
    const pointerShadow = defs.append("filter")
        .attr("id", "pointer-shadow")
        .attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    pointerShadow.append("feDropShadow")
        .attr("dx", 0).attr("dy", 4).attr("stdDeviation", 4).attr("flood-opacity", 0.5);

    // --- Main Container ---
    const mainGroup = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // --- Wheel Group (Rotates) ---
    const wheelGroup = mainGroup.append("g").attr("id", "wheel-group");

    const pie = d3Pie<string>().sort(null).value(1);
    const arc = d3Arc<PieArcDatum<string>>().outerRadius(outerRadius).innerRadius(innerRadius);

    const arcs = wheelGroup.selectAll(".arc")
      .data(pie(items))
      .enter().append("g")
      .attr("class", "arc");

    // Segments
    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => getSegmentColor(i, items.length))
      .attr("stroke", "rgba(0,0,0,0.1)")
      .attr("stroke-width", "1");

    // Gloss
    arcs.append("path")
      .attr("d", arc)
      .attr("fill", "url(#gloss-gradient)")
      .style("pointer-events", "none");

    // Text
    arcs.append("text")
      .attr("transform", function(d) {
        // Calculate angle
        const midAngle = ((d.startAngle + d.endAngle) / 2) * (180 / Math.PI);
        // Rotate and then translate to the outer edge minus padding
        return `rotate(${midAngle - 90}) translate(${outerRadius - 20}, 0)`; 
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "end") // Align text to end at the outer rim (reading inwards)
      .text(d => {
        // Truncate logic depending on font size
        let maxLen = 14; 
        if (items.length <= 12) maxLen = 14; // Large font, less chars
        else if (items.length <= 24) maxLen = 16; // Medium font
        else maxLen = 20; // Small font, more chars

        return d.data.length > maxLen ? d.data.substring(0, maxLen - 1) + '..' : d.data;
      })
      .style("fill", "#fff")
      .style("font-weight", "800")
      .style("font-size", () => {
        if (items.length <= 12) return "30px";
        if (items.length <= 24) return "22px";
        return "14px";
      })
      .style("font-family", "'Inter', sans-serif")
      .style("text-shadow", "1px 1px 3px rgba(0,0,0,0.8)");

    // --- Center Hub (LED) ---
    // Metal ring around hub
    mainGroup.append("circle")
         .attr("r", innerRadius + 4)
         .attr("fill", "#334155")
         .attr("stroke", "#1e293b")
         .attr("stroke-width", 4)
         .style("filter", "drop-shadow(0px 4px 4px rgba(0,0,0,0.4))");

    // Clickable area
    const centerGroup = mainGroup.append("g")
         .style("cursor", "pointer")
         .on("click", () => {
             if(!isSpinning) onSpinStart();
         });

    // LED Background (Black screen)
    centerGroup.append("circle")
         .attr("r", innerRadius)
         .attr("fill", "#000");

    // LED Light (Dynamic Fill)
    centerGroup.append("circle")
         .attr("id", "led-inner")
         .attr("r", innerRadius)
         .attr("fill", "blue")
         .attr("opacity", 0.3)
         .style("mix-blend-mode", "screen");
    
    // "SPIN" Text with Breathing Animation
    centerGroup.append("text")
        .attr("class", "breathing-text") // Apply the breathing animation class
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text("SPIN")
        .style("fill", "#FFF")
        .style("font-weight", "900")
        .style("font-size", "18px")
        .style("font-family", "Inter, sans-serif")
        .style("letter-spacing", "1px")
        .style("user-select", "none")
        .style("filter", "drop-shadow(0px 0px 5px rgba(255,255,255,0.8))");

    // --- 3D Pointer (External) ---
    // Moved outside the wheel radius
    const pointerDist = outerRadius + 5; // Gap from edge
    
    const pointerG = svg.append("g")
       .attr("transform", `translate(${width/2 + pointerDist}, ${height/2})`)
       .style("filter", "url(#pointer-shadow)");

    // Pointer shape: Triangle pointing Left.
    // Coords: (0,0) is the tip. 
    pointerG.append("path")
       .attr("id", "pointer-dynamic-fill") // Added ID to target this specific path
       .attr("d", "M0,0 L35,-15 L35,15 Z") 
       .attr("fill", "#f43f5e") // Initial color
       .attr("stroke", "rgba(0,0,0,0.5)")
       .attr("stroke-width", 1);
       
    // 3D Highlight on pointer
    pointerG.append("path")
       .attr("d", "M0,0 L35,-15 L35,0 Z")
       .attr("fill", "rgba(255,255,255,0.3)")
       .style("pointer-events", "none");

  };

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-slate-800 rounded-full border-8 border-slate-700 aspect-square max-w-[500px] text-slate-500 font-bold shadow-2xl">
        Add Names
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full flex items-center justify-center overflow-visible"
    >
        <svg 
          id="wheel-svg" 
          width={dimensions.width} 
          height={dimensions.height}
          style={{ overflow: 'visible' }}
        />
    </div>
  );
};

export default Wheel;
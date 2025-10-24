import { Visualizer } from './types';

// --- Helper Functions ---
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const getBass = (data: Uint8Array) => data.slice(0, 8).reduce((a, b) => a + b, 0) / (8 * 255);
const getMids = (data: Uint8Array) => data.slice(32, 96).reduce((a, b) => a + b, 0) / (64 * 255);
const getHighs = (data: Uint8Array) => data.slice(128, 255).reduce((a, b) => a + b, 0) / (127 * 255);

// --- Visualizer 1: Stellar Field ---
let stellarFieldStars: { 
    x: number, 
    y: number, 
    z: number,
    px: number,
    py: number,
    isNew: boolean,
    frequencyBin: number,
    hue: number 
}[] = [];

const stellarField: Visualizer = {
    name: 'Stellar Field',
    init: (ctx) => {
        const { width, height } = ctx.canvas;
        const starCount = width < 768 ? 300 : 800;
        stellarFieldStars = Array.from({ length: starCount }, () => ({
            x: (Math.random() - 0.5) * width,
            y: (Math.random() - 0.5) * height,
            z: Math.random() * width,
            px: 0,
            py: 0,
            isNew: true,
            frequencyBin: Math.floor(Math.random() * 128),
            hue: 200 + Math.random() * 60, // Blues, cyans, purples
        }));
    },
    draw: (ctx, data) => {
        const { width, height } = ctx.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        
        const highs = getHighs(data);
        const speed = 0.5 + Math.pow(highs, 2) * 120;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, width, height);
        ctx.lineCap = 'round';
        
        stellarFieldStars.forEach(star => {
            star.z -= speed;

            const scale = width / star.z;
            const px = star.x * scale + centerX;
            const py = star.y * scale + centerY;

            // Reset star when it goes off screen or behind the camera
            if (star.z < 1 || px < 0 || px > width || py < 0 || py > height) {
                star.x = (Math.random() - 0.5) * width;
                star.y = (Math.random() - 0.5) * height;
                star.z = width;
                star.isNew = true;
                return; // Skip drawing this frame to avoid visual artifacts
            }

            const energy = data[star.frequencyBin] / 255.0;
            const size = (1 - star.z / width) * (1 + energy * 6);
            if (size <= 0) return;

            const lightness = 60 + energy * 40;
            const alpha = (1 - star.z / width) * (0.5 + energy * 0.5);

            ctx.strokeStyle = `hsla(${star.hue}, 100%, ${lightness}%, ${alpha})`;
            ctx.lineWidth = size;
            
            if (star.isNew) {
                // Set the initial position but don't draw a line yet
                star.px = px;
                star.py = py;
                star.isNew = false;
            } else {
                // Draw the trail
                ctx.beginPath();
                ctx.moveTo(star.px, star.py);
                ctx.lineTo(px, py);
                ctx.stroke();
                
                // Update the previous position for the next frame
                star.px = px;
                star.py = py;
            }
        });
        
        ctx.shadowBlur = 0; // Reset shadow for other visualizers
    }
};

// --- Visualizer 2: Ionized Sphere (Enhanced) ---
let spherePoints: { x: number, y: number, z: number, dataIndex: number }[] = [];
let sphereRotationY = 0;
let sphereRotationX = 0;
let cameraJolt = { x: 0, y: 0, intensity: 0 };

const ionizedSphere: Visualizer = {
    name: 'Ionized Sphere',
    init: (ctx) => {
        spherePoints = [];
        sphereRotationY = 0;
        sphereRotationX = 0;
        cameraJolt = { x: 0, y: 0, intensity: 0 };
        const numPoints = ctx.canvas.width < 768 ? 300 : 600;
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

        for (let i = 0; i < numPoints; i++) {
            const y = 1 - (i / (numPoints - 1)) * 2; // y from 1 to -1
            const radius = Math.sqrt(1 - y * y);
            const theta = phi * i;
            const x = Math.cos(theta) * radius;
            const z = Math.sin(theta) * radius;
            const dataIndex = Math.floor(Math.random() * 256);
            spherePoints.push({ x, y, z, dataIndex });
        }
    },
    draw: (ctx, data) => {
        const { width, height } = ctx.canvas;
        const bass = getBass(data);
        const mids = getMids(data);
        const highs = getHighs(data);

        // --- Camera Shake ---
        if (bass > 0.65 && cameraJolt.intensity <= 0) {
            cameraJolt.intensity = bass * 12;
        }
        cameraJolt.x = (Math.random() - 0.5) * cameraJolt.intensity;
        cameraJolt.y = (Math.random() - 0.5) * cameraJolt.intensity;
        cameraJolt.intensity = lerp(cameraJolt.intensity, 0, 0.1);
        
        const centerX = width / 2 + cameraJolt.x;
        const centerY = height / 2 + cameraJolt.y;
        
        // --- Rotation ---
        sphereRotationY += bass * 0.02 + highs * 0.025;
        sphereRotationX += mids * 0.015 + highs * 0.02;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, width, height);

        // --- Background Nebula ---
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, width * 0.8);
        const hueBg = 220 + (mids + bass) / 2 * 80;
        grad.addColorStop(0, `hsla(${hueBg}, 100%, 20%, ${(mids+bass)/2 * 0.4})`);
        grad.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        const perspective = width * 0.8;
        const baseSphereRadius = Math.min(width, height) * 0.25;

        // --- Pre-calculate Rotation ---
        const sinY = Math.sin(sphereRotationY);
        const cosY = Math.cos(sphereRotationY);
        const sinX = Math.sin(sphereRotationX);
        const cosX = Math.cos(sphereRotationX);
        
        // --- Calculate Point Properties ---
        const projectedPoints = spherePoints.map(point => {
            // Y-axis rotation
            let rotX = point.x * cosY - point.z * sinY;
            let rotZ = point.x * sinY + point.z * cosY;
            // X-axis rotation
            let rotY = point.y * cosX - rotZ * sinX;
            let finalZ = point.y * sinX + rotZ * cosX;
            
            // --- RANDOMIZED Frequency Mapping ---
            const amplitude = data[point.dataIndex] / 255;
            
            const extrusion = 1.0 + amplitude * amplitude * 0.5;
            const sphereRadius = baseSphereRadius * extrusion;

            const scale = perspective / (perspective + finalZ * sphereRadius);
            const x2d = centerX + rotX * sphereRadius * scale;
            const y2d = centerY + rotY * sphereRadius * scale;
            
            const size = scale * (1.5 + amplitude * 3);
            const alpha = (scale * 0.7 + amplitude * 0.3);
            const hue = 200 + amplitude * 120;
            const lightness = 40 + amplitude * 60;
            const color = `hsla(${hue}, 100%, ${lightness}%, ${alpha})`;

            return { x2d, y2d, size, alpha, color, z: finalZ };
        });

        // --- Draw Bokeh Reflections (Background) ---
        ctx.globalCompositeOperation = 'lighter';
        projectedPoints.forEach(p => {
            if (p.z > -1 && p.alpha > 0.5) {
                const bokehSize = p.size * 15;
                const grd = ctx.createRadialGradient(p.x2d, p.y2d, 0, p.x2d, p.y2d, bokehSize);
                const colorWithoutAlpha = p.color.replace(/hsla\(|\)/g, '').split(',');
                grd.addColorStop(0, `hsla(${colorWithoutAlpha[0]}, ${colorWithoutAlpha[1]}, ${colorWithoutAlpha[2]}, ${p.alpha * 0.1})`);
                grd.addColorStop(1, `hsla(${colorWithoutAlpha[0]}, ${colorWithoutAlpha[1]}, ${colorWithoutAlpha[2]}, 0)`);
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(p.x2d, p.y2d, bokehSize, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalCompositeOperation = 'source-over';

        // --- Draw Main Sphere (Foreground) ---
        projectedPoints.sort((a,b) => a.z - b.z); // Z-sort for 3D effect
        projectedPoints.forEach(p => {
             if (p.z > -1) { 
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x2d, p.y2d, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
};

export const visualizers: Visualizer[] = [
    ionizedSphere,
    stellarField,
];
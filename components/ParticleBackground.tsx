import React, { useEffect, useRef, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
    sway: number;
    swayOffset: number;
}

interface ParticleBackgroundProps {
    particleCount?: number;
    particleColor?: string;
    className?: string;
}

export default function ParticleBackground({
    particleCount = 150,
    particleColor = 'rgba(255, 255, 255, 0.5)',
    className = ''
}: ParticleBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();

    // Initialize particles
    const initParticles = useCallback((width: number, height: number) => {
        const particles: Particle[] = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2 + 1, // 1px to 3px
                speed: Math.random() * 1.5 + 0.5, // 0.5 to 2.0 speed
                opacity: Math.random() * 0.5 + 0.1, // 0.1 to 0.6 opacity
                sway: Math.random() * 0.5 - 0.25, // Slight horizontal drift
                swayOffset: Math.random() * Math.PI * 2 // Random starting phase
            });
        }
        particlesRef.current = particles;
    }, [particleCount]);

    // Animation loop
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const time = Date.now() * 0.001;

        particlesRef.current.forEach((p) => {
            // Move Upwards (Anti-gravity)
            p.y -= p.speed;

            // Horizontal Sway
            p.x += Math.sin(time + p.swayOffset) * 0.2 + p.sway;

            // Reset when off screen (top)
            if (p.y < -10) {
                p.y = height + 10;
                p.x = Math.random() * width;
            }

            // Draw Particle (Glowing Dot)
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = particleColor;
            ctx.globalAlpha = p.opacity;
            ctx.fill();

            // Optional: Glow effect
            // ctx.shadowBlur = p.size * 2;
            // ctx.shadowColor = particleColor;
        });

        // Restore context
        ctx.globalAlpha = 1.0;
        // ctx.shadowBlur = 0;

        animationRef.current = requestAnimationFrame(animate);
    }, [particleColor]);

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();

        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);

        // Re-init particles if dimensions change significantly? 
        // For now just init logic uses screen dims for distribution range
        // but we want smoothly continuing animation really.
        // Let's just re-init if the array is empty, otherwise keep them.
        if (particlesRef.current.length === 0) {
            initParticles(rect.width, rect.height);
        }
    }, [initParticles]);

    useEffect(() => {
        handleResize();
        const canvas = canvasRef.current;
        // Initial setup
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            initParticles(rect.width, rect.height);
        }

        animate();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [handleResize, animate, initParticles]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 pointer-events-none ${className}`}
            style={{ width: '100%', height: '100%' }}
        />
    );
}

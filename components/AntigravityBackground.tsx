import React, { useEffect, useRef, useCallback } from 'react';

interface Particle {
    homeX: number; // Original grid position X
    homeY: number; // Original grid position Y
    x: number; // Current position X
    y: number; // Current position Y
    vx: number; // Velocity X
    vy: number; // Velocity Y
    hue: number; // Color hue
    size: number;
}

interface Ripple {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    strength: number;
}

interface AntigravityBackgroundProps {
    particleCount?: number;
    className?: string;
}

export default function AntigravityBackground({
    className = ''
}: AntigravityBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const ripplesRef = useRef<Ripple[]>([]);
    const animationRef = useRef<number>();
    const mouseRef = useRef({ x: -1000, y: -1000, isMoving: false });
    const lastMousePosRef = useRef({ x: -1000, y: -1000 });
    const autoRippleTimerRef = useRef(0);

    // Initialize particles in a grid pattern
    const initParticles = useCallback((width: number, height: number) => {
        const particles: Particle[] = [];
        const spacing = 25; // Grid spacing
        const cols = Math.ceil(width / spacing) + 2;
        const rows = Math.ceil(height / spacing) + 2;
        const offsetX = (width - (cols - 1) * spacing) / 2;
        const offsetY = (height - (rows - 1) * spacing) / 2;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const homeX = offsetX + col * spacing;
                const homeY = offsetY + row * spacing;

                // Color based on position - cluster distribution
                const centerX = width / 2;
                const centerY = height / 2;
                const dx = homeX - centerX;
                const dy = homeY - centerY;
                const angle = Math.atan2(dy, dx);

                let hue;
                const normalizedAngle = (angle + Math.PI) / (2 * Math.PI); // 0 to 1
                if (normalizedAngle < 0.2) {
                    hue = 200 + Math.random() * 40; // Blue (right side)
                } else if (normalizedAngle < 0.4) {
                    hue = 280 + Math.random() * 40; // Purple (bottom-right)
                } else if (normalizedAngle < 0.6) {
                    hue = 320 + Math.random() * 30; // Pink/Magenta (bottom)
                } else if (normalizedAngle < 0.8) {
                    hue = 20 + Math.random() * 30; // Orange (left side)
                } else {
                    hue = 180 + Math.random() * 30; // Cyan (top)
                }

                particles.push({
                    homeX,
                    homeY,
                    x: homeX,
                    y: homeY,
                    vx: 0,
                    vy: 0,
                    hue,
                    size: 2.5 + Math.random() * 1,
                });
            }
        }
        particlesRef.current = particles;
    }, []);

    // Add ripple effect
    const addRipple = useCallback((x: number, y: number, strength = 80) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const maxRadius = Math.max(rect.width, rect.height) * 1.2;

        ripplesRef.current.push({
            x,
            y,
            radius: 0,
            maxRadius,
            strength
        });
    }, []);

    // Animation loop
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const displayWidth = canvas.width / dpr;
        const displayHeight = canvas.height / dpr;

        // Light background
        const bgGradient = ctx.createRadialGradient(
            displayWidth / 2, displayHeight / 2, 0,
            displayWidth / 2, displayHeight / 2, Math.max(displayWidth, displayHeight) * 0.8
        );
        bgGradient.addColorStop(0, '#FAFBFF');
        bgGradient.addColorStop(0.5, '#F5F8FF');
        bgGradient.addColorStop(1, '#EAF0FF');

        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, displayWidth, displayHeight);

        // Blue vignette
        const vignetteGradient = ctx.createRadialGradient(
            displayWidth / 2, displayHeight / 2, Math.max(displayWidth, displayHeight) * 0.15,
            displayWidth / 2, displayHeight / 2, Math.max(displayWidth, displayHeight) * 0.85
        );
        vignetteGradient.addColorStop(0, 'rgba(100, 150, 255, 0)');
        vignetteGradient.addColorStop(1, 'rgba(100, 150, 255, 0.15)');

        ctx.fillStyle = vignetteGradient;
        ctx.fillRect(0, 0, displayWidth, displayHeight);

        // Auto-generate ripples periodically
        autoRippleTimerRef.current++;
        if (autoRippleTimerRef.current > 120) { // Every ~2 seconds at 60fps
            autoRippleTimerRef.current = 0;
            const rx = Math.random() * displayWidth;
            const ry = Math.random() * displayHeight;
            addRipple(rx, ry, 50 + Math.random() * 40);
        }

        // Update ripples
        const rippleSpeed = 6;
        ripplesRef.current = ripplesRef.current.filter(ripple => {
            ripple.radius += rippleSpeed;
            return ripple.radius < ripple.maxRadius;
        });

        // Update particles
        const damping = 0.92;
        const springStrength = 0.08;
        const rippleWidth = 80;

        particlesRef.current.forEach((p) => {
            // Apply ripple forces
            ripplesRef.current.forEach(ripple => {
                const dx = p.homeX - ripple.x;
                const dy = p.homeY - ripple.y;
                const distFromCenter = Math.sqrt(dx * dx + dy * dy);

                // Check if particle is in the ripple ring
                const distFromRipple = Math.abs(distFromCenter - ripple.radius);
                if (distFromRipple < rippleWidth) {
                    const rippleInfluence = 1 - (distFromRipple / rippleWidth);
                    const fadeOut = 1 - (ripple.radius / ripple.maxRadius);
                    const force = ripple.strength * rippleInfluence * fadeOut;

                    // Push outward from ripple center
                    if (distFromCenter > 0) {
                        p.vx += (dx / distFromCenter) * force * 0.15;
                        p.vy += (dy / distFromCenter) * force * 0.15;
                    }
                }
            });

            // Mouse interaction - push particles away
            const mouseX = mouseRef.current.x;
            const mouseY = mouseRef.current.y;
            const mdx = p.x - mouseX;
            const mdy = p.y - mouseY;
            const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy);
            const mouseRadius = 100;

            if (mouseDist < mouseRadius && mouseDist > 0) {
                const force = (1 - mouseDist / mouseRadius) * 8;
                p.vx += (mdx / mouseDist) * force;
                p.vy += (mdy / mouseDist) * force;
            }

            // Spring back to home position
            const toHomeX = p.homeX - p.x;
            const toHomeY = p.homeY - p.y;
            p.vx += toHomeX * springStrength;
            p.vy += toHomeY * springStrength;

            // Apply velocity with damping
            p.vx *= damping;
            p.vy *= damping;
            p.x += p.vx;
            p.y += p.vy;

            // Calculate stretch based on velocity
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const stretch = Math.min(speed * 0.8, 8);
            const moveAngle = Math.atan2(p.vy, p.vx);

            // Draw particle
            ctx.save();
            ctx.translate(p.x, p.y);

            if (stretch > 0.5) {
                // Stretched ellipse when moving fast
                ctx.rotate(moveAngle);
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size + stretch, p.size, 0, 0, Math.PI * 2);
            } else {
                // Circle when at rest
                ctx.beginPath();
                ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            }

            const saturation = 75;
            const lightness = 60;
            const opacity = 0.85;
            ctx.fillStyle = `hsla(${p.hue}, ${saturation}%, ${lightness}%, ${opacity})`;

            // Subtle glow
            ctx.shadowBlur = p.size * 2;
            ctx.shadowColor = `hsla(${p.hue}, ${saturation}%, ${lightness}%, 0.4)`;

            ctx.fill();
            ctx.restore();
        });

        animationRef.current = requestAnimationFrame(animate);
    }, [addRipple]);

    const handleResize = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();

        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);

        initParticles(rect.width, rect.height);
    }, [initParticles]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if mouse moved significantly to trigger ripple
        const dx = x - lastMousePosRef.current.x;
        const dy = y - lastMousePosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 50) {
            addRipple(x, y, 40);
            lastMousePosRef.current = { x, y };
        }

        mouseRef.current = { x, y, isMoving: true };
    }, [addRipple]);

    const handleMouseLeave = useCallback(() => {
        mouseRef.current = { x: -1000, y: -1000, isMoving: false };
    }, []);

    const handleClick = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addRipple(x, y, 100);
    }, [addRipple]);

    useEffect(() => {
        handleResize();
        animate();

        window.addEventListener('resize', handleResize);
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.pointerEvents = 'auto';
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseleave', handleMouseLeave);
            canvas.addEventListener('click', handleClick);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (canvas) {
                canvas.removeEventListener('mousemove', handleMouseMove);
                canvas.removeEventListener('mouseleave', handleMouseLeave);
                canvas.removeEventListener('click', handleClick);
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [handleResize, animate, handleMouseMove, handleMouseLeave, handleClick]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 ${className}`}
            style={{ width: '100%', height: '100%' }}
        />
    );
}

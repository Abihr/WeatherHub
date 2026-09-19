import React, { useEffect, useRef, useState } from 'react';

// 3D Rain Effect
export const RainEffect = ({ intensity = 'medium' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let drops = [];
    let splashes = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Drop count based on intensity
    const dropCounts = { light: 60, medium: 120, heavy: 250 };
    const dropCount = dropCounts[intensity] || 120;

    // Create drops
    class Drop {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.length = 15 + Math.random() * 20;
        this.speed = 8 + Math.random() * 8;
        this.opacity = 0.2 + Math.random() * 0.4;
        this.width = 1 + Math.random() * 1.5;
      }
      update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
          // Create splash
          splashes.push(new Splash(this.x, canvas.height - 5));
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(174, 219, 255, ${this.opacity})`;
        ctx.lineWidth = this.width;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.width, this.y + this.length);
        ctx.stroke();
      }
    }

    // Splash effect
    class Splash {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 1;
        this.maxRadius = 8;
        this.opacity = 0.5;
      }
      update() {
        this.radius += 0.5;
        this.opacity -= 0.04;
      }
      draw() {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(174, 219, 255, ${Math.max(0, this.opacity)})`;
        ctx.lineWidth = 1;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      isDead() {
        return this.opacity <= 0;
      }
    }

    for (let i = 0; i < dropCount; i++) {
      drops.push(new Drop());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drops.forEach(drop => {
        drop.update();
        drop.draw();
      });

      splashes = splashes.filter(s => !s.isDead());
      splashes.forEach(splash => {
        splash.update();
        splash.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ opacity: 0.6 }}
    />
  );
};

// 3D Snow Effect
export const SnowEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let flakes = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class Flake {
      constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.radius = 1 + Math.random() * 3;
        this.speed = 1 + Math.random() * 2;
        this.sway = Math.random() * 2 - 1;
        this.opacity = 0.4 + Math.random() * 0.6;
      }
      update() {
        this.y += this.speed;
        this.x += Math.sin(this.y / 30) * this.sway;
        if (this.y > canvas.height) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 150; i++) flakes.push(new Flake());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flakes.forEach(f => { f.update(); f.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
      style={{ opacity: 0.7 }}
    />
  );
};

// 3D Sun/Heat Effect
export const SunEffect = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Sun rays */}
      <div className="absolute -top-32 -right-32 w-96 h-96">
        <div className="absolute inset-0 bg-gradient-radial from-yellow-300/40 via-orange-200/20 to-transparent rounded-full animate-pulse-slow" />
        <div className="absolute inset-0 bg-gradient-radial from-yellow-200/30 to-transparent rounded-full animate-ping-slow" />
      </div>
      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-yellow-300/40 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
};

// Clouds Effect
export const CloudsEffect = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute opacity-30"
          style={{
            top: `${10 + i * 15}%`,
            left: '-20%',
            animation: `drift ${30 + i * 10}s linear infinite`,
            animationDelay: `${i * 3}s`,
          }}
        >
          <div className="relative">
            <div className="w-32 h-16 bg-white rounded-full" />
            <div className="absolute -top-6 left-8 w-24 h-16 bg-white rounded-full" />
            <div className="absolute -top-4 left-20 w-20 h-12 bg-white rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
(() => {
  const backgroundCanvas = document.getElementById("background-canvas");
  const sparkCanvas = document.getElementById("spark-canvas");
  const mouseFollower = document.getElementById("mouse-follower");

  if (!backgroundCanvas || !sparkCanvas || !mouseFollower) {
    return;
  }

  const backgroundCtx = backgroundCanvas.getContext("2d");
  const sparkCtx = sparkCanvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const userAgent = navigator.userAgent || "";
  const platform = navigator.userAgentData && typeof navigator.userAgentData.platform === "string"
    ? navigator.userAgentData.platform
    : navigator.platform || "";
  const isWindows = /Win/i.test(platform) || /Windows/i.test(userAgent);
  const isAppleTouchDevice = /iPhone|iPad|iPod/i.test(userAgent) ||
    (/Mac/i.test(platform) && Number(navigator.maxTouchPoints || 0) > 1);
  const isMacDesktop = !isWindows && /Mac/i.test(platform) && !isAppleTouchDevice;
  const effectsEnabled = isWindows || !prefersReducedMotion;
  const followerEnabled = effectsEnabled && !isMacDesktop;
  const targetFrameMs = isMacDesktop ? 1000 / 30 : 0;
  document.documentElement.classList.toggle("is-mac-desktop", isMacDesktop);
  document.documentElement.classList.toggle("is-windows", isWindows);
  document.documentElement.classList.toggle("prefers-reduced-motion", Boolean(prefersReducedMotion));
  document.documentElement.classList.toggle("effects-disabled", !effectsEnabled);
  window.timeTavernEffects = {
    platform,
    isWindows,
    isAppleTouchDevice,
    isMacDesktop,
    prefersReducedMotion: Boolean(prefersReducedMotion),
    effectsEnabled,
    followerEnabled
  };
  mouseFollower.hidden = !followerEnabled;

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let particles = [];
  let sparks = [];
  let animationFrameId = 0;
  let lastFrameTime = 0;
  let lastMacClickEffectTime = 0;

  const followerAngleOffset = Math.PI / 2;
  const followerOrbitRadius = 32;
  const mouse = {
    x: 0,
    y: 0,
    active: false
  };
  const follower = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    angle: 0,
    visible: false,
    orbitAngle: Math.PI * 0.75
  };

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function getFollowerTarget(x, y, useOrbit = false) {
    if (useOrbit) {
      return {
        x: x + Math.cos(follower.orbitAngle) * followerOrbitRadius,
        y: y + Math.sin(follower.orbitAngle) * followerOrbitRadius
      };
    }

    return {
      x: x - followerOrbitRadius,
      y: y + followerOrbitRadius
    };
  }

  function createParticles() {
    const count = isMacDesktop
      ? Math.min(320, Math.max(90, Math.floor((width * height) / 4200)))
      : Math.min(1200, Math.floor((width * height) / 900));
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const spreadX = width * 0.42;
    const spreadY = height * 0.34;

    particles = Array.from({ length: count }, (_, index) => {
      const useCluster = index < count * 0.58;
      const angle = random(0, Math.PI * 2);
      const radius = Math.pow(Math.random(), 1.8);
      const oval = 0.72 + Math.random() * 0.55;
      const x = useCluster
        ? centerX + Math.cos(angle) * spreadX * radius * oval + random(-22, 22)
        : random(0, width);
      const y = useCluster
        ? centerY + Math.sin(angle) * spreadY * radius + random(-22, 22)
        : random(0, height);

      return {
        x,
        y,
        homeX: x,
        homeY: y,
        pushX: 0,
        pushY: 0,
        pushLife: 0,
        size: random(0.6, 2.2),
        baseAlpha: random(0.18, 0.95),
        phase: random(0, Math.PI * 2),
        speed: random(0.025, 0.065),
        floatPhase: random(0, Math.PI * 2),
        floatSpeed: random(0.006, 0.018),
        floatRadius: random(0.4, 1.8)
      };
    });
  }

  function resizeCanvas() {
    pixelRatio = isMacDesktop
      ? Math.min(window.devicePixelRatio || 1, 1.25)
      : Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    for (const canvas of [backgroundCanvas, sparkCanvas]) {
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    backgroundCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    sparkCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    if (!follower.visible) {
      follower.x = width * 0.5;
      follower.y = height * 0.5;
      follower.targetX = follower.x;
      follower.targetY = follower.y;
    }

    createParticles();
  }

  function getChasingParticles() {
    if (!mouse.active) {
      return new Set();
    }

    const chaseRadius = 220;
    const chaseCount = 7;
    const nearest = particles
      .map((particle) => {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        return {
          particle,
          distance: Math.hypot(dx, dy)
        };
      })
      .filter((item) => item.distance <= chaseRadius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, chaseCount);

    return new Set(nearest.map((item) => item.particle));
  }

  function pushNearestParticles(x, y) {
    const pushRadius = 240;
    const pushCount = Math.floor(random(5, 8));
    const nearest = particles
      .map((particle) => {
        const dx = particle.x - x;
        const dy = particle.y - y;
        return {
          particle,
          dx,
          dy,
          distance: Math.hypot(dx, dy)
        };
      })
      .filter((item) => item.distance <= pushRadius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, pushCount);

    for (const item of nearest) {
      const distance = item.distance || 1;
      const force = 120 * (1 - Math.min(distance / pushRadius, 0.75));
      item.particle.pushX += (item.dx / distance) * force;
      item.particle.pushY += (item.dy / distance) * force;
      item.particle.pushLife = 48;
    }
  }

  function drawBackground() {
    backgroundCtx.clearRect(0, 0, width, height);

    const glow = backgroundCtx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      0,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.55
    );
    glow.addColorStop(0, "rgba(20, 76, 255, 0.2)");
    glow.addColorStop(0.42, "rgba(12, 37, 160, 0.08)");
    glow.addColorStop(1, "rgba(2, 3, 11, 0)");
    backgroundCtx.fillStyle = glow;
    backgroundCtx.fillRect(0, 0, width, height);

    const chasingParticles = getChasingParticles();

    for (const particle of particles) {
      particle.phase += particle.speed;
      particle.floatPhase += particle.floatSpeed;

      const floatingHomeX = particle.homeX + Math.cos(particle.floatPhase) * particle.floatRadius;
      const floatingHomeY = particle.homeY + Math.sin(particle.floatPhase) * particle.floatRadius;
      particle.pushX *= 0.92;
      particle.pushY *= 0.92;
      if (particle.pushLife > 0) {
        particle.pushLife -= 1;
      }

      let targetX = floatingHomeX + particle.pushX;
      let targetY = floatingHomeY + particle.pushY;
      let moveSpeed = 0.025;

      if (particle.pushLife > 0) {
        moveSpeed = 0.085;
      } else if (chasingParticles.has(particle)) {
        targetX = mouse.x;
        targetY = mouse.y;
        moveSpeed = 0.014;
      }

      particle.x += (targetX - particle.x) * moveSpeed;
      particle.y += (targetY - particle.y) * moveSpeed;

      const twinkle = (Math.sin(particle.phase) + 1) * 0.5;
      const red = 12 + twinkle * 62;
      const green = 38 + twinkle * 118;
      const blue = 150 + twinkle * 105;
      const alpha = particle.baseAlpha * (0.55 + twinkle * 0.45);
      const radius = particle.size * (0.85 + twinkle * 0.55);

      backgroundCtx.beginPath();
      backgroundCtx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      if (isMacDesktop) {
        backgroundCtx.shadowBlur = 0;
      } else {
        backgroundCtx.shadowColor = `rgba(${red}, ${green}, 255, 1)`;
        backgroundCtx.shadowBlur = 4 + twinkle * 26;
      }
      backgroundCtx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
      backgroundCtx.fill();
    }

    backgroundCtx.shadowBlur = 0;
  }

  function createSpark(x, y) {
    for (let i = 0; i < 34; i += 1) {
      const angle = random(0, Math.PI * 2);
      const speed = random(2, 8);
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: random(34, 58),
        maxLife: 58,
        size: random(1.4, 3.2),
        hue: random(0, 14)
      });
    }
  }

  function drawSparks() {
    sparkCtx.clearRect(0, 0, width, height);
    sparkCtx.globalCompositeOperation = "lighter";
    sparks = sparks.filter((spark) => spark.life > 0);

    for (const spark of sparks) {
      spark.life -= 1;
      if (spark.life <= 0) {
        continue;
      }

      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.vx *= 0.96;
      spark.vy *= 0.96;
      spark.vy += 0.04;

      const progress = Math.max(spark.life / spark.maxLife, 0);
      sparkCtx.beginPath();
      sparkCtx.fillStyle = `hsla(${spark.hue}, 100%, 62%, ${progress})`;
      sparkCtx.shadowColor = `hsla(${spark.hue}, 100%, 58%, ${progress})`;
      sparkCtx.shadowBlur = 16;
      sparkCtx.arc(spark.x, spark.y, spark.size * progress, 0, Math.PI * 2);
      sparkCtx.fill();
    }

    sparkCtx.globalCompositeOperation = "source-over";
    sparkCtx.shadowBlur = 0;
  }

  function shortestAngleDifference(from, to) {
    return Math.atan2(Math.sin(to - from), Math.cos(to - from));
  }

  function updateMouseFollower() {
    if (!followerEnabled || !follower.visible) {
      return;
    }

    const distanceToMouse = Math.hypot(mouse.x - follower.x, mouse.y - follower.y);
    if (mouse.active && distanceToMouse < followerOrbitRadius * 2.2) {
      follower.orbitAngle += 0.035;
      const target = getFollowerTarget(mouse.x, mouse.y, true);
      follower.targetX = target.x;
      follower.targetY = target.y;
    }

    follower.x += (follower.targetX - follower.x) * 0.12;
    follower.y += (follower.targetY - follower.y) * 0.12;

    const dx = follower.targetX - follower.x;
    const dy = follower.targetY - follower.y;
    if (Math.hypot(dx, dy) > 0.35) {
      const targetAngle = Math.atan2(dy, dx) + followerAngleOffset;
      follower.angle += shortestAngleDifference(follower.angle, targetAngle) * 0.18;
    }

    mouseFollower.style.transform =
      `translate3d(${follower.x}px, ${follower.y}px, 0) translate(-50%, -50%) rotate(${follower.angle}rad)`;
  }

  function animate(timestamp = 0) {
    if (!targetFrameMs || timestamp - lastFrameTime >= targetFrameMs) {
      drawBackground();
      drawSparks();
      updateMouseFollower();
      lastFrameTime = timestamp;
    }
    animationFrameId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (animationFrameId || !effectsEnabled || document.hidden) {
      return;
    }
    lastFrameTime = 0;
    animationFrameId = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (!animationFrameId) {
      return;
    }
    cancelAnimationFrame(animationFrameId);
    animationFrameId = 0;
  }

  function createMacClickEffect(x, y) {
    if (!effectsEnabled) {
      return;
    }

    const now = performance.now();
    if (now - lastMacClickEffectTime < 90) {
      return;
    }
    lastMacClickEffectTime = now;

    const ripple = document.createElement("span");
    ripple.className = "click-ripple";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);

    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    setTimeout(() => ripple.remove(), 700);
  }

  function updatePointer(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;

    if (!followerEnabled) {
      return;
    }

    const target = getFollowerTarget(event.clientX, event.clientY);
    follower.targetX = target.x;
    follower.targetY = target.y;

    if (!follower.visible) {
      follower.x = target.x;
      follower.y = target.y;
      follower.visible = true;
      mouseFollower.classList.add("is-visible");
    }
  }

  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pointermove", updatePointer, { passive: true });
  window.addEventListener("pointerleave", () => {
    mouse.active = false;
  });
  window.addEventListener("blur", () => {
    mouse.active = false;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });
  window.addEventListener("pointerdown", (event) => {
    updatePointer(event);
    if (isMacDesktop) {
      createMacClickEffect(event.clientX, event.clientY);
      return;
    }
    pushNearestParticles(event.clientX, event.clientY);
    createSpark(event.clientX, event.clientY);
  }, { passive: true });

  resizeCanvas();
  drawBackground();

  startAnimation();
})();

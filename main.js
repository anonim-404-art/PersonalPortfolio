import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

/* ==========================================================================
   1. HIDE-ON-SCROLL NAVIGATION TOP BAR
   ========================================================================== */
let lastScrollY = window.scrollY;
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  if (header) {
    if (window.scrollY > lastScrollY && window.scrollY > 80) {
      // Scrolling down - hide header off-screen
      header.style.transform = "translateY(-100%)";
    } else {
      // Scrolling up - show header
      header.style.transform = "translateY(0)";
    }
    lastScrollY = window.scrollY;
  }
});

/* ==========================================================================
   2. CUSTOM CURSOR Trail logic
   ========================================================================== */
const cursorDot = document.getElementById("cursor-dot");
const cursorCircle = document.getElementById("cursor-circle");

let mouse = { x: 0, y: 0 };
let dotPos = { x: 0, y: 0 };
let circlePos = { x: 0, y: 0 };

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function animateCursor() {
  dotPos.x += (mouse.x - dotPos.x) * 0.25;
  dotPos.y += (mouse.y - dotPos.y) * 0.25;
  
  circlePos.x += (mouse.x - circlePos.x) * 0.12;
  circlePos.y += (mouse.y - circlePos.y) * 0.12;
  
  if (cursorDot) {
    cursorDot.style.left = `${dotPos.x}px`;
    cursorDot.style.top = `${dotPos.y}px`;
  }
  if (cursorCircle) {
    cursorCircle.style.left = `${circlePos.x}px`;
    cursorCircle.style.top = `${circlePos.y}px`;
  }
  
  requestAnimationFrame(animateCursor);
}
animateCursor();

const setHoverListeners = () => {
  const interactableElements = document.querySelectorAll(
    "a, button, input, textarea, form, .project-item, .cursor-pointer"
  );
  
  interactableElements.forEach(el => {
    el.addEventListener("mouseenter", () => {
      document.body.classList.add("hovered");
    });
    el.addEventListener("mouseleave", () => {
      document.body.classList.remove("hovered");
    });
  });
};
setHoverListeners();

/* ==========================================================================
   3. PROJECT LIST CURSOR-TRAILING PREVIEW
   ========================================================================== */
const previewContainer = document.getElementById("project-preview-container");
const previewImg = document.getElementById("project-preview-img");
const projectItems = document.querySelectorAll(".project-item");

let targetPreviewX = 0;
let targetPreviewY = 0;
let currPreviewX = 0;
let currPreviewY = 0;

window.addEventListener("mousemove", (e) => {
  targetPreviewX = e.clientX;
  targetPreviewY = e.clientY;
});

// Follow mouse with dampening (lerp)
function animatePreviewTrail() {
  if (previewContainer && previewContainer.classList.contains("active")) {
    currPreviewX += (targetPreviewX - currPreviewX) * 0.15;
    currPreviewY += (targetPreviewY - currPreviewY) * 0.15;
    
    // Offset card: 25px to the right, 110px up to center vertically around cursor
    previewContainer.style.left = `${currPreviewX + 25}px`;
    previewContainer.style.top = `${currPreviewY - 110}px`;
  }
  requestAnimationFrame(animatePreviewTrail);
}
animatePreviewTrail();

// Bind event hooks to each project item
projectItems.forEach(item => {
  item.addEventListener("mouseenter", () => {
    if (previewImg && previewContainer) {
      previewImg.src = item.dataset.image;
      previewContainer.classList.add("active");
    }
  });
  
  item.addEventListener("mouseleave", () => {
    if (previewContainer) {
      previewContainer.classList.remove("active");
    }
  });

  item.addEventListener("click", (e) => {
    // Only trigger row redirect if NOT clicking on source code or demo links directly
    if (e.target.tagName !== "A") {
      window.open(item.dataset.url, "_blank");
    }
  });
});

/* ==========================================================================
   4. THREE.JS 3D PARTICLE TORUS KNOT
   ========================================================================== */
const canvas3d = document.getElementById("canvas-3d");
if (canvas3d) {
  const scene = new THREE.Scene();

  // Camera Settings
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 7;

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas3d,
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Geometry: Torus Knot particle points
  const count = 3800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const p = 3;
  const q = 7;
  const radius = 2.4;
  const tube = 0.55;

  for (let i = 0; i < count; i++) {
    const u = (i / count) * Math.PI * 2 * p;
    const cosU = Math.cos(u);
    const sinU = Math.sin(u);
    const cosQU = Math.cos(q * u / p);
    const sinQU = Math.sin(q * u / p);

    const x = radius * (1.1 + tube * cosQU) * cosU;
    const y = radius * (1.1 + tube * cosQU) * sinU;
    const z = radius * tube * sinQU;

    const fuzz = 0.22;
    positions[i * 3] = x + (Math.random() - 0.5) * fuzz;
    positions[i * 3 + 1] = y + (Math.random() - 0.5) * fuzz;
    positions[i * 3 + 2] = z + (Math.random() - 0.5) * fuzz;

    // Elegant gradient coloring
    const r = 0.4 + 0.6 * Math.sin(u);
    const g = 0.1 + 0.4 * Math.cos(u);
    const b = 0.8 + 0.2 * Math.sin(u * 1.5);

    colors[i * 3] = r;
    colors[i * 3 + 1] = g;
    colors[i * 3 + 2] = b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Materials settings
  const material = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleMesh = new THREE.Points(geometry, material);
  scene.add(particleMesh);

  // Background deep ambient space stars
  const bgCount = 350;
  const bgGeometry = new THREE.BufferGeometry();
  const bgPositions = new Float32Array(bgCount * 3);
  for (let i = 0; i < bgCount; i++) {
    bgPositions[i * 3] = (Math.random() - 0.5) * 35;
    bgPositions[i * 3 + 1] = (Math.random() - 0.5) * 35;
    bgPositions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
  }
  bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
  
  const bgMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x8b5cf6,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
  });
  
  const bgParticles = new THREE.Points(bgGeometry, bgMaterial);
  scene.add(bgParticles);

  // Mouse rotation offsets
  let mouseTargetX = 0;
  let mouseTargetY = 0;
  let mouseCurrX = 0;
  let mouseCurrY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseTargetY = (e.clientX / window.innerWidth - 0.5) * 0.45;
    mouseTargetX = (e.clientY / window.innerHeight - 0.5) * 0.45;
  });

  const clock = new THREE.Clock();
  const originalPositions = positions.slice();

  // Morph loop
  const animateThree = () => {
    const elapsed = clock.getElapsedTime();

    particleMesh.rotation.z = elapsed * 0.04;

    const posAttr = geometry.getAttribute('position');
    for (let i = 0; i < count; i++) {
      const x = originalPositions[i * 3];
      const y = originalPositions[i * 3 + 1];
      const z = originalPositions[i * 3 + 2];
      
      const wave = Math.sin((x + y) * 0.7 + elapsed * 1.4) * 0.11;
      posAttr.array[i * 3] = x + wave;
      posAttr.array[i * 3 + 1] = y + wave;
      posAttr.array[i * 3 + 2] = z + wave;
    }
    posAttr.needsUpdate = true;

    // Lerp mouse coordinates
    mouseCurrX += (mouseTargetX - mouseCurrX) * 0.05;
    mouseCurrY += (mouseTargetY - mouseCurrY) * 0.05;

    particleMesh.rotation.x = mouseCurrX;
    particleMesh.rotation.y = mouseCurrY;

    bgParticles.rotation.y = elapsed * -0.008;

    renderer.render(scene, camera);
    requestAnimationFrame(animateThree);
  };
  animateThree();

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    update3DPosition();
  };

  const update3DPosition = () => {
    if (window.innerWidth >= 1024) {
      particleMesh.position.x = 2.4; 
      particleMesh.position.y = 0;
      particleMesh.scale.set(1.0, 1.0, 1.0);
    } else {
      particleMesh.position.x = 0;
      particleMesh.position.y = -0.6;
      particleMesh.scale.set(0.65, 0.65, 0.65);
    }
  };

  update3DPosition();
  window.addEventListener("resize", handleResize);

  /* ==========================================================================
     5. GSAP SCROLLTRIGGER SCENE TRANSLATIONS
     ========================================================================== */
  // Timeline: Hero -> About
  gsap.timeline({
    scrollTrigger: {
      trigger: "#home",
      start: "top top",
      end: "bottom top",
      scrub: 1.2
    }
  })
  .to(particleMesh.position, {
    x: () => (window.innerWidth >= 1024 ? -2.4 : 0),
    y: () => (window.innerWidth >= 1024 ? 0 : -1.2),
    z: -1.5,
    ease: "power2.inOut"
  })
  .to(particleMesh.rotation, {
    x: Math.PI * 0.5,
    y: Math.PI * 0.8,
    ease: "power2.inOut"
  }, 0);

  // Timeline: About -> Projects
  gsap.timeline({
    scrollTrigger: {
      trigger: "#about",
      start: "bottom bottom",
      end: "bottom top",
      scrub: 1.2
    }
  })
  .to(particleMesh.position, {
    x: 0,
    y: 0,
    z: 2.2,
    ease: "power2.inOut"
  })
  .to(material, {
    opacity: 0.28, // Dim backdrop visibility for text lists
    ease: "power2.inOut"
  }, 0);

  // Timeline: Projects -> Contact
  gsap.timeline({
    scrollTrigger: {
      trigger: "#projects",
      start: "bottom bottom",
      end: "bottom top",
      scrub: 1.2
    }
  })
  .to(particleMesh.position, {
    x: () => (window.innerWidth >= 1024 ? 2.4 : 0),
    y: () => (window.innerWidth >= 1024 ? 0.2 : -1.4),
    z: 0,
    ease: "power2.inOut"
  })
  .to(material, {
    opacity: 0.8,
    ease: "power2.inOut"
  }, 0);
}

/* ==========================================================================
   6. GSAP SCROLL-DRIVEN ENTRANCE ANIMATIONS
   ========================================================================== */
window.addEventListener("load", () => {
  const tl = gsap.timeline();
  
  tl.from("header", {
    y: -40,
    opacity: 0,
    duration: 1.2,
    ease: "power3.out"
  })
  .from("#home div.font-mono", {
    y: -20,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out"
  }, "-=0.6")
  .from("#home h1", {
    y: 50,
    opacity: 0,
    duration: 1.2,
    ease: "power4.out"
  }, "-=0.5")
  .from("#home p", {
    y: 30,
    opacity: 0,
    duration: 1.0,
    ease: "power3.out"
  }, "-=0.7")
  .from("#home a", {
    y: 20,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out"
  }, "-=0.6");
});

const sectionHeaders = document.querySelectorAll("section p.font-mono, section h2");
sectionHeaders.forEach(header => {
  gsap.from(header, {
    scrollTrigger: {
      trigger: header,
      start: "top 88%",
      toggleActions: "play none none none"
    },
    y: 35,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out"
  });
});

gsap.from("#about img", {
  scrollTrigger: {
    trigger: "#about",
    start: "top 72%",
  },
  scale: 0.95,
  opacity: 0,
  duration: 1.1,
  ease: "power3.out"
});

gsap.from("#about h3, #about p.text-zinc-400, #about .pt-10", {
  scrollTrigger: {
    trigger: "#about",
    start: "top 72%",
  },
  y: 30,
  opacity: 0,
  duration: 0.9,
  stagger: 0.15,
  ease: "power3.out"
});

gsap.from("#projects .project-item", {
  scrollTrigger: {
    trigger: "#projects",
    start: "top 68%",
  },
  y: 50,
  opacity: 0,
  duration: 0.9,
  stagger: 0.15,
  ease: "power3.out"
});

gsap.from("#contact .lg:col-span-5", {
  scrollTrigger: {
    trigger: "#contact",
    start: "top 78%",
  },
  x: -45,
  opacity: 0,
  duration: 1.0,
  ease: "power3.out"
});

gsap.from("#contact form", {
  scrollTrigger: {
    trigger: "#contact",
    start: "top 78%",
  },
  x: 45,
  opacity: 0,
  duration: 1.0,
  ease: "power3.out"
});

/* ==========================================================================
   7. NAVIGATION ACTIVE SECTION HIGHLIGHTER
   ========================================================================== */
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("section");

const handleNavHighlight = () => {
  let activeId = "home";
  
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.clientHeight;
    if (window.scrollY >= (top - 350)) {
      activeId = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${activeId}`) {
      link.classList.add("active");
    }
  });
};

window.addEventListener("scroll", handleNavHighlight);
handleNavHighlight();
window.addEventListener("resize", setHoverListeners);

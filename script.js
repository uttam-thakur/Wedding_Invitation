"use strict";

const introScreen = document.getElementById("introScreen");
const openButton = document.getElementById("openInvite");
const musicBtn = document.getElementById("musicBtn");
const musicIcon = document.getElementById("musicIcon");
const musicStatus = document.getElementById("musicStatus");

let audioContext = null;
let musicPlaying = false;
let musicTimer = null;
let noteIndex = 0;
let masterGain = null;


  /* =========================
     DUPLICATE ALPANA
  ========================= */

  const leftAlpana = document.querySelector(".alpana-left");
  const rightAlpana = document.querySelector(".alpana-right");

  // Clone the complete SVG, including its definitions.
  // SVG definitions are local to each SVG element.
  if (leftAlpana && rightAlpana) {
    rightAlpana.replaceChildren(
      leftAlpana.querySelector("svg").cloneNode(true)
    );
  }
/* A soft, original flute-and-bell inspired instrumental made with Web Audio.
   Starting it directly from the invitation click avoids autoplay restrictions
   and removes reliance on a third-party audio URL. */
function startCelebrationMusic() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    musicStatus.textContent = "Music is not supported in this browser";
    return Promise.resolve(false);
  }

  try {
    if (!audioContext) {
      audioContext = new AudioCtx();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.0001;
      masterGain.connect(audioContext.destination);
    }

    return audioContext
      .resume()
      .then(() => {
        if (musicPlaying) return true;
        musicPlaying = true;
        masterGain.gain.cancelScheduledValues(audioContext.currentTime);
        masterGain.gain.setTargetAtTime(0.16, audioContext.currentTime, 1.1);

        const melody = [
          392, 440, 523.25, 440, 349.23, 392, 440, 587.33, 523.25, 440, 392,
          349.23, 392, 440, 523.25, 659.25,
        ];
        const drone = [130.81, 146.83, 164.81, 146.83];
        const playNote = (frequency, start, duration, volume, type) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          const shimmer = audioContext.createOscillator();
          const shimmerGain = audioContext.createGain();

          osc.type = type || "sine";
          osc.frequency.setValueAtTime(frequency, start);
          shimmer.type = "sine";
          shimmer.frequency.setValueAtTime(frequency * 2.01, start);
          gain.gain.setValueAtTime(0.0001, start);
          gain.gain.exponentialRampToValueAtTime(volume, start + 0.12);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          shimmerGain.gain.setValueAtTime(0.0001, start);
          shimmerGain.gain.exponentialRampToValueAtTime(
            volume * 0.13,
            start + 0.1,
          );
          shimmerGain.gain.exponentialRampToValueAtTime(
            0.0001,
            start + duration * 0.7,
          );
          osc.connect(gain);
          gain.connect(masterGain);
          shimmer.connect(shimmerGain);
          shimmerGain.connect(masterGain);
          osc.start(start);
          shimmer.start(start);
          osc.stop(start + duration + 0.05);
          shimmer.stop(start + duration + 0.05);
        };

        const schedule = () => {
          if (!musicPlaying || !audioContext) return;
          const now = audioContext.currentTime + 0.05;
          const step = noteIndex % melody.length;
          playNote(melody[step], now, 1.8, 0.075, "sine");
          if (step % 4 === 0) {
            playNote(
              drone[Math.floor(step / 4) % drone.length],
              now,
              3.6,
              0.035,
              "triangle",
            );
            playNote(melody[step] * 2, now + 0.18, 1.2, 0.018, "sine");
          }
          noteIndex++;
        };

        schedule();
        musicTimer = window.setInterval(schedule, 1450);
        musicIcon.textContent = "Ⅱ";
        musicBtn.setAttribute("aria-label", "Pause celebration music");
        musicBtn.setAttribute("aria-pressed", "true");
        musicStatus.textContent = "♪ Celebration music playing";
        return true;
      })
      .catch(() => {
        musicStatus.textContent = "Tap the music button to start audio";
        return false;
      });
  } catch (error) {
    musicStatus.textContent = "Music could not start in this browser";
    return Promise.resolve(false);
  }
}

function stopCelebrationMusic() {
  musicPlaying = false;
  if (musicTimer) window.clearInterval(musicTimer);
  musicTimer = null;
  if (audioContext && masterGain) {
    masterGain.gain.cancelScheduledValues(audioContext.currentTime);
    masterGain.gain.setTargetAtTime(0.0001, audioContext.currentTime, 0.25);
  }
  musicIcon.textContent = "♫";
  musicBtn.setAttribute("aria-label", "Play celebration music");
  musicBtn.setAttribute("aria-pressed", "false");
  musicStatus.textContent = "♪ Music paused";
}

openButton.addEventListener("click", async (event) => {
  event.preventDefault();
  if (openButton.disabled) return;
  openButton.disabled = true;
  openButton.textContent = "Welcome to the celebration";
  // Audio starts in the same trusted click gesture to satisfy browser policy.
  startCelebrationMusic();

  introScreen.classList.add("doors-open");
  window.setTimeout(() => introScreen.classList.add("opening"), 1550);
  window.setTimeout(() => {
    introScreen.classList.add("dismissed");
    document.body.classList.remove("locked");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 6500);
});

musicBtn.addEventListener("click", () => {
  if (musicPlaying) stopCelebrationMusic();
  else startCelebrationMusic();
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 },
);

document
  .querySelectorAll(".reveal")
  .forEach((element) => revealObserver.observe(element));

const target = new Date("2026-12-13T19:00:00+05:30").getTime();
function tick() {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  document.getElementById("days").textContent = String(days).padStart(2, "0");
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(
    2,
    "0",
  );
  document.getElementById("seconds").textContent = String(seconds).padStart(
    2,
    "0",
  );
}
tick();
window.setInterval(tick, 1000);

/* Full-screen party popper celebration after the scratch card is revealed. */
function showScratchCelebration() {
  // Avoid showing the celebration more than once.
  if (document.querySelector(".scratch-celebration")) return;

  const celebration = document.createElement("div");
  celebration.className = "scratch-celebration";
  celebration.setAttribute("aria-hidden", "true");

  const popper = document.createElement("div");
  popper.className = "party-popper";
  popper.textContent = "🎉";
  celebration.appendChild(popper);

  const colors = [
    "#d4af37", "#ff4d6d", "#00c2ff", "#7c4dff",
    "#ffca3a", "#2ecc71", "#ff8c42", "#ffffff"
  ];

  for (let i = 0; i < 160; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--duration", 2.8 + Math.random() * 2.7 + "s");
    piece.style.setProperty("--delay", Math.random() * 0.8 + "s");
    piece.style.setProperty("--drift", Math.random() * 320 - 160 + "px");
    piece.style.width = 5 + Math.random() * 8 + "px";
    piece.style.height = 8 + Math.random() * 14 + "px";
    celebration.appendChild(piece);
  }

  document.body.appendChild(celebration);
  window.setTimeout(() => celebration.remove(), 6200);
}

/* Scratch card: pointer events support mouse, pen and touch screens. */
(function setupScratchCard() {
  const canvas = document.getElementById("scratchCanvas");
  const card = document.getElementById("scratchCard");
  if (!canvas || !card) return;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let scratching = false;
  let lastPoint = null;
  let revealed = false;

  function paintCover() {
    const rect = card.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#173d70");
    gradient.addColorStop(0.5, "#245d91");
    gradient.addColorStop(1, "#10284f");
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = "rgba(232,199,125,.72)";
    ctx.lineWidth = 1;
    ctx.strokeRect(7, 7, rect.width - 14, rect.height - 14);
    ctx.fillStyle = "#f4dfad";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "600 11px Montserrat, sans-serif";
    ctx.fillText("✧  SCRATCH HERE  ✧", rect.width / 2, rect.height / 2 - 4);
    ctx.font = "9px Montserrat, sans-serif";
    ctx.fillText(
      "REVEAL THE WEDDING DATE",
      rect.width / 2,
      rect.height / 2 + 15,
    );
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function scratchTo(point) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 29;
    if (lastPoint) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 15, 0, Math.PI * 2);
      ctx.fill();
    }
    lastPoint = point;
  }

  function checkProgress() {
    if (revealed) return;
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    const total = pixels.length / 4;
    // Sample every 16th pixel for a responsive progress check.
    for (let i = 3; i < pixels.length; i += 64) {
      if (pixels[i] < 80) transparent++;
    }
    if (transparent / (total / 16) > 0.42) {
      revealed = true;
      card.classList.add("revealed");
      showScratchCelebration();
      musicStatus.textContent = musicPlaying
        ? "♪ Celebration music playing"
        : "The date is revealed ✨";
    }
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (revealed) return;
    scratching = true;
    lastPoint = null;
    canvas.setPointerCapture(event.pointerId);
    scratchTo(pointFromEvent(event));
    event.preventDefault();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!scratching || revealed) return;
    scratchTo(pointFromEvent(event));
    event.preventDefault();
  });
  function finishScratch() {
    if (!scratching) return;
    scratching = false;
    lastPoint = null;
    checkProgress();
  }
  canvas.addEventListener("pointerup", finishScratch);
  canvas.addEventListener("pointercancel", finishScratch);
  canvas.addEventListener("pointerleave", finishScratch);

  paintCover();
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      if (!revealed) paintCover();
    }).observe(card);
  } else {
    window.addEventListener("resize", () => {
      if (!revealed) paintCover();
    });
  }
})();

document.getElementById("rsvpForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.getElementById("guest").value.trim();
  const attendance = document.getElementById("attendance").value;
  const count = document.getElementById("guests").value;
  const message = `Wedding RSVP for Aarav & Sneha\nName: ${name}\nResponse: ${attendance}\nGuests: ${count}`;
  window.open(
    `https://wa.me/?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener",
  );
});

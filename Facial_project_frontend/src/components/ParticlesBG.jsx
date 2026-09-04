import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

export default function ParticlesBG() {
  const particlesInit = async (engine) => {
    await loadFull(engine);
  };

  const options = {
    fullScreen: false,
    detectRetina: true,
    fpsLimit: 60,

    particles: {
      number: { value: 50, density: { enable: true, area: 900 } },
      color: { value: ["#00eaff", "#14f1c9", "#ff6a5c"] },
      shape: { type: "circle" },
      opacity: { value: 0.6, random: { enable: true, minimumValue: 0.3 } },
      size: { value: 3, random: { enable: true, minimumValue: 1 } },
      move: {
        enable: true,
        speed: 1.5,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
      },
      links: {
        enable: true,
        distance: 150,
        color: "#00eaff",
        opacity: 0.3,
        width: 1,
      },
    },

    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: true, mode: "push" },
      },
      modes: {
        repulse: { distance: 120, duration: 0.4 },
        push: { quantity: 4 },
      },
    },

    background: { color: "#0a0a0a" }, 
  };

  return (
    <div className="absolute inset-0 -z-10 opacity-90">
      <Particles init={particlesInit} options={options} />
    </div>
  );
}

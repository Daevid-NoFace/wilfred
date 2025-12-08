'use client'

import React from "react";
import { gsap } from "gsap";

// In dev mode, don't use base URL; in production, use it
const baseUrl = import.meta.env.DEV ? "" : import.meta.env.BASE_URL;

export function FeaturedImageGallery() {
  const data = [
    {
      imgelink: `${baseUrl}/wilfred-hero.webp`
    },
    {
      imgelink: `${baseUrl}/wilfred-hero2.webp`
    },
    {
      imgelink: `${baseUrl}/wilfred-hero3.webp`
    },
    {
      imgelink: `${baseUrl}/wilfred-hero.webp`
    },
    {
      imgelink: `${baseUrl}/wilfred-hero2.webp`
    },
  ];

  // índice de la imagen activa (empieza en la tercera)
  const [activeIndex, setActiveIndex] = React.useState(2);
  const mainImageRef = React.useRef<HTMLImageElement | null>(null);

  const active = data[activeIndex]?.imgelink;

  // Autoplay cada 3 segundos
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % data.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [data.length]);

  // Animación con GSAP al cambiar de imagen
  React.useEffect(() => {
    if (!mainImageRef.current) return;

    gsap.fromTo(
      mainImageRef.current,
      { autoAlpha: 0, scale: 0.95 },
      { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power2.out" }
    );
  }, [activeIndex]);

  return (
    <div className="grid gap-4">
      <div>
        <img
          ref={mainImageRef}
          className="h-[550px] w-full max-w-full rounded-lg object-cover object-center"
          src={active}
          alt=""
        />
      </div>
      <div className="grid grid-cols-5 gap-4">
        {data.map(({ imgelink }, index) => (
          <div key={index}>
            <img
              onClick={() => setActiveIndex(index)}
              src={imgelink}
              className="h-24 w-full max-w-full cursor-pointer rounded-lg object-cover object-center"
              alt="gallery-image"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
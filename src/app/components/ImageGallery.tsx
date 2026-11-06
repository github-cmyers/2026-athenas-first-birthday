"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

const dummyImages = [
  { id: 1, src: "/photos/1.JPG", alt: "Photo 1" },
  { id: 2, src: "/photos/2.jpg", alt: "Photo 2" },
  { id: 3, src: "/photos/3.jpg", alt: "Photo 3" },
  { id: 4, src: "/photos/4.JPG", alt: "Photo 4" },
  { id: 5, src: "/photos/5.JPG", alt: "Photo 5" },
  { id: 6, src: "/photos/6.JPG", alt: "Photo 6" },
];

// Each polaroid rests at its own slight angle with a strip of coloured tape.
// Written out in full so Tailwind can see every class.
const POLAROID_STYLES = [
  { tilt: "-rotate-3", tape: "bg-coral/60" },
  { tilt: "rotate-2", tape: "bg-sunny/70" },
  { tilt: "-rotate-1", tape: "bg-mint/60" },
  { tilt: "rotate-3", tape: "bg-grape/60" },
  { tilt: "-rotate-2", tape: "bg-bubblegum/60" },
  { tilt: "rotate-1", tape: "bg-sky/60" },
];

export default function ImageGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goToPrevious = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? dummyImages.length - 1 : selectedIndex - 1);
    }
  }, [selectedIndex]);

  const goToNext = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === dummyImages.length - 1 ? 0 : selectedIndex + 1);
    }
  }, [selectedIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex, goToPrevious, goToNext]);

  const selectedImage = selectedIndex !== null ? dummyImages[selectedIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 md:gap-x-8 md:gap-y-10">
        {dummyImages.map((image, index) => {
          const style = POLAROID_STYLES[index % POLAROID_STYLES.length];
          return (
            <button
              type="button"
              key={image.id}
              onClick={() => openLightbox(index)}
              aria-label={`Open ${image.alt}`}
              className={`group relative cursor-pointer rounded-md border-[3px] border-ink bg-white p-2 pb-8 shadow-[5px_5px_0_0_var(--color-ink)] transition-transform duration-300 hover:z-10 hover:rotate-0 hover:scale-[1.04] focus-visible:rotate-0 focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-sky md:p-3 md:pb-12 ${style.tilt}`}
            >
              <span
                aria-hidden="true"
                className={`absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-6 border border-ink/20 ${style.tape}`}
              />
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm border-2 border-ink">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Lightbox - rendered via portal to escape transformed parents */}
      {mounted && selectedImage && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/90"
          onClick={closeLightbox}
        >
          {/* Image container - absolutely centered */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[85vh] max-h-[85vh] aspect-[3/4]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage.src.replace("400/300", "1200/900")}
              alt={selectedImage.alt}
              fill
              className="object-contain rounded-xl"
              unoptimized
            />

            {/* Image caption */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 rounded-b-xl">
              <p className="text-white text-center">{selectedImage.alt}</p>
              <p className="text-white/60 text-sm text-center mt-1">
                {selectedIndex! + 1} / {dummyImages.length}
              </p>
            </div>
          </div>

          {/* Previous button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110 z-10"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110 z-10"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            className="absolute top-4 right-4 w-12 h-12 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Thumbnail strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 p-2 rounded-xl">
            {dummyImages.map((image, index) => (
              <button
                key={image.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(index);
                }}
                className={`relative w-16 h-12 rounded-lg overflow-hidden transition-all duration-300 ${
                  index === selectedIndex
                    ? "ring-2 ring-white scale-110"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

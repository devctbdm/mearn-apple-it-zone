'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import type { StaticImageData } from 'next/image'

// Backend-ready data interfaces
export interface SlideData {
  id: string
  image: string | StaticImageData
  title: string
  description?: string
  link?: string
}

export interface AdBoxData {
  id: string
  image: string | StaticImageData
  title: string
  description?: string
  link?: string
  position: 'top' | 'bottom'
}

export interface HomeSliderData {
  slides: SlideData[]
  adBoxes: AdBoxData[]
}

// Default placeholder data (will be replaced by backend)
const defaultData: HomeSliderData = {
  slides: [
    {
      id: '1',
      image: "/1.webp",
      title: '',
      description: '',
      link: '#'
    },
    {
      id: '2',
      image: "/2.webp",
      title: '',
      description: '',
      link: '#'
    },
    {
      id: '3',
      image: "/3.webp",
      title: '',
      description: '',
      link: '#'
    }
  ],
  adBoxes: [
    {
      id: 'ad1',
      image: "/ad1.webp",
      title: '',
      description: '',
      link: '#',
      position: 'top'
    },
    {
      id: 'ad2',
      image: "/ad2.webp",
      title: '',
      description: '',
      link: '#',
      position: 'bottom'
    }
  ]
}

interface HomeSliderProps {
  data?: HomeSliderData
}

const HomeSlider: React.FC<HomeSliderProps> = ({ data = defaultData }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % data.slides.length)
  }, [data.slides.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + data.slides.length) % data.slides.length)
  }, [data.slides.length])

  // Auto-advance slider
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(timer)
  }, [nextSlide])

  const slideVariants = {
    enter: {
      opacity: 0
    },
    center: {
      opacity: 1
    },
    exit: {
      opacity: 0
    }
  }

  return (
    <div className="w-ful">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6" style={{ height: '500px' }}>
          {/* Left Side - Main Slider (70% width on desktop) */}
          <div className="lg:col-span-7 relative h-full xxl:h-[500px]">
            <div className="relative overflow-hidden rounded-xl h-full bg-gray-100">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={currentIndex}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"  
                  exit="exit"
                  transition={{
                    opacity: { duration: 0.8, ease: 'easeInOut' }
                  }}
                  className="absolute inset-0"
                >
                  <Image
                    src={data.slides[currentIndex].image}
                    alt={data.slides[currentIndex].title}
                    fill
                    className="object-center"
                    sizes="(max-width: 768px) 100vw, 66vw"
                    loading="eager"
                  />
                  {data.slides[currentIndex].title && (
                    <>
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                        <motion.h2
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2"
                        >
                          {data.slides[currentIndex].title}
                        </motion.h2>
                        {data.slides[currentIndex].description && (
                          <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm sm:text-base text-gray-200 mb-4"
                          >
                            {data.slides[currentIndex].description}
                          </motion.p>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute sr-only left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute sr-only right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {data.slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Two Ad Boxes (30% width on desktop, horizontal on mobile) */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col gap-4 lg:gap-6 h-full">
            {data.adBoxes.map((adBox) => (
              <motion.div
                key={adBox.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: adBox.position === 'top' ? 0.4 : 0.5 }}
                className="relative overflow-hidden rounded-xl bg-gray-100 group cursor-pointer flex-1 min-h-0"
              >
                <Image
                  src={adBox.image}
                  alt={adBox.title}
                  fill
                  className="object-center transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 30vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {adBox.title}
                  </h3>
                  {adBox.description && (
                    <p className="text-sm text-gray-200">
                      {adBox.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div> 
        </div>
      </div>
    </div>
  )
}

export default HomeSlider
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Send, Brain, Database, Bell } from "lucide-react";

const images = [
  "/images/landingPageSlidingWindow/addis1.jpg",
  "/images/landingPageSlidingWindow/addis2.jpg",
  "/images/landingPageSlidingWindow/addis3.jpg",
];

const steps = [
  {
    title: "Report a Problem",
    description:
      "Easily submit issues like road damage, waste, or water leaks with a short description and photo.",
    icon: Send,
  },
  {
    title: "Smart Categorization",
    description:
      "Our AI model understands English, Amharic, and Afan Oromo — and routes complaints to the right department instantly.",
    icon: Brain,
  },
  {
    title: "Secure Storage & Tracking",
    description:
      "Every complaint is stored safely. Citizens receive a tracking ID and can monitor progress in real time.",
    icon: Database,
  },
  {
    title: "Admin Dashboard",
    description:
      "City officials view and manage complaints using a professional dashboard with map-based insights.",
    icon: CheckCircle,
  },
  {
    title: "Stay Informed",
    description:
      "Receive instant updates on complaint status through in-app notifications, SMS, or email.",
    icon: Bell,
  },
];

export default function LandingPage() {
  const [current, setCurrent] = useState(0);
  const [active, setActive] = useState(0);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  // --- Image carousel ---
  const nextSlide = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- Auto-cycle "How It Works" steps ---
  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
    }, 6000); // rotate every 6s
    return () => clearInterval(interval);
  }, []);

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const ActiveIcon = steps[active].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900 font-sans">
    

      {/* Hero Section */}
      <section className="relative h-[90vh] flex flex-col justify-center items-center text-center px-6">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold leading-tight max-w-3xl mb-6"
        >
          Report City Issues.{" "}
          <span className="bg-gradient-to-r from-primary-dark to-primary-light text-transparent bg-clip-text">
            Make Your Voice Heard
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10"
        >
          Fast, easy, and transparent complaint reporting for a smarter Addis
          Ababa.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="flex space-x-4 mb-12"
        >
          
          <button
            onClick={scrollToHowItWorks}
            className="px-7 py-3 rounded-xl border border-primary bg-white/60 backdrop-blur-sm text-primary font-semibold shadow hover:scale-105 transition-transform"
          >
            Learn How It Works
          </button>
        </motion.div>

        {/* Carousel */}
        <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {images.map((img, index) => (
              <div key={index} className="flex-shrink-0 w-full h-[420px]">
                <Image
                  src={img}
                  alt={`Addis Ababa ${index + 1}`}
                  width={1200}
                  height={600}
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>
            ))}
          </div>

          {/* Carousel Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white shadow-md rounded-full p-3 transition"
          >
            ◀
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white shadow-md rounded-full p-3 transition"
          >
            ▶
          </button>
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full transition ${
                current === index ? "bg-primary" : "bg-gray-300"
              }`}
            ></button>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <div
        ref={howItWorksRef}
        className="w-full flex justify-center py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      >
        <Card className="w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <CardHeader className="text-center pb-10">
            <CardTitle className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary-dark to-primary-light bg-clip-text text-transparent">
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              {/* Step Description */}
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-4">
                  <ActiveIcon className="w-10 h-10 text-primary" />
                  <h3 className="text-2xl font-bold">{steps[active].title}</h3>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {steps[active].description}
                </p>
                <div className="flex space-x-2 mt-4">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      className={`w-3 h-3 rounded-full transition ${
                        active === i
                          ? "bg-primary-light"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Step List / Navigation */}
              <div className="flex flex-col space-y-4">
                {steps.map((step, i) => (
                  <Button
                    key={i}
                    onClick={() => setActive(i)}
                    variant={active === i ? "default" : "outline"}
                    className={`justify-start h-auto py-4 px-6 text-left rounded-xl transition-all duration-300 ${
                      active === i
                        ? "bg-gradient-to-r from-primary-dark to-primary-light text-white shadow-lg scale-[1.02]"
                        : "hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <step.icon className="w-5 h-5" />
                      <span className="font-semibold">{step.title}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

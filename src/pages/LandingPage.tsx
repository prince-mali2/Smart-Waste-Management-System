import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trash2, ShieldCheck, Truck, BarChart3, Recycle, ArrowRight, MapPin, 
  Users, Zap, Sun, Moon, Camera, MessageSquare, Clock, Map, Sparkles, BookOpen 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion } from 'motion/react';
import { Globe3D } from '../components/Globe3D';
import { useTheme } from '../context/ThemeContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage: React.FC = () => {
  const featuresRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animations
      if (heroRef.current) {
        gsap.from('.hero-animate', {
          y: 50,
          opacity: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
        });
      }

      // Image Parallax & Scroll
      const imageContainer = document.querySelector('.hero-image-container');
      const mainImg = document.querySelector('#hero-main-img');
      const dots = document.querySelectorAll('.data-dot');

      if (imageContainer && mainImg) {
        // Smoother Scroll Animation
        gsap.fromTo(mainImg, 
          { scale: 1 },
          { 
            scale: 1.15, 
            scrollTrigger: {
              trigger: imageContainer,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.5 // Increased scrub for smoother damping
            }
          }
        );

        // Smoother Mouse Parallax (Desktop only)
        const handleMouseMove = (e: MouseEvent) => {
          if (window.innerWidth < 1024) return;
          
          const { clientX, clientY } = e;
          const { left, top, width, height } = imageContainer.getBoundingClientRect();
          
          const x = (clientX - (left + width / 2)) / (width / 2);
          const y = (clientY - (top + height / 2)) / (height / 2);

          // Using smoother easing and slightly longer duration for "liquid" feel
          gsap.to(mainImg, {
            x: x * 25,
            y: y * 25,
            rotationY: x * 6,
            rotationX: -y * 6,
            duration: 1.5,
            ease: 'power3.out'
          });

          dots.forEach((dot, i) => {
            gsap.to(dot, {
              x: x * (20 + i * 3),
              y: y * (20 + i * 3),
              duration: 1.8,
              ease: 'power3.out'
            });
          });
        };

        const container = imageContainer as HTMLElement;
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', () => {
          gsap.to([mainImg, ...dots], {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            duration: 2,
            ease: 'expo.out'
          });
        });
      }

      // Dots pulsing
      dots.forEach((dot) => {
        gsap.to(dot, {
          opacity: 0.3,
          scale: 0.7,
          duration: 1.5 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: Math.random() * 2
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black overflow-x-hidden transition-colors duration-300">
      {/* Floating Theme Toggle */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          onClick={toggleTheme}
          className="w-14 h-14 rounded-full shadow-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center p-0 border-4 border-white dark:border-gray-900"
        >
          {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 border-b border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-emerald-600 text-xl">
            <Trash2 className="h-8 w-8" />
            <span>EcoSmart</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-gray-600 dark:text-gray-400 font-medium">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#about" className="hover:text-emerald-600 transition-colors">About</a>
            <a href="#sdg" className="hover:text-emerald-600 transition-colors">SDG 11</a>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme}
              className="rounded-full w-10 h-10 p-0"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="dark:text-gray-300">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="hero-animate text-5xl md:text-7xl xl:text-8xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 leading-[1.1]">
                Smart Waste for <br />
                <span className="text-emerald-600">Sustainable Cities</span>
              </h1>
              <p className="hero-animate text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Transforming urban waste management through AI-driven insights, real-time citizen reporting, and optimized collection logistics.
              </p>
              <div className="hero-animate flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto gap-2 px-8 py-4 text-lg">
                    Join the Movement <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg">
                    Explore Platform
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full h-[400px] lg:h-[600px] relative">
              <Globe3D />
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            className="hero-image-container w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200 relative group cursor-pointer bg-gray-100 dark:bg-gray-800"
            style={{ perspective: '1200px' }}
          >
            {/* Dark Overlay & Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none" />
            
            {/* Data Overlay (Dots & Lines) */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <div 
                  key={i}
                  className="data-dot absolute w-2 h-2 bg-emerald-400 rounded-full blur-[1px] shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                  style={{
                    top: `${15 + Math.random() * 70}%`,
                    left: `${15 + Math.random() * 70}%`,
                    opacity: 0.6
                  }}
                />
              ))}
              {/* Grid Lines */}
              <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <img 
              id="hero-main-img"
              src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1600&h=900" 
              alt="Smart sustainable city with integrated green spaces and modern technology" 
              className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover transform will-change-transform transition-all duration-700 group-hover:brightness-110 opacity-100 relative z-30"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" ref={featuresRef} className="py-24 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">The Future of Urban Sanitation</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">Leveraging cutting-edge technology to solve one of the world's most pressing urban challenges.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Camera, 
                title: 'Smart Waste Reporting', 
                desc: 'Users can report waste issues by uploading images, adding descriptions, and selecting locations on an interactive map.' 
              },
              { 
                icon: MessageSquare, 
                title: 'AI-Powered Chatbot Assistant', 
                desc: 'A Gemini-based chatbot helps users with waste reporting, recycling guidance, and system navigation using smart suggestions.',
                isAI: true
              },
              { 
                icon: Clock, 
                title: 'Complaint Tracking System', 
                desc: 'Users can track complaint status in real-time from submission to completion (Pending, Assigned, Completed).' 
              },
              { 
                icon: Map, 
                title: 'Interactive Complaint Map & Heatmap', 
                desc: 'Admins can visualize waste complaints using map markers and heatmaps to identify high-density waste areas.' 
              },
              { 
                icon: Sparkles, 
                title: 'AI Complaint Insights', 
                desc: 'AI automatically analyzes complaints and generates summaries to highlight major issues and high-priority zones.',
                isAI: true
              },
              { 
                icon: BookOpen, 
                title: 'Recycling & Segregation Guide', 
                desc: 'Users can learn proper waste segregation and find nearby recycling centers using map-based navigation.' 
              },
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="feature-card relative bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl transition-all duration-300 group"
              >
                {feature.isAI && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI Powered
                  </div>
                )}
                <div className="h-14 w-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SDG 11 Section */}
      <section id="sdg" className="py-24 bg-emerald-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1">
            <div className="inline-block px-4 py-1 bg-emerald-500 rounded-full text-sm font-bold mb-6">SDG 11: SUSTAINABLE CITIES</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Building Resilient and Sustainable Urban Spaces</h2>
            <p className="text-emerald-100/80 text-lg mb-8 leading-relaxed">
              By 2050, 70% of the world's population will live in cities. EcoSmart provides the digital infrastructure needed to manage this growth sustainably, ensuring clean environments for all.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-3xl font-bold text-emerald-400">40%</p>
                <p className="text-sm text-emerald-200/60 uppercase tracking-wider font-semibold">Reduction in Litter</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-emerald-400">25%</p>
                <p className="text-sm text-emerald-200/60 uppercase tracking-wider font-semibold">Lower Fuel Usage</p>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl overflow-hidden shadow-2xl border border-emerald-800 bg-emerald-900/20"
            >
              <img 
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800&h=600" 
                alt="Green Urban Architecture" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 font-bold text-emerald-600 text-2xl mb-8">
            <Trash2 className="h-8 w-8" />
            <span>EcoSmart</span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-gray-500 dark:text-gray-400 font-medium mb-12">
            <a href="#" className="hover:text-emerald-600 transition-colors">Platform</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Solutions</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Impact</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Company</a>
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-sm">© 2024 EcoSmart Waste Management. Pioneering urban sustainability.</p>
        </div>
      </footer>
    </div>
  );
};

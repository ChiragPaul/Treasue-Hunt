import { useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Components
import Navigation from './components/Navigation';
import HomeSection from './components/HomeSection';
import HistorySection from './components/HistorySection';
import RulebooksSection from './components/RulebooksSection';
import StorySection from './components/StorySection';
import ImageSection from './components/ImageSection';
import CustomCursor from './components/CustomCursor';
import RegistrationBanner from './components/RegistrationBanner';
import Footer from './components/Footer';
import RegistrationPage from './components/RegistrationPage';
import AdminDashboard from './components/AdminDashboard';

gsap.registerPlugin(ScrollTrigger);

// Helper component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);
  return null;
}

function ConditionalNavigation() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/register')) {
    return null;
  }
  return <Navigation />;
}

function App() {
  const appRef = useRef();

  useGSAP(() => {
    // We can add global scroll triggers here if needed
  }, { scope: appRef });

  return (
    <Router>
      <ScrollToTop />
      <div className="app-container" ref={appRef}>
        <CustomCursor />
        <div className="noise-overlay"></div>
        
        {/* Fog/Mist Overlay */}
        <div className="fog-container">
          <div className="fog-layer layer-1"></div>
          <div className="fog-layer layer-2"></div>
          <div className="fog-layer layer-3"></div>
        </div>

        {/* Global Vignette Overlay (Flashlight effect) */}
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'radial-gradient(circle at center, transparent 15%, rgba(0,0,0,0.9) 90%)', pointerEvents: 'none', zIndex: 90 }}></div>

        <ConditionalNavigation />
        
        <Routes>
          <Route path="/" element={
            <main>
              <HomeSection />
              <StorySection />
              <ImageSection />
              <HistorySection />
              <RulebooksSection />
              <RegistrationBanner />
              <Footer />
            </main>
          } />
          
          <Route path="/register" element={
            <main>
              <RegistrationPage />
              <Footer />
            </main>
          } />
          
          <Route path="/admin" element={
            <main>
              <AdminDashboard />
              <Footer />
            </main>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  // This hook listens to the URL
  const { pathname } = useLocation();

  useEffect(() => {
    // Whenever the 'pathname' changes, scroll the window to the top (0, 0)
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component doesn't render anything visible
}

export default ScrollToTop;
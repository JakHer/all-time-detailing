import { useCallback, useEffect, useState } from 'react';

export const useResponsiveDetailsPanel = () => {
  const [isDesktopDetailsLayout, setIsDesktopDetailsLayout] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 1536px)').matches
      : false,
  );
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(min-width: 1536px)');
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktopDetailsLayout(event.matches);
    };

    setIsDesktopDetailsLayout(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (isDesktopDetailsLayout) {
      setIsMobileDetailsOpen(false);
    }
  }, [isDesktopDetailsLayout]);

  const openDetailsForCurrentLayout = useCallback(() => {
    setIsMobileDetailsOpen(!isDesktopDetailsLayout);
  }, [isDesktopDetailsLayout]);

  const closeMobileDetails = useCallback(() => {
    setIsMobileDetailsOpen(false);
  }, []);

  return {
    isDesktopDetailsLayout,
    isMobileDetailsOpen,
    setIsMobileDetailsOpen,
    openDetailsForCurrentLayout,
    closeMobileDetails,
  };
};

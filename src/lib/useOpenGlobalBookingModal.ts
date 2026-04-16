import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useOpenGlobalBookingModal() {
  const location = useLocation();
  const navigate = useNavigate();

  return useCallback(() => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('nowa', '1');

    navigate(
      {
        pathname: location.pathname,
        search: `?${nextParams.toString()}`,
        hash: location.hash,
      },
      { replace: false },
    );
  }, [location.hash, location.pathname, location.search, navigate]);
}

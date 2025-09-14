import { useIsMobile } from "../../hooks/use-mobile";

export function MobileDebug() {
  const isMobile = useIsMobile();
  
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 z-[9999] bg-red-500 text-white p-2 text-xs">
      <div>Mobile: {isMobile ? 'YES' : 'NO'}</div>
      <div>Width: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}</div>
    </div>
  );
}

import { useIsMobile } from '../hooks/use-mobile';

export function NotificationDebug() {
  const isMobile = useIsMobile();
  
  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-blue-600 text-white p-3 rounded-lg text-xs max-w-xs">
      <div className="font-bold mb-2">🔍 Notification Debug</div>
      <div>Mobile Hook: {isMobile ? '📱 YES' : '🖥️ NO'}</div>
      <div>Width: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}px</div>
      <div>Height: {typeof window !== 'undefined' ? window.innerHeight : 'N/A'}px</div>
      <div>Touch: {typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0 ? 'YES' : 'NO'}</div>
      <div>UserAgent: {typeof navigator !== 'undefined' ? (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
      ) : 'N/A'}</div>
      <div className="mt-2 text-yellow-200">
        Expected: {typeof window !== 'undefined' && window.innerWidth < 768 ? '📱 Mobile' : '🖥️ Desktop'}
      </div>
    </div>
  );
}

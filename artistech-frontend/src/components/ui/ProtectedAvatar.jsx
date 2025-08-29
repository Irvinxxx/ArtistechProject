import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const ProtectedAvatar = React.forwardRef(({ src, fallbackText, alt, className, ...props }, ref) => {
  const handleContextMenu = (e) => e.preventDefault();
  const handleDragStart = (e) => e.preventDefault();

  return (
    <Avatar ref={ref} className={cn('relative', className)} {...props}>
      <div 
        className="absolute inset-0 z-10" 
        onContextMenu={handleContextMenu} 
        onDragStart={handleDragStart}
      />
      <AvatarImage
        src={src}
        alt={alt}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        draggable="false"
        style={{ pointerEvents: 'none' }}
      />
      <AvatarFallback>{fallbackText}</AvatarFallback>
    </Avatar>
  );
});

export default ProtectedAvatar;

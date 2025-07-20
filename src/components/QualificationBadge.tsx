
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface QualificationBadgeProps {
  source: 'gis' | 'none' | string;
  className?: string;
}

export const QualificationBadge: React.FC<QualificationBadgeProps> = ({ 
  source, 
  className = "" 
}) => {
  const getBadgeContent = () => {
    switch (source) {
      case 'gis':
        return {
          icon: '✓',
          text: 'GIS Qualified',
          className: 'bg-green-100 text-green-700 border-green-200'
        };
      default:
        return {
          icon: '?',
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-500 border-gray-200'
        };
    }
  };

  const badge = getBadgeContent();

  return (
    <Badge 
      variant="outline" 
      className={`inline-flex items-center gap-1 text-xs font-semibold ${badge.className} ${className}`}
    >
      <span className="font-bold">{badge.icon}</span>
      <span>{badge.text}</span>
    </Badge>
  );
};

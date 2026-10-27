import React from 'react';
import type { MasteryLevel, SkillCategory } from '../../types/index.ts';

interface SkillBadgeProps {
  category?: SkillCategory;
  level?: MasteryLevel;
  text?: string;
  className?: string;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  category,
  level,
  text,
  className = ''
}) => {
  const getCategoryClass = () => {
    switch (category) {
      case 'HTML':
        return 'badge-html';
      case 'CSS':
        return 'badge-css';
      case 'JavaScript':
        return 'badge-js';
      default:
        return 'badge-neutral';
    }
  };

  const getLevelClass = () => {
    switch (level) {
      case 'mastered':
        return 'level-mastered';
      case 'proficient':
        return 'level-proficient';
      case 'developing':
        return 'level-developing';
      case 'novice':
        return 'level-novice';
      case 'unassessed':
      default:
        return 'level-unassessed';
    }
  };

  if (level) {
    const label = text || level.charAt(0).toUpperCase() + level.slice(1);
    return <span className={`badge ${getLevelClass()} ${className}`}>{label}</span>;
  }

  if (category) {
    return <span className={`badge ${getCategoryClass()} ${className}`}>{category}</span>;
  }

  return <span className={`badge badge-neutral ${className}`}>{text}</span>;
};

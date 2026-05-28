import React from 'react';

export default function ItemName({ name, style, className }) {
  if (!name) return <span style={style} className={className}>(unknown)</span>;
  
  // Split the string by anything inside () or [], optionally preceded by a comma and space
  const parts = name.split(/((?:,\s*)?(?:\([^)]+\)|\[[^\]]+\]))/g);
  
  return (
    <span style={style} className={className}>
      {parts.map((part, i) => {
        if (part && part.match(/^(?:,\s*)?[[(]/)) {
          return (
            <span key={i} style={{ color: '#9ca3af', fontSize: '0.85em', fontWeight: 'normal' }}>
              {part}
            </span>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </span>
  );
}

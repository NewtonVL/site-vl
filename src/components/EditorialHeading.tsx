import React from 'react';

interface EditorialHeadingProps {
  overline: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const EditorialHeading: React.FC<EditorialHeadingProps> = ({
  overline,
  title,
  subtitle,
  align = 'left',
  className = '',
}) => {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-3xl ${alignment} ${className}`}>
      <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 block mb-3">
        {overline}
      </span>
      <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-[1.18] [text-wrap:balance] mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal [text-wrap:pretty]">
          {subtitle}
        </p>
      )}
    </div>
  );
};

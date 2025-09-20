import type { ReactNode } from 'react';
import React from 'react';

export function NumberedList({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <ul className={`list-none pl-0 text-[13px] md:text-[14px] leading-relaxed text-[--color-foreground] ${className}`}>
      {children}
    </ul>
  );
}

export function NumberedItem({
  num,
  title,
  children,
  className = '',
  Icon,
}: {
  num: string;
  title?: string;
  children?: ReactNode;
  className?: string;
  Icon?: React.ComponentType<{ className?: string }>;
}) {
  // Hilfsfunktion: Macht den Teil vor dem ersten ':' fett, wenn 'title' nicht übergeben wurde
  const renderWithBoldPrefix = (node: ReactNode) => {
    if (title) return <>{children}</>; // Titel übernimmt bereits das Bold-Label
    // Direkter String
    if (typeof node === 'string') {
      const idx = node.indexOf(':');
      if (idx > 0) {
        const left = node.slice(0, idx);
        const right = node.slice(idx + 1);
        return (
          <>
            <strong>{left}:</strong>
            {right}
          </>
        );
      }
      return <>{node}</>;
    }
    // Einfache Elemente mit String-Children (z. B. <span>"Label: Text"</span>)
    if (React.isValidElement(node)) {
      const el = node as React.ReactElement<{ children?: React.ReactNode }>;
      const child = el.props?.children;
      if (typeof child === 'string') {
        const idx = child.indexOf(':');
        if (idx > 0) {
          const left = child.slice(0, idx);
          const right = child.slice(idx + 1);
          return React.cloneElement(el, el.props, (
            <>
              <strong>{left}:</strong>
              {right}
            </>
          ));
        }
      }
    }
    // Fallback: unverändert rendern
    return <>{node}</>;
  };

  return (
    <li className={`flex items-start gap-3 mb-1.5 md:mb-2 ${className}`}>
      <span className="chapter-num font-medium text-[14px] md:text-[15px] shrink-0 w-[48px] md:w-[56px] text-right [font-variant-numeric:tabular-nums] [font-feature-settings:'tnum']">{num}</span>
      <span className="inline-flex items-start gap-2 flex-1 min-w-0">
        {Icon ? <Icon className="mt-[1px] h-4 w-4 text-[--color-foreground]" /> : null}
        <span className="min-w-0">
          {title ? <strong className="text-[14px] md:text-[15px]">{title}</strong> : null}
          {renderWithBoldPrefix(children)}
        </span>
      </span>
    </li>
  );
}

export default NumberedList;

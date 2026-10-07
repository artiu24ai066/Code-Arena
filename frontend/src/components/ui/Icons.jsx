import React from "react";

function SvgWrapper({ children, size = 16, className = "", ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const AlertTriangle = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94A2 2 0 0 0 22.18 18L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </SvgWrapper>
);

export const BookOpen = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <path d="M2 7a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v12" />
    <path d="M22 7a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v12" />
  </SvgWrapper>
);

export const Boxes = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </SvgWrapper>
);

export const CheckCircle2 = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </SvgWrapper>
);

export const Code2 = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </SvgWrapper>
);

export const Copy = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </SvgWrapper>
);

export const Eye = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </SvgWrapper>
);

export const FileText = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </SvgWrapper>
);

export const ListChecks = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <polyline points="9 11 11 13 15 9" />
    <line x1="21" y1="6" x2="7" y2="6" />
    <line x1="21" y1="12" x2="7" y2="12" />
    <line x1="21" y1="18" x2="7" y2="18" />
  </SvgWrapper>
);

export const Pencil = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </SvgWrapper>
);

export const Plus = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </SvgWrapper>
);

export const Save = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
  </SvgWrapper>
);

export const ShieldCheck = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
    <polyline points="9 12 11 14 15 10" />
  </SvgWrapper>
);

export const Send = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </SvgWrapper>
);

export const Sparkles = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14 10.5 9.5 6 8l4.5-1.5L12 2z" />
    <circle cx="5" cy="19" r="2" />
  </SvgWrapper>
);

export const Tag = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <path d="M20.59 13.41L11 3.83a2 2 0 0 0-2.83 0L3.41 9.59a2 2 0 0 0 0 2.83l9.59 9.59a2 2 0 0 0 2.83 0l4.76-4.76a2 2 0 0 0 0-2.83z" />
    <circle cx="7.5" cy="7.5" r="1.5" />
  </SvgWrapper>
);

export const Trash2 = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </SvgWrapper>
);

export const Zap = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </SvgWrapper>
);

export const X = ({ size, className, ...rest }) => (
  <SvgWrapper size={size} className={className} {...rest}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </SvgWrapper>
);

export default SvgWrapper;

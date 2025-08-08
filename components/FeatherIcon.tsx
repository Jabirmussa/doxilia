import feather from 'feather-icons';
import { useEffect, useRef } from 'react';

type FeatherIconProps = {
  name: keyof typeof feather.icons;
  className?: string;
};

const FeatherIcon = ({ name, className }: FeatherIconProps) => {
  const iconRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (iconRef.current) {
      iconRef.current.innerHTML = feather.icons[name].toSvg({ class: className });
    }
  }, [name, className]);

  return <span ref={iconRef} />;
};

export default FeatherIcon;

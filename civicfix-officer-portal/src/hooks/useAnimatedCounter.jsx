import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function useAnimatedCounter(value, duration = 0.8) {
  const nodeRef = useRef(null);
  const countObj = useRef({ val: 0 });

  useEffect(() => {
    if (!nodeRef.current) return;

    gsap.to(countObj.current, {
      val: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (nodeRef.current) {
          nodeRef.current.textContent = Math.round(countObj.current.val);
        }
      },
    });
  }, [value, duration]);

  return nodeRef;
}
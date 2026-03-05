import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGsapAnimation(animationFn, deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      animationFn(ref.current, gsap, ScrollTrigger);
    }, ref);
    return () => ctx.revert();
  }, deps);

  return ref;
}

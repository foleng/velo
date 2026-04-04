import React from 'react';
import { useRouter } from './router-context';

export default function Link({ href, children, ...props }) {
  const { navigate } = useRouter();
  const handleClick = (e) => {
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      navigate(href);
    }
  };
  return <a href={href} onClick={handleClick} {...props}>{children}</a>;
}
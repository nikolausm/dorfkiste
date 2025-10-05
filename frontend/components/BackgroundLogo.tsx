'use client';

import Image from 'next/image';

export default function BackgroundLogo() {
  return (
    <div className="fixed top-20 right-4 opacity-10 pointer-events-none z-0">
      {/* Dark mode logo */}
      <Image
        src="/dorfkiste-logo.png"
        alt="Dorfkiste Logo"
        width={400}
        height={400}
        className="object-contain hidden dark:block"
        priority
      />
      {/* Light mode logo */}
      <Image
        src="/dorfkiste-logo-bright.png"
        alt="Dorfkiste Logo"
        width={400}
        height={400}
        className="object-contain block dark:hidden"
        priority
      />
    </div>
  );
}

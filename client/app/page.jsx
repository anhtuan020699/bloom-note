'use client';

import { Suspense } from 'react';
import Shop from '../src/views/Shop.jsx';

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <Shop />
    </Suspense>
  );
}

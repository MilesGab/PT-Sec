'use client'
import React from 'react';
import styles from './page.module.css'
import { useRouter } from 'next/navigation';

export default function Home() {

  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push('/login');
    }, 100); // Set a delay of 2 seconds before redirecting

    return () => {
      clearTimeout(redirectTimer);
    };
  }, []);

  React.useEffect(() => {
    if (router.pathname !== '/login') {
      setIsLoading(false);
    }
  }, [router.pathname]);

  return (
    <main className={styles.main}>
    </main>
  )
}

'use client'
import { getNavLinks } from '@/app/api/navlink'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'
import NavLink from './Navigation/NavLink'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useSession, signOut } from "next-auth/react";
import { useRole } from '@/hooks/useRole';

type Notification = {
  _id: string;
  userId: string;
  type: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
};

const Header: React.FC = () => {
  const [sticky, setSticky] = useState(false)
  const [navbarOpen, setNavbarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const { data: session, status } = useSession();
  const { userRole, isLoading } = useRole();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  // Get navigation links based on user role
  const navLinks = getNavLinks(userRole);

  // Mark notification as read
  const handleMarkRead = async (notifId: string) => {
    try {
      await fetch(`http://localhost:3001/notifications/read/${notifId}`, { method: 'PATCH' });
      setNotifications((prev) => prev.map(n => n._id === notifId ? { ...n, read: true } : n));
    } catch {}
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`http://localhost:3001/notifications/${session.user.id}`)
      .then(res => res.json())
      .then(data => setNotifications(data.notifications || []));
  }, [session?.user?.id]);

  const sideMenuRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (sideMenuRef.current && !sideMenuRef.current.contains(event.target as Node)) {
      setNavbarOpen(false)
    }
  }

  const handleScroll = useCallback(() => {
    setSticky(window.scrollY >= 50)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [handleScroll])

  const isHomepage = pathname === '/'

  return (
    <header className={`fixed h-24 py-1 z-50 w-full bg-transparent transition-all duration-300 lg:px-0 px-4 ${sticky ? "top-3" : "top-0"}`}>
      <nav className={`container mx-auto max-w-8xl flex items-center justify-between py-4 duration-300 ${sticky ? "shadow-lg bg-white dark:bg-dark rounded-full top-5 px-4 " : "shadow-none top-0"}`}>
        <div className='flex justify-between items-center gap-2 w-full'>
          <div>
            <Link href='/'>
              <Image
                src={'/images/header/dark-logo.svg'}
                alt='logo'
                width={150}
                height={68}
                unoptimized={true}
                className={`${isHomepage ? sticky ? "block dark:hidden" : "hidden" : sticky ? "block dark:hidden" : "block dark:hidden"}`}
              />
              <Image
                src={'/images/header/logo.svg'}
                alt='logo'
                width={150}
                height={68}
                unoptimized={true}
                className={`${isHomepage ? sticky ? "hidden dark:block" : "block" : sticky ? "dark:block hidden" : "dark:block hidden"}`}
              />
            </Link>
          </div>
          <div className='flex items-center gap-2 sm:gap-6'>
            <button
              className='hover:cursor-pointer'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Icon
                icon={'solar:sun-bold'}
                width={32}
                height={32}
                className={`dark:hidden block ${isHomepage
                  ? sticky
                    ? 'text-dark'
                    : 'text-white'
                  : 'text-dark'
                  }`}
              />
              <Icon
                icon={'solar:moon-bold'}
                width={32}
                height={32}
                className='dark:block hidden text-white'
              />
            </button>
            {/* Notification Bell Icon */}
            <div className="relative">
              <button
                className="relative"
                onClick={() => setNotifOpen((open) => !open)}
                aria-label="Show notifications"
              >
                <Icon icon="ph:bell" width={28} height={28} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {/* Notification Dropdown */}
              {notifOpen && (
                <ul className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark shadow-lg rounded-lg z-50 max-h-96 overflow-auto">
                  {notifications.length === 0 ? (
                    <li className="p-4 text-center text-gray-500">No notifications</li>
                  ) : (
                    notifications.map((notif) => (
                      <li
                        key={notif._id}
                        onClick={() => handleMarkRead(notif._id)}
                        className={`p-4 flex flex-col gap-1 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${!notif.read ? "font-bold" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">[{notif.type}]</span>
                          {!notif.read && <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>}
                        </div>
                        <span>{notif.message}</span>
                        <span className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString()}</span>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
            <div className={`hidden md:block`}>
              <Link href='#' className={`text-base text-inherit flex items-center gap-2 border-r pr-6 ${isHomepage
                ? sticky
                  ? 'text-dark dark:text-white hover:text-primary border-dark dark:border-white'
                  : 'text-white hover:text-primary'
                : 'text-dark hover:text-primary'
                }`}
              >
                <Icon icon={'ph:phone-bold'} width={24} height={24} />
                +1-212-456-789
              </Link>
            </div>
            <div>
              <button
                onClick={() => setNavbarOpen(!navbarOpen)}
                className={`flex items-center gap-3 p-2 sm:px-5 sm:py-3 rounded-full font-semibold hover:cursor-pointer border ${isHomepage
                  ? sticky
                    ? 'text-white bg-dark dark:bg-white dark:text-dark dark:hover:text-white dark:hover:bg-dark hover:text-dark hover:bg-white border-dark dark:border-white'
                    : 'text-dark bg-white dark:text-dark hover:bg-transparent hover:text-white border-white'
                  : 'bg-dark text-white hover:bg-transparent hover:text-dark dark:bg-white dark:text-dark dark:hover:bg-transparent dark:hover:text-white duration-300'
                  }`}
                aria-label='Toggle mobile menu'>
                <span>
                  <Icon icon={'ph:list'} width={24} height={24} />
                </span>
                <span className='hidden sm:block'>Menu</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {
        navbarOpen && (
          <div className='fixed top-0 left-0 w-full h-full bg-black/50 z-40' />
        )
      }

      <div
        ref={sideMenuRef}
        className={`fixed top-0 right-0 h-full w-full bg-dark shadow-lg transition-transform duration-300 max-w-2xl ${navbarOpen ? 'translate-x-0' : 'translate-x-full'} z-50 px-20 overflow-auto no-scrollbar`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="">
            <div className='flex items-center justify-start py-10'>
              <button
                onClick={() => setNavbarOpen(false)}
                aria-label='Close mobile menu'
                className='bg-white p-3 rounded-full hover:cursor-pointer'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'>
                  <path
                    fill='none'
                    stroke='black'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
            <nav className='flex flex-col items-start gap-4'>
              <ul className='w-full'>
                {navLinks.map((item, index) => (
                  <NavLink key={index} item={item} onClick={() => setNavbarOpen(false)} />
                ))}
                {session ? (
                  <li className='flex flex-col gap-2 items-start mt-3'>
                    <span className='text-white'>Hi, {session.user?.name}</span>
                    <span className='text-white/60 text-sm'>
                      Role: {isLoading ? 'Loading...' : userRole}
                    </span>
                    <button
                      onClick={() => signOut({ callbackUrl: "/signin" })}
                      className='py-2 px-6 bg-primary text-base text-white rounded-full border border-primary font-semibold hover:bg-transparent hover:text-primary duration-300'>
                      Logout
                    </button>
                  </li>
                ) : (
                  <li className='flex items-center gap-4'>
                    <Link href="/signin" className='py-4 px-8 bg-primary text-base leading-4 block w-fit text-white rounded-full border border-primary font-semibold mt-3 hover:bg-transparent hover:text-primary duration-300'>
                      Sign In
                    </Link>
                    <Link href="/signup" className='py-4 px-8 bg-transparent border border-primary text-base leading-4 block w-fit text-primary rounded-full font-semibold mt-3 hover:bg-primary hover:text-white duration-300'>
                      Sign up
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>

          <div className='flex flex-col gap-1 my-16 text-white'>
            <p className='text-base sm:text-xm font-normal text-white/40'>
              Contact
            </p>
            <Link href="#" className='text-base sm:text-xm font-medium text-inherit hover:text-primary'>
              hello@homely.com
            </Link>
            <Link href="#" className='text-base sm:text-xm font-medium text-inherit hover:text-primary'>
              +1-212-456-7890{' '}
            </Link>
          </div>
        </div>
      </div>
    </header >
  )
}

export default Header

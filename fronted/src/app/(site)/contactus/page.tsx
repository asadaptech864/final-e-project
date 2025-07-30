"use client"
import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function ContactUs() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email || !formData.message) {
      setErrorMessage('Please fill in all fields');
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:3001/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: session?.user?.id || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Message sent successfully! We will get back to you soon.');
        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({
          name: '',
          phone: '',
          email: '',
          message: ''
        });
      } else {
        setErrorMessage(data.message || 'Failed to send message');
        toast.error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setErrorMessage('Failed to send message. Please try again.');
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='container max-w-8xl mx-auto px-5 2xl:px-0 pt-32 md:pt-44 pb-14 md:pb-28'>
      <div className='mb-16'>
        <div className='flex gap-2.5 items-center justify-center mb-3'>
          <span>
            <Icon
              icon={'ph:house-simple-fill'}
              width={20}
              height={20}
              className='text-primary'
            />
          </span>
          <p className='text-base font-semibold text-badge dark:text-white/90'>
            Contact us
          </p>
        </div>
        <div className='text-center'>
          <h3 className='text-4xl sm:text-52 font-medium tracking-tighter text-black dark:text-white mb-3 leading-10 sm:leading-14'>
            Have questions? ready to help!
          </h3>
          <p className='text-xm font-normal tracking-tight text-black/50 dark:text-white/50 leading-6'>
            Looking for your dream home or ready to sell? Our expert team offers
            personalized guidance and market expertise tailored to you.
          </p>
        </div>
      </div>
      {/* form */}
      <div className='border border-black/10 dark:border-white/10 rounded-2xl p-4 shadow-xl dark:shadow-white/10'>
        <div className='flex flex-col lg:flex-row lg:items-center gap-12'>
          <div className='relative w-fit'>
            <Image
              src={'/images/contactUs/contactUs.jpg'}
              alt='wall'
              width={497}
              height={535}
              className='rounded-2xl brightness-50 h-full'
              unoptimized={true}
            />
            <div className='absolute top-6 left-6 lg:top-12 lg:left-12 flex flex-col gap-2'>
              <h5 className='text-xl xs:text-2xl mobile:text-3xl font-medium tracking-tight text-white'>
                Contact information
              </h5>
              <p className='text-sm xs:text-base mobile:text-xm font-normal text-white/80'>
                Ready to find your dream home or sell your property? We’re here
                to help!
              </p>
            </div>
            <div className='absolute bottom-6 left-6 lg:bottom-12 lg:left-12 flex flex-col gap-4 text-white'>
              <Link href={'/'} className='w-fit'>
                <div className='flex items-center gap-4 group w-fit'>
                  <Icon icon={'ph:phone'} width={32} height={32} />
                  <p className='text-sm xs:text-base mobile:text-xm font-normal group-hover:text-primary'>
                    +1 0239 0310 1122
                  </p>
                </div>
              </Link>
              <Link href={'/'} className='w-fit'>
                <div className='flex items-center gap-4 group w-fit'>
                  <Icon icon={'ph:envelope-simple'} width={32} height={32} />
                  <p className='text-sm xs:text-base mobile:text-xm font-normal group-hover:text-primary'>
                    support@gleamer.com
                  </p>
                </div>
              </Link>
              <div className='flex items-center gap-4'>
                <Icon icon={'ph:map-pin'} width={32} height={32} />
                <p className='text-sm xs:text-base mobile:text-xm font-normal'>
                  Blane Street, Manchester
                </p>
              </div>
            </div>
          </div>
          <div className='flex-1/2'>
            {/* Success and Error Messages */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {successMessage}
                </div>
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errorMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className='flex flex-col gap-8'>
                <div className='flex flex-col lg:flex-row gap-6'>
                  <input
                    type='text'
                    name='name'
                    id='name'
                    autoComplete='name'
                    placeholder='Name*'
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full'
                  />
                  <input
                    type='tel'
                    name='phone'
                    id='phone'
                    autoComplete='tel'
                    placeholder='Phone number*'
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline w-full'
                  />
                </div>
                <input
                  type='email'
                  name='email'
                  id='email'
                  autoComplete='email'
                  placeholder='Email address*'
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-full outline-primary focus:outline'
                />
                <textarea
                  rows={8}
                  cols={50}
                  name='message'
                  id='message'
                  placeholder='Write here your message'
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  className='px-6 py-3.5 border border-black/10 dark:border-white/10 rounded-2xl outline-primary focus:outline'></textarea>
                <button 
                  type='submit'
                  disabled={isSubmitting}
                  className='px-8 py-4 rounded-full bg-primary text-white text-base font-semibold w-full mobile:w-fit hover:cursor-pointer hover:bg-dark duration-300 disabled:opacity-50 disabled:cursor-not-allowed'>
                  {isSubmitting ? 'Sending...' : 'Send message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

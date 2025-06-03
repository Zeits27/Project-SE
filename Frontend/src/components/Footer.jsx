import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa'

const Footer = () => {
    return (
        <footer className='bg-white text-blue-800 py-6 mt-10'>
            <div className='container mx-auto px-4 flex flex-col md:flex-row justify-center'>
                
                {/* copyright */}
                <div className='mb-4 md:mb-0'>
                    <p className='text-sm'>
                        Copyright &copy; {new Date().getFullYear()}. Designed By Us.
                    </p>
                </div>

                {/* Nav Links  */}
                <div className='flex space-x-4'>
                    <Link href='/home' className='hover:underline'>Home</Link>
                    <Link href='/classes' className='hover:underline'>Classes</Link>
                    <Link href='/libraries' className='hover:underline'>Libraries</Link>
                    <Link href='/community' className='hover:underline'>Community</Link>
                    <Link href='/liveclasses' className='hover:underline'>Live Classes</Link>
                </div>

                {/* social media  */}
                <div className='flex space-x-4 text-lg'>
                    <a href='https://github.com/Zeits27/Project-SE' target='_blank' rel='noopener noreferrrer' className='hover:text-gray-400 hover:scale-110 transition-transform duration-200'>
                        <FaGithub />
                    </a>
                    
                    <a href='https://x.com/jokowi' target='_blank' rel='noopener noreferrrer' className='hover:text-gray-400 hover:scale-110 transition-transform duration-200'>
                        <FaTwitter />
                    </a>

                    <a href='https://www.instagram.com/nick.2.7?igsh=bzEycGQzZWNtcW8y' target='_blank' rel='noopener noreferrrer' className='hover:text-gray-400 hover:scale-110 transition-transform duration-200'>
                        <FaInstagram />
                    </a>

                    <a href='https://www.facebook.com/?locale=id_ID' target='_blank' rel='noopener noreferrrer' className='hover:text-gray-400 hover:scale-110 transition-transform duration-200'>
                        <FaFacebook />
                    </a>
                </div>
            </div>
        </footer>
    )
}

export default Footer;
import React from 'react';
import SideBar from '../../components/Cover/Sidebar';
import Book from '../../components/Cover/Designer';

export default function DesignCanvas() {
    return (
        <div className='w-full bg-transparent  h-screen  flex'>
            <SideBar/>
            <Book/>
        </div>
    )
}
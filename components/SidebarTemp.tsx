/* eslint-disable @next/next/no-img-element */
"use client";
import Link from 'next/link';
import React, { useState } from 'react';

interface SidebarProps {
  role: 'admin' | 'client' | 'accountant';
  onSelect: (screen: string) => void;
}

interface LinkItem {
  label: string;
  screen: string;
  img: string;
  submenu?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ role, onSelect }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  const commonLinks: LinkItem[] = [
    { label: 'Dashboard', screen: 'dashboard', img: '/bell.png' },
    { label: 'Documents', screen: 'documents', img: '/columns.png' },
    { 
      label: 'Account', 
      screen: 'account', 
      img: '/user.png',
      submenu: ['Settings', 'Logout'],
    },
  ];

  const adminLinks: LinkItem[] = [
    {
      label: 'Clients',
      screen: 'clients',
      img: '/user.png',
      submenu: ['All clients', 'Add client'],
    },
    {
      label: 'Accountants',
      screen: 'accountants',
      img: '/columns.png',
      submenu: ['All accountants', 'Add accountant'],
    },
    {
      label: 'Tasks',
      screen: 'tasks',
      img: '/calendar.png',
      submenu: ['All tasks', 'Add tasks'],
    },
  ];

  const clientLinks: LinkItem[] = [
  ];

  const accountantLinks: LinkItem[] = [
    {
      label: 'Clients',
      screen: 'clients',
      img: '/user.png',
      submenu: ['All clients', 'Add client'],
    },
    {
      label: 'Tasks',
      screen: 'tasks',
      img: '/calendar.png',
      submenu: ['All tasks', 'Add tasks'],
    },
  ];

  let roleLinks: LinkItem[] = [];
  if (role === 'admin') roleLinks = adminLinks;
  if (role === 'client') roleLinks = clientLinks;
  if (role === 'accountant') roleLinks = accountantLinks;

  return (
    <aside className="sidebar">
      <div className="logo-sidebar">
        <img src="/logo.png" alt="logo" />
      </div>
      <nav className="menu-items">
        {[...commonLinks, ...roleLinks].map((link, i) => (
          <div
            key={i}
            className="menu-link-wrapper"
            onMouseEnter={() => setHovered(link.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <button
              onClick={() => onSelect(link.screen)}
              className="menu-link"
            >
              <img src={link.img} alt="menu-icon" />
              <div className="link-title">
                <span>{link.label}</span>
                <div className="notification">
                  <span>2</span>
                </div>
              </div>
            </button>

            {hovered === link.label && link.submenu && (
              <div className="submenu">
                {link.submenu.map((item, idx) => {
                  const screenId = item.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <div
                      key={idx}
                      className="submenu-item"
                      onClick={() => onSelect(screenId)}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        <Link href="" className="menu-close">
          <img src="/arrow-left-circle.png" alt="icon" />
          Close menu
        </Link>
      </nav>
      <button className="menu-btn">
        <img src="/whatsapp.png" alt="icon" />
        Whatsapp-nos
      </button>
    </aside>
  );
};

export default Sidebar;
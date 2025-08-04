/* eslint-disable @next/next/no-img-element */
"use client";
import Link from 'next/link';
import React, { useState , useEffect} from 'react';

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
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [viewedSections, setViewedSections] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
      if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            console.log("✅ Permissão de notificação concedida!");
          } else {
            console.log("❌ Permissão de notificação negada.");
          }
        });
      }
    }, [])
  useEffect(() => {
    let lastCount = 0;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications', {
          headers: {
            'x-user-id': localStorage.getItem("user_id") ?? ""
          }
        });

        const data = await res.json();
        const newCount = data.count ?? 0;

        if (newCount > lastCount && Notification.permission === "granted") {
          new Notification("📥 Nova notificação", {
            body: data.notifications[0]?.message ?? "Você recebeu uma nova notificação",
            icon: "/logo.png",
          });
        }

        lastCount = newCount;
        setNotificationCount(newCount);
      } catch (err) {
        console.error("Erro ao buscar notificações", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-is-open", menuOpen);
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };


  const handleLinkClick = async (screen: string, label: string) => {
    onSelect(screen);

    if (!viewedSections.includes(label)) {
      setViewedSections(prev => [...prev, label]);

      try {
        const res = await fetch('/api/notifications', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: localStorage.getItem("user_id") ?? "",
            section: label.toLowerCase(),
          }),
        });

        const result = await res.json();
        console.log(`${result.updatedCount} notificações marcadas como lidas na seção ${label}.`);
        
        setNotificationCount((prevCount) => Math.max(prevCount - result.updatedCount, 0));
      } catch (err) {
        console.error("Erro ao marcar notificações como lidas", err);
      }
    }
  };


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
      <div className={`humburguer-menu ${menuOpen ? "active" : ""}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>

        {notificationCount > 0 && (
          <div className="notification">
            <span>{notificationCount}</span>
          </div>
        )}
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
              onClick={() => handleLinkClick(link.screen, link.label)}
              className="menu-link"
            >
              <img src={link.img} alt="menu-icon" />
              <div className="link-title">
                <span>{link.label}</span>
                {(link.label === "Tasks" || link.label === "Documents" || link.label === "Dashboard") &&
                  notificationCount > 0 &&
                  !viewedSections.includes(link.label) && (
                    <div className="notification">
                      <span>{notificationCount}</span>
                    </div>
                  )}
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
        <Link
          href="#"
          className="menu-close"
          onClick={(e) => {
            e.preventDefault();
            toggleMenu();
          }}
        >
          <img src="/arrow-left-circle.png" alt="icon" />
          <span>Close menu</span>
        </Link>

      </nav>
      <button className="menu-btn">
        <img src="/whatsapp.png" alt="icon" />
        <span>Whatsapp-nos</span>
      </button>
    </aside>
  );
};

export default Sidebar;
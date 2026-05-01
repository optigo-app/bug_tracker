'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Bug,
  Folder,
  LogOut,
  ChevronUp,
  ChevronDown,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider as MuiDivider,
  Tooltip,
  IconButton,
} from '@mui/material';
import { getAvatarColor, getInitials } from '@/utils/glocalfunc';

const menuItems = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', href: '/' },
  { icon: <Folder size={20} />, label: 'Tasks', href: '/tasks' },
  { icon: <Bug size={20} />, label: 'Issues', href: '/bugs' },
  { icon: <BarChart3 size={20} />, label: 'Reports', href: '/reports' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [currentUser, setCurrentUser] = useState(null);
  const [logoHovered, setLogoHovered] = useState(false);

  useEffect(() => {
    // Get user profile from sessionStorage
    const userProfileData = sessionStorage.getItem('UserProfileData');
    if (userProfileData) {
      try {
        const profile = JSON.parse(userProfileData);
        setCurrentUser({
          id: profile.id,
          name: `${profile.firstname} ${profile.lastname}`.trim() || profile.id,
          role: profile.designation || 'User',
          email: profile.userid,
          photo: profile.empphoto
        });
      } catch (error) {
        console.error('Error parsing UserProfileData:', error);
        setCurrentUser(null);
      }
    }
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    // Clear all session data
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    sessionStorage.clear();
    
    // Redirect to auto-login page
    router.push('/auto-login');
    router.refresh();
  };

  return (
    <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}>
      {/* ── Header ─────────────────────────────────────── */}
      <Box
        sx={{
          px: collapsed ? 0 : 1,
          mb: 4,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: collapsed ? 'center' : 'space-between',
          transition: 'padding 0.3s',
        }}
      >
        {/* Logo icon — in collapsed mode it is the click target to maximize */}
        <Tooltip
          title={collapsed ? 'Expand sidebar' : ''}
          placement="right"
          arrow
        >
          <Box
            onClick={collapsed ? onToggle : undefined}
            onMouseEnter={() => collapsed && setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: collapsed ? 0 : 1.5,
              overflow: 'hidden',
              cursor: collapsed ? 'pointer' : 'default',
            }}
          >
            {/* Bug icon box — grows on hover in collapsed mode */}
            <Box
              sx={{
                width: 28,
                height: 28,
                bgcolor: 'primary.main',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}
            >
              <Bug size={16} />
            </Box>

            {/* Brand text — hidden when collapsed */}
            <Box
              sx={{
                overflow: 'hidden',
                maxWidth: collapsed ? 0 : 140,
                opacity: collapsed ? 0 : 1,
                transition: 'max-width 0.3s ease, opacity 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.2, letterSpacing: '-0.02em', mt: 0.2 }}>
                BugTrackr
              </Typography>
            </Box>
          </Box>
        </Tooltip>

        {/* Radio-style toggle — visible ONLY when expanded */}
        {!collapsed && (
          <IconButton
            size="small"
            onClick={onToggle}
            sx={{ 
                p: 0.5, 
                borderRadius: '8px', 
                border: '1px solid #F1F5F9',
                color: '#94A3B8',
                '&:hover': { color: '#6366F1', bgcolor: '#F5F7FA' }
            }}
          >
            <PanelLeftClose size={16} />
          </IconButton>
        )}
      </Box>

      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          if (collapsed) {
            return (
              <Tooltip key={item.href} title={item.label} placement="right" arrow>
                <Link
                  href={item.href}
                  className={`nav-item nav-item-collapsed${isActive ? ' active' : ''}`}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                    {item.icon}
                    <Typography
                      sx={{
                        fontSize: '0.58rem',
                        fontWeight: 600,
                        lineHeight: 1,
                        color: 'inherit',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                </Link>
              </Tooltip>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${isActive ? ' active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

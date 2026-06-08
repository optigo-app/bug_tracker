'use client';

import React, { useState, useRef } from 'react';
import {
  LayoutDashboard,
  Bug,
  Folder,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';

const menuItems = [
  { Icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { Icon: Folder, label: 'Tasks', href: '/tasks' },
  { Icon: Bug, label: 'Bug list', href: '/bugs' },
];

export default function Sidebar({ isFullSidebar, onToggleFull }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const collapseTimerRef = useRef(null);

  const isCollapsed = !isFullSidebar && !hoverExpanded;

  const clearCollapseTimer = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  };

  const handleLogoEnter = () => {
    if (!isFullSidebar) {
      clearCollapseTimer();
      setHoverExpanded(true);
    }
  };

  const handleSidebarLeave = () => {
    if (!isFullSidebar) {
      clearCollapseTimer();
      collapseTimerRef.current = setTimeout(() => {
        setHoverExpanded(false);
      }, 200);
    }
  };

  const handleSidebarEnter = () => {
    clearCollapseTimer();
  };

  // Colors from variables.scss
  const checkedColor = '#685dd8';   // $button-Bordercolor
  const uncheckedColor = '#7D7f85'; // $secondaryColor

  return (
    <aside
      className={`sidebar${isCollapsed ? ' sidebar-collapsed' : ''}`}
      onMouseEnter={handleSidebarEnter}
      onMouseLeave={handleSidebarLeave}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <Box
        sx={{
          px: isCollapsed ? 0 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          transition: 'padding 0.3s',
        }}
      >
        {/* Logo icon */}
        <Tooltip title={isCollapsed ? 'Expand sidebar' : ''} placement="right" arrow>
          <Box
            onMouseEnter={handleLogoEnter}
            onClick={() => router.push('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              width: '100%',
              gap: isCollapsed ? 0 : 1.5,
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            {isCollapsed ? (
              <Box
                component="img"
                src="/bgtr_icon.png"
                alt="BugTracker"
                sx={{
                  height: 34,
                  width: 'auto',
                  maxWidth: 160,
                  objectFit: 'contain',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              />
            ) : (
              <Box
                component="img"
                src="/bugTracker_logo.png"
                alt="BugTracker"
                sx={{
                  height: 34,
                  width: 'auto',
                  maxWidth: 160,
                  objectFit: 'contain',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              />
            )}
          </Box>
        </Tooltip>

        {/* Checkbox toggle — visible when expanded (full or hover) */}
        {!isCollapsed && (
          <IconButton
            size="small"
            onClick={onToggleFull}
            sx={{
              p: 0.6,
              color: isFullSidebar ? checkedColor : uncheckedColor,
              '&:hover': { color: checkedColor, bgcolor: '#F5F7FA' },
            }}
          >
            {isFullSidebar ? (
              // Checked: filled purple circle
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: `1.5px solid ${checkedColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: checkedColor }} />
              </Box>
            ) : (
              // Unchecked: empty gray circle
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: `1.5px solid ${uncheckedColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'transparent' }} />
              </Box>
            )}
          </IconButton>
        )}
      </Box>

      <hr className="sidebar-separator" />

      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const iconColor = isActive ? '#fff' : '#7D7f85';

          if (isCollapsed) {
            return (
              <Tooltip key={item.label} title={item.label} placement="right" arrow>
                <Link
                  href={item.href}
                  className="nav-item nav-item-collapsed"
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        bgcolor: isActive ? '#7367f0' : 'transparent',
                        boxShadow: isActive ? '0px 2px 6px rgba(115, 103, 240, 0.3)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <item.Icon size={20} color={iconColor} />
                    </Box>
                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: '0.75rem',
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
              key={item.label}
              href={item.href}
              className={`nav-item${isActive ? ' active' : ''}`}
            >
              <item.Icon size={20} color={iconColor} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

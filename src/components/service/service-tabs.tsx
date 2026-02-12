'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  Columns3,
  ListTodo,
  BookOpen,
  Map,
  Scale,
  FileText,
  Settings,
} from 'lucide-react';

interface ServiceTabsProps {
  serviceId: string;
}

const tabs = [
  { label: 'Overview', icon: LayoutGrid, path: '' },
  { label: 'Board', icon: Columns3, path: '/board' },
  { label: 'Work Items', icon: ListTodo, path: '/work-items' },
  { label: 'Dev Logs', icon: BookOpen, path: '/dev-logs' },
  { label: 'Roadmap', icon: Map, path: '/roadmap' },
  { label: 'Decisions', icon: Scale, path: '/decisions' },
  { label: 'Documents', icon: FileText, path: '/documents' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export function ServiceTabs({ serviceId }: ServiceTabsProps) {
  const pathname = usePathname();
  const basePath = `/services/${serviceId}`;

  return (
    <nav className="border-b border-[hsl(var(--border-default))] overflow-x-auto">
      <div className="flex space-x-6">
        {tabs.map((tab) => {
          const href = `${basePath}${tab.path}`;
          const isActive = tab.path === ''
            ? pathname === basePath
            : pathname.startsWith(href);
          const Icon = tab.icon;

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                isActive
                  ? 'border-[hsl(var(--primary))] text-[hsl(var(--text-primary))]'
                  : 'border-transparent text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-hover))]'
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

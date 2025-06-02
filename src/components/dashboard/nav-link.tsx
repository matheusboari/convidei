import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-purple-100 text-purple-900'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        className,
      )}
      prefetch={true}
    >
      {children}
    </Link>
  );
} 

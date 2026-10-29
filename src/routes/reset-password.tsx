import { createFileRoute } from '@tanstack/react-router';
import { navoscopeHead } from '@/lib/navoscope-head';
export const Route = createFileRoute('/reset-password')({ head: () => navoscopeHead('Reset password · Navoscope'), component: () => null });
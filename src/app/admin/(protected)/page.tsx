import { redirect } from 'next/navigation';

// /admin → dashboard (the protected layout has already verified the admin).
export default function AdminIndex() {
  redirect('/admin/dashboard');
}

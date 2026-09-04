import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-taller-900">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
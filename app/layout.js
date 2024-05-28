import { Banner } from '@/components/uswds/Banner';
import { Header } from '@/components/Header';
import { Identifier } from '@/components/Identifier';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';

import '@/assets/stylesheets/styles.scss';

export const metadata = {
  title: 'cloud.gov Dashboard',
  description: 'Manage cloud.gov organizations, spaces, services, and apps.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="height-full">
      <body className="bg-accent-warm-light height-full">
        <div className="border-bottom border-white">
          <Banner />
        </div>
        <div className="grid-container desktop:height-full desktop:display-flex desktop:overflow-hidden">
          <div className="desktop:grid-col-2">
            <Sidebar />
          </div>
          <div className="desktop:grid-col-10 bg-white height-full flex-column display-flex">
            <Header />
            <main className="padding-4 overflow-y-auto grow">{children}</main>
          </div>
        </div>
        <Footer />
        <Identifier />
      </body>
    </html>
  );
}

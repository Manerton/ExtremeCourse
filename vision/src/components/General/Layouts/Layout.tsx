import React from 'react';
import { Container } from 'react-bootstrap';
import Header from './header';
import Footer from './footer';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <>
      <Header />
      <div className="d-flex flex-column min-vh-100">
        <Container fluid="lg" className="flex-grow-1">
          <main className="py-4">
            <Outlet />
          </main>
        </Container>
        <Footer />
      </div>
    </>
  );
};

export default Layout;

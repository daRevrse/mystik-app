import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/client/Home';
import Product from './pages/client/Product';
import Checkout from './pages/client/Checkout';
import Success from './pages/client/Success';
import About from './pages/client/About';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import Settings from './pages/admin/Settings';
import Caisse from './pages/admin/Caisse';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AdminLayout from './components/common/AdminLayout';
import Login from './pages/admin/Login';
import ScrollToTop from './components/common/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Routes>
          {/* Routes Client */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/product/:id" element={<Product />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/success" element={<Success />} />
                  </Routes>
                </main>
                <Footer />
              </>
            }
          />

          {/* Routes Admin */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="caisse" element={<Caisse />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;

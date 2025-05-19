import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Pay from './pages/pay';
import CheckStatus from './pages/check';
import AdminPage from './pages/admin';
import Layout from './components/Layout';
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from './pages/PaymentFailed';



const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pay" element={<Pay />} />
          <Route path="/check" element={<CheckStatus />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />

        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
// This code sets up the main application component using React Router.
// It defines routes for the home page, payment page, status check page, and admin page.
// The `Layout` component wraps around the routes to provide a consistent layout across all pages.
// The `BrowserRouter` is used to enable routing in the application, and the `Routes` and `Route` components define the different paths and their corresponding components.
// The `App` component is exported as the default export, making it the entry point for the application.
// The `Layout` component is imported from the `components` directory, and the individual page components are imported from the `pages` directory.
// The `Home`, `Pay`, `CheckStatus`, and `AdminPage` components are imported from their respective files.
// The `App` component is wrapped in a `Router` to enable routing functionality.
// The `Routes` component contains multiple `Route` components, each defining a path and the corresponding component to render.
// The `path` prop specifies the URL path, and the `element` prop specifies the component to render when that path is matched.
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PaymentFailed = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const reference = params.get('reference');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700 px-4">
      <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
      <p className="mb-2">Unfortunately, your payment did not go through.</p>
      {reference && <p className="mb-4">Reference: <span className="font-mono">{reference}</span></p>}
      <div className="flex gap-4">
        <Link to="/pay" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
          Try Again
        </Link>
        <Link to="/" className="text-red-600 underline hover:text-red-800">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailed;

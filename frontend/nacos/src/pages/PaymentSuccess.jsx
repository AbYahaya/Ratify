import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [receiptUrl, setReceiptUrl] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    const url = searchParams.get('receipt_url');
    const ref = searchParams.get('reference');

    if (url && ref) {
      setReceiptUrl(url);
      setReference(ref);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gray-50">
      <h1 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h1>
      <p className="text-gray-700 text-center mb-2">Your payment was successful and has been confirmed.</p>
      <p className="text-sm text-gray-600 mb-4">Reference: <strong>{reference}</strong></p>

      {receiptUrl && (
        <a
          href={receiptUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          View Receipt (PDF)
        </a>
      )}
    </div>
  );
};

export default PaymentSuccess;
// This code defines a React component that displays a success message after a payment is made.
// It uses the `useSearchParams` hook from `react-router-dom` to extract the `receipt_url` and `reference` from the URL query parameters.
// The component displays a success message, the payment reference, and a button to view the receipt in PDF format.
// The button opens the receipt URL in a new tab when clicked. The component is styled using Tailwind CSS classes for a modern and responsive design.
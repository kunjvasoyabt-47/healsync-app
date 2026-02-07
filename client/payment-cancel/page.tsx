import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">❌ Payment Cancelled</h1>
      <p className="text-lg text-gray-600 mb-8">
        The payment process was not completed. Your appointment is still pending.
      </p>
      <Link 
        href="/patient" 
        className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
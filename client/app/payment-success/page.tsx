import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold text-green-600 mb-4">✔️ Payment Successful!</h1>
      <p className="text-lg text-gray-600 mb-8">
        Thank you. Your appointment has been confirmed and the doctor has been notified.
      </p>
      <Link 
        href="/appointments" 
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
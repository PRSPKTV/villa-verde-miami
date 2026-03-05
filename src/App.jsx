import { RouterProvider } from 'react-router-dom';
import { BookingProvider } from '@/context/BookingContext';
import { router } from '@/router';

function App() {
  return (
    <BookingProvider>
      <RouterProvider router={router} />
    </BookingProvider>
  );
}

export default App;

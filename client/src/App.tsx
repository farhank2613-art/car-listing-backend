import { HashRouter, Route, Routes } from 'react-router-dom';
import { FavoritesProvider, useFavorites } from './hooks/useFavorites';
import { CompareProvider, useCompare } from './hooks/useCompare';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CompareStrip from './components/CompareStrip';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import ComparePage from './pages/ComparePage';
import FavoritesPage from './pages/FavoritesPage';
import AddListingPage from './pages/AddListingPage';
import EditListingPage from './pages/EditListingPage';
import MyListingsPage from './pages/MyListingsPage';

function Layout() {
  const { count: favoriteCount } = useFavorites();
  const { count: compareCount } = useCompare();

  return (
    <>
      <Navbar favoriteCount={favoriteCount} compareCount={compareCount} />
      <main style={{ minHeight: '60vh' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/listings/:id/edit" element={<EditListingPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/sell" element={<AddListingPage />} />
          <Route path="/my-listings" element={<MyListingsPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <CompareStrip />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <FavoritesProvider>
      <CompareProvider>
        <HashRouter>
          <Layout />
        </HashRouter>
      </CompareProvider>
    </FavoritesProvider>
  );
}

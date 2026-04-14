/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, ShoppingCart, User, LogIn, LogOut, Filter, ChevronRight } from 'lucide-react';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Book } from './types';
import { seedDatabase } from './db/seed';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const booksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
      setBooks(booksData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'books');
    });

    return () => unsubscribe();
  }, [isAuthReady]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Semua', 'Fiction', 'History', 'Self-Help', 'Business', 'Technology'];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-warm-bg/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="text-olive w-8 h-8" />
          <span className="text-2xl font-semibold tracking-tight text-olive">Libby</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-sans uppercase tracking-widest text-gray-600">
          <a href="#" className="hover:text-olive transition-colors">Katalog</a>
          <a href="#" className="hover:text-olive transition-colors">Populer</a>
          <a href="#" className="hover:text-olive transition-colors">Tentang Kami</a>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-olive" referrerPolicy="no-referrer" />
              <button onClick={handleLogout} className="text-gray-600 hover:text-olive transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogin} className="flex items-center gap-2 bg-olive text-white px-4 py-2 rounded-full text-sm font-sans font-medium hover:opacity-90 transition-opacity">
              <LogIn className="w-4 h-4" />
              Masuk
            </button>
          )}
          <button className="relative p-2 text-gray-600 hover:text-olive transition-colors">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute top-0 right-0 bg-olive text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="px-6 py-20 md:py-32 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-medium leading-tight mb-6">
              Jendela Dunia di <br />
              <span className="italic text-olive">Genggaman Anda.</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 font-sans">
              Temukan ribuan koleksi ebook terbaik dari penulis lokal dan internasional. 
              Baca kapan saja, di mana saja.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Cari judul buku atau penulis..." 
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-white border border-gray-200 focus:outline-none focus:border-olive font-sans"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="w-full md:w-auto bg-olive text-white px-8 py-4 rounded-full font-sans font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
                Mulai Membaca
              </button>
            </div>
          </motion.div>
        </section>

        {/* Catalog Section */}
        <section className="px-6 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-medium mb-2">Koleksi Terbaru</h2>
                <p className="text-gray-500 font-sans">Pilihan editor untuk minggu ini</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-sans transition-all ${
                      selectedCategory === cat 
                        ? 'bg-olive text-white' 
                        : 'bg-warm-bg text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                {filteredBooks.map((book, idx) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group cursor-pointer"
                  >
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-shadow duration-500">
                      <img 
                        src={book.coverUrl} 
                        alt={book.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs uppercase tracking-widest text-olive font-sans font-semibold">{book.category}</span>
                      <h3 className="text-xl font-medium group-hover:text-olive transition-colors">{book.title}</h3>
                      <p className="text-gray-500 text-sm font-sans italic">{book.author}</p>
                      <p className="text-lg font-sans font-semibold mt-2">Rp {book.price.toLocaleString('id-ID')}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 font-sans text-lg">Tidak ada buku yang ditemukan.</p>
                {books.length === 0 && (
                  <button 
                    onClick={seedDatabase}
                    className="mt-4 text-olive underline font-sans"
                  >
                    Klik di sini untuk mengisi data contoh (Seeding)
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Newsletter / CTA */}
        <section className="px-6 py-20 bg-warm-bg">
          <div className="max-w-4xl mx-auto bg-olive rounded-[32px] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-medium mb-6">Dapatkan Rekomendasi Buku Setiap Minggu</h2>
              <p className="text-olive-100/80 mb-10 font-sans max-w-xl mx-auto">
                Bergabunglah dengan 10,000+ pembaca lainnya dan dapatkan info promo serta buku terbaru langsung di email Anda.
              </p>
              <form className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Alamat email Anda" 
                  className="flex-grow px-6 py-4 rounded-full bg-white/10 border border-white/20 focus:outline-none focus:bg-white/20 font-sans placeholder:text-white/50"
                />
                <button className="bg-white text-olive px-8 py-4 rounded-full font-sans font-bold hover:bg-gray-100 transition-colors">
                  Langganan
                </button>
              </form>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <BookOpen className="text-olive w-6 h-6" />
            <span className="text-xl font-semibold tracking-tight text-olive">Libby</span>
          </div>
          
          <div className="flex gap-8 text-xs font-sans uppercase tracking-widest text-gray-400">
            <a href="#" className="hover:text-olive transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-olive transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-olive transition-colors">Hubungi Kami</a>
          </div>

          <p className="text-gray-400 text-sm font-sans">
            © 2024 Libby Indonesia. Dibuat dengan cinta untuk pembaca.
          </p>
        </div>
      </footer>
    </div>
  );
}


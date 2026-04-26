/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, ShoppingCart, User, LogIn, LogOut, Filter, ChevronRight, Github, Linkedin, Globe, Mail, Phone, MapPin, Send } from 'lucide-react';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { signInWithRedirect, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Book } from './types';
import { seedDatabase } from './db/seed';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'about' | 'contact' | 'terms' | 'privacy' | 'admin'>('home');

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
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, selectedCategory]);

  const categories = useMemo(() => ['Semua', 'Fiction', 'History', 'Self-Help', 'Business', 'Technology'], []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-warm-bg/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
          <BookOpen className="text-olive w-8 h-8" />
          <span className="text-2xl font-semibold tracking-tight text-olive">Libby</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-sans uppercase tracking-widest text-gray-600">
          <button onClick={() => setCurrentView('home')} className={`hover:text-olive transition-colors ${currentView === 'home' ? 'text-olive font-bold' : ''}`}>Katalog</button>
          <a href="#" className="hover:text-olive transition-colors">Populer</a>
          <button onClick={() => setCurrentView('about')} className={`hover:text-olive transition-colors ${currentView === 'about' ? 'text-olive font-bold' : ''}`}>Tentang Kami</button>
          <button onClick={() => setCurrentView('contact')} className={`hover:text-olive transition-colors ${currentView === 'contact' ? 'text-olive font-bold' : ''}`}>Hubungi Kami</button>
          {user?.email === 'ridhonuruladilla@gmail.com' && (
            <button onClick={() => setCurrentView('admin')} className={`hover:text-olive transition-colors ${currentView === 'admin' ? 'text-olive font-bold' : ''}`}>Admin</button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-olive" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
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
        {currentView === 'home' ? (
          <>
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
                        className={`px-4 py-2 rounded-full text-sm font-sans transition-all ${selectedCategory === cat
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
                            loading="lazy"
                            decoding="async"
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
          </>
        ) : currentView === 'about' ? (
          <section className="px-6 py-20 bg-warm-bg min-h-[80vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto bg-white rounded-[32px] p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 w-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-olive/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-olive/20 p-2 shadow-inner">
                  <img src="https://github.com/ridhoadilla.png" alt="Ridho Nurul Adilla" className="w-full h-full object-cover rounded-full" loading="lazy" decoding="async" />
                </div>
                <h1 className="text-3xl md:text-5xl font-medium mb-3">Ridho Nurul Adilla</h1>
                <p className="text-olive font-sans tracking-widest uppercase text-sm font-semibold mb-8">Software Engineer & Developer</p>

                <p className="text-gray-600 font-sans leading-relaxed mb-10 max-w-lg text-lg">
                  Hai! Saya Ridho, kreator di balik platform <span className="font-semibold text-gray-800">Libby</span>.
                  Saya sangat tertarik dalam membangun ekosistem digital yang cantik dan interaktif untuk memberikan pengalaman web terbaik bagi para pengguna.
                </p>

                <div className="flex items-center gap-6">
                  <a href="https://github.com/ridhoadilla" target="_blank" rel="noreferrer" className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-olive hover:text-white transition-all hover:-translate-y-1 hover:shadow-lg">
                    <Github className="w-6 h-6" />
                  </a>
                  <a href="https://linkedin.com/in/ridhoadilla" target="_blank" rel="noreferrer" className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-olive hover:text-white transition-all hover:-translate-y-1 hover:shadow-lg">
                    <Linkedin className="w-6 h-6" />
                  </a>
                  <a href="https://rirula.my.id" target="_blank" rel="noreferrer" className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-olive hover:text-white transition-all hover:-translate-y-1 hover:shadow-lg">
                    <Globe className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </motion.div>
          </section>
        ) : currentView === 'contact' ? (
          <section className="px-6 py-20 bg-warm-bg min-h-[80vh] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-5xl mx-auto w-full"
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-medium mb-4">Hubungi Kami</h1>
                <p className="text-gray-600 font-sans max-w-2xl mx-auto text-lg">
                  Punya pertanyaan tentang Libby? Ingin bekerja sama atau melaporkan masalah?
                  Jangan ragu untuk menghubungi kami. Tim kami siap membantu Anda!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
                {/* Contact Information */}
                <div className="bg-olive p-10 md:p-12 text-white relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-medium mb-8">Informasi Kontak</h3>
                    <div className="space-y-8 font-sans">
                      <div className="flex items-start gap-4 hover:translate-x-2 transition-transform duration-300">
                        <MapPin className="w-6 h-6 mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-lg mb-1">Alamat Kantor</p>
                          <p className="text-white/80 leading-relaxed">Condet<br />Jakarta Selatan, Indonesia 13520</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 hover:translate-x-2 transition-transform duration-300">
                        <Phone className="w-6 h-6 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-lg mb-1">Telepon</p>
                          <p className="text-white/80">+6285710040030</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 hover:translate-x-2 transition-transform duration-300">
                        <Mail className="w-6 h-6 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-lg mb-1">Email</p>
                          <p className="text-white/80">ridho@libby.co.id</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-12">
                    <p className="font-sans text-sm text-white/60 mb-4">Temukan kami di sosial media</p>
                    <div className="flex gap-4">
                      <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-olive transition-colors">
                        <Linkedin className="w-5 h-5" />
                      </a>
                      <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-olive transition-colors">
                        <Github className="w-5 h-5" />
                      </a>
                      <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-olive transition-colors">
                        <Globe className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="p-10 md:py-12 md:pr-12 md:pl-6 flex flex-col justify-center">
                  <h3 className="text-2xl font-medium mb-8 text-gray-800">Kirim Pesan</h3>
                  <form className="space-y-6 font-sans" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-5">
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-olive transition-colors">Nama Lengkap</label>
                        <input
                          type="text"
                          placeholder="Masukkan nama Anda"
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive transition-all bg-gray-50 focus:bg-white"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-olive transition-colors">Alamat Email</label>
                        <input
                          type="email"
                          placeholder="nama@email.com"
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive transition-all bg-gray-50 focus:bg-white"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-olive transition-colors">Pesan</label>
                        <textarea
                          rows={4}
                          placeholder="Tulis pesan Anda di sini..."
                          className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive transition-all resize-none bg-gray-50 focus:bg-white"
                        ></textarea>
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-olive text-white py-4 mt-2 rounded-xl font-semibold hover:bg-olive/90 flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:-translate-y-1 active:translate-y-0">
                      <Send className="w-5 h-5" />
                      Kirim Pesan Sekarang
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </section>
        ) : currentView === 'terms' ? (
          <section className="px-6 py-20 bg-warm-bg min-h-[80vh] flex items-start justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto w-full bg-white rounded-[32px] p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-olive/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <h1 className="text-4xl md:text-5xl font-medium mb-4">Syarat & Ketentuan</h1>
                  <p className="text-gray-500 font-sans">Pembaruan terakhir: 16 April 2026</p>
                </div>

                <div className="space-y-8 font-sans text-gray-700 leading-relaxed">
                  <div>
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">1. Penerimaan Syarat</h2>
                    <p>
                      Dengan mengakses dan menggunakan aplikasi Libby, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda dilarang menggunakan platform kami.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">2. Layanan Kami</h2>
                    <p>
                      Libby adalah platform penyedia ebook digital yang memungkinkan pengguna untuk membeli, meminjam, dan membaca buku secara online. Kami berhak mengubah, menangguhkan, atau menghentikan bagian mana pun dari layanan kapan saja tanpa pemberitahuan sebelumnya.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">3. Akun Pengguna</h2>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Anda bertanggung jawab untuk menjaga kerahasiaan informasi akun Anda.</li>
                      <li>Satu akun hanya boleh digunakan oleh satu pengguna secara individu.</li>
                      <li>Setiap aktivitas yang terjadi di bawah akun Anda sepenuhnya merupakan tanggung jawab Anda.</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">4. Hak Cipta dan Kekayaan Intelektual</h2>
                    <p>
                      Semua ebook, logo, desain, dan konten yang tersedia di platform kami dilindungi oleh undang-undang hak cipta. Dilarang keras menyalin, mendistribusikan, atau menjual kembali konten dari Libby tanpa izin tertulis dari pihak kami maupun penerbit terkait.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">5. Kebijakan Pembelian dan Pengembalian</h2>
                    <p>
                      Semua pembelian ebook bersifat final karena berupa barang digital. Pengembalian dana (refund) hanya dapat dilakukan dalam keadaan tertentu seperti masalah sistem atau file rusak yang diverifikasi oleh tim kami dalam waktu 7 hari sejak pembelian.
                    </p>
                  </div>

                  <div className="pt-8 border-t border-gray-100">
                    <p className="text-gray-500 italic text-sm text-center">
                      Jika Anda memiliki pertanyaan terkait syarat & ketentuan ini, silakan hubungi kami di halaman Kontak.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        ) : currentView === 'privacy' ? (
          <section className="px-6 py-20 bg-warm-bg min-h-[80vh] flex items-start justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto w-full bg-white rounded-[32px] p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-olive/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <h1 className="text-4xl md:text-5xl font-medium mb-4">Kebijakan Privasi</h1>
                  <p className="text-gray-500 font-sans">Pembaruan terakhir: 16 April 2026</p>
                </div>

                <div className="space-y-8 font-sans text-gray-700 leading-relaxed">
                  <div>
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">1. Pengumpulan Informasi</h2>
                    <p>
                      Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, seperti saat Anda membuat akun, memperbarui profil, atau melakukan pembelian. Informasi ini mungkin termasuk nama, alamat email, dan data transaksi Anda.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">2. Penggunaan Informasi</h2>
                    <p>
                      Kami menggunakan informasi Anda untuk menyediakan, memelihara, dan meningkatkan layanan kami. Data Anda membantu kami dalam mempersonalisasi pengalaman Anda, memproses transaksi, dan mengirimkan pembaruan terkait layanan Libby.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">3. Perlindungan Data</h2>
                    <p>
                      Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi informasi pribadi Anda dari akses, penggunaan, atau pengungkapan yang tidak sah. Transaksi Anda dilindungi dengan enkripsi standar industri.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">4. Berbagi Informasi</h2>
                    <p>
                      Kami tidak menjual, memperdagangkan, atau menyewakan informasi identifikasi pribadi Anda kepada pihak ketiga. Kami dapat membagikan informasi demografis gabungan yang tidak terkait dengan informasi identifikasi pribadi apa pun.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">5. Penggunaan Cookie</h2>
                    <p>
                      Aplikasi kami mungkin menggunakan "cookie" untuk meningkatkan pengalaman pengguna. Pengguna dapat memilih untuk mengatur browser web mereka agar menolak cookie, atau untuk memberi tahu saat cookie dikirim.
                    </p>
                  </div>

                  <div className="pt-8 border-t border-gray-100">
                    <p className="text-gray-500 italic text-sm text-center">
                      Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, praktik aplikasi ini, atau transaksi Anda dengan kami, silakan hubungi kami di halaman Kontak.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        ) : currentView === 'admin' && user?.email === 'ridhonuruladilla@gmail.com' ? (
          <AdminPanel books={books} />
        ) : null}
      </main>

      <footer className="bg-white border-t border-gray-100 px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <BookOpen className="text-olive w-6 h-6" />
            <span className="text-xl font-semibold tracking-tight text-olive">Libby</span>
          </div>

          <div className="flex gap-8 text-xs font-sans uppercase tracking-widest text-gray-400">
            <button onClick={() => { window.scrollTo(0, 0); setCurrentView('terms'); }} className="hover:text-olive transition-colors uppercase tracking-widest text-xs">Syarat & Ketentuan</button>
            <button onClick={() => { window.scrollTo(0, 0); setCurrentView('privacy'); }} className="hover:text-olive transition-colors uppercase tracking-widest text-xs">Kebijakan Privasi</button>
            <button onClick={() => { window.scrollTo(0, 0); setCurrentView('contact'); }} className="hover:text-olive transition-colors uppercase tracking-widest text-xs">Hubungi Kami</button>
          </div>

          <p className="text-gray-400 text-sm font-sans">
            © 2024 Libby Indonesia. Dibuat dengan cinta untuk pembaca.
          </p>
        </div>
      </footer>
    </div>
  );
}


import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Trash2, Plus, X, Save, AlertCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { Book } from '../types';

interface AdminPanelProps {
  books: Book[];
}

const CATEGORIES = ['Fiction', 'History', 'Self-Help', 'Business', 'Technology'];

export default function AdminPanel({ books }: AdminPanelProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    coverUrl: '',
    category: CATEGORIES[0],
    stock: '0'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      price: '',
      coverUrl: '',
      category: CATEGORIES[0],
      stock: '0'
    });
    setEditingBookId(null);
    setIsFormOpen(false);
    setError(null);
  };

  const handleEdit = (book: Book) => {
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description || '',
      price: book.price.toString(),
      coverUrl: book.coverUrl,
      category: book.category,
      stock: book.stock.toString()
    });
    setEditingBookId(book.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'books', id));
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete book: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        price: Number(formData.price),
        coverUrl: formData.coverUrl,
        category: formData.category,
        stock: Number(formData.stock)
      };

      if (editingBookId) {
        await updateDoc(doc(db, 'books', editingBookId), bookData);
      } else {
        await addDoc(collection(db, 'books'), {
          ...bookData,
          createdAt: serverTimestamp()
        });
      }
      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-6 py-12 md:py-20 bg-warm-bg min-h-[80vh]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-medium mb-2">Admin Dashboard</h1>
            <p className="text-gray-500 font-sans">Kelola katalog buku Libby</p>
          </div>
          <button
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="bg-olive text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-olive/90 transition-all shadow-md font-sans font-medium"
          >
            <Plus className="w-5 h-5" />
            Tambah Buku
          </button>
        </div>

        {/* Existing Books Table */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-sm tracking-wider uppercase">
                  <th className="pb-4 font-medium px-4">Buku</th>
                  <th className="pb-4 font-medium px-4">Kategori</th>
                  <th className="pb-4 font-medium px-4">Harga</th>
                  <th className="pb-4 font-medium px-4">Stok</th>
                  <th className="pb-4 font-medium px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {books.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-4 flex items-center gap-4">
                      <img src={book.coverUrl} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                      <div>
                        <p className="font-semibold text-gray-800">{book.title}</p>
                        <p className="text-sm text-gray-500">{book.author}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{book.category}</td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-800">Rp {book.price.toLocaleString('id-ID')}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded-md ${book.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {book.stock}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(book)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors tooltip"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id, book.title)}
                          disabled={loading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 tooltip"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {books.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      Belum ada buku di katalog.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Add / Edit */}
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-medium">{editingBookId ? 'Edit Buku' : 'Tambah Buku Baru'}</h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 font-sans">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Judul Buku</label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive transition-all bg-gray-50 focus:bg-white"
                        placeholder="Contoh: Laskar Pelangi"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Penulis</label>
                      <input
                        required
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive transition-all bg-gray-50 focus:bg-white"
                        placeholder="Nama Penulis"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Deskripsi</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive transition-all bg-gray-50 focus:bg-white resize-none"
                      placeholder="Sinopsis singkat buku..."
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Kategori</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive transition-all bg-gray-50 focus:bg-white appearance-none"
                      >
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">URL Cover (Gambar)</label>
                      <input
                        required
                        type="url"
                        value={formData.coverUrl}
                        onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive transition-all bg-gray-50 focus:bg-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Harga (Rp)</label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive transition-all bg-gray-50 focus:bg-white"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Stok</label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive transition-all bg-gray-50 focus:bg-white"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 rounded-xl bg-olive text-white font-semibold hover:bg-olive/90 transition-all flex items-center gap-2 shadow-md disabled:opacity-70"
                    >
                      {loading ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      {editingBookId ? 'Simpan Perubahan' : 'Tambah Buku'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const books = [
  {
    title: "Laskar Pelangi",
    author: "Andrea Hirata",
    description: "Kisah tentang sepuluh anak dari keluarga miskin di Belitung yang bersekolah di sebuah sekolah Muhammadiyah.",
    price: 85000,
    coverUrl: "https://picsum.photos/seed/laskar/400/600",
    category: "Fiction",
    stock: 100,
    createdAt: serverTimestamp()
  },
  {
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    description: "Novel pertama dari Tetralogi Buru yang berlatar belakang pada masa kolonial Belanda.",
    price: 95000,
    coverUrl: "https://picsum.photos/seed/bumi/400/600",
    category: "History",
    stock: 50,
    createdAt: serverTimestamp()
  },
  {
    title: "Filosofi Teras",
    author: "Henry Manampiring",
    description: "Buku yang memperkenalkan filosofi Stoisisme untuk membantu kita hidup lebih tenang.",
    price: 75000,
    coverUrl: "https://picsum.photos/seed/teras/400/600",
    category: "Self-Help",
    stock: 200,
    createdAt: serverTimestamp()
  }
];

export async function seedDatabase() {
  console.log("Starting seeding...");
  const booksCol = collection(db, 'books');
  for (const book of books) {
    try {
      await addDoc(booksCol, book);
      console.log(`Added book: ${book.title}`);
    } catch (error) {
      console.error(`Error adding book ${book.title}:`, error);
    }
  }
  console.log("Seeding complete!");
}

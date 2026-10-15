/**
 * Athenaeum Central Library Management System
 * Database Engine & Business Logic Layer (localStorage with memory fallback)
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'athenaeum_library_data_v2';
  const CURRENT_USER_KEY = 'athenaeum_current_user';

  // Fallback covers in case external images are slow to load
  const DEFAULT_COVER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80';

  const INITIAL_CATEGORIES = [
    { id: 'fiction', name: 'Fiction', icon: 'auto_stories', description: 'Timeless literary masterpieces, contemporary dramas, and imaginative journeys.' },
    { id: 'science-tech', name: 'Science and Technology', icon: 'biotech', description: 'Frontier physics, artificial intelligence, biotechnology, and computer science treatises.' },
    { id: 'history', name: 'History', icon: 'account_balance', description: 'Ancient empires, world civilizations, historical analyses, and archival retrospectives.' },
    { id: 'biography', name: 'Biography', icon: 'person', description: 'Inspiring life memoirs, personal letters, and definitive biographical chronicles.' },
    { id: 'business-econ', name: 'Business and Economics', icon: 'trending_up', description: 'Global macroeconomics, entrepreneurial playbooks, finance, and organizational theory.' },
    { id: 'education', name: 'Education and Academic Textbooks', icon: 'school', description: 'Curriculum texts, scientific research handbooks, pedagogy, and reference materials.' },
    { id: 'mystery-thriller', name: 'Mystery and Thriller', icon: 'psychology_alt', description: 'Psychological suspense, noir detective investigations, and gripping thrillers.' },
    { id: 'literature-poetry', name: 'Literature and Poetry', icon: 'history_edu', description: 'Classical verse, dramatic theatre, philosophical essays, and anthologies.' },
    { id: 'childrens', name: "Children's Books", icon: 'child_care', description: 'Illustrated fairy tales, early learning primers, and beloved young-adult adventures.' }
  ];

  const INITIAL_BOOKS = [
    {
      id: 'book-001',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0743273565',
      publisher: 'Scribner',
      year: 1925,
      category: 'fiction',
      categoryName: 'Fiction',
      description: 'A portrait of the Jazz Age in all its decadence and excess, following the mysterious Jay Gatsby and his obsession with the elusive Daisy Buchanan.',
      totalCopies: 6,
      availableCopies: 4,
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'A-14 / Fic-FITZ',
      pages: 180,
      language: 'English',
      rating: 4.8,
      reviewsCount: 38,
      featured: true,
      popular: true,
      newlyAdded: false
    },
    {
      id: 'book-002',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0060935467',
      publisher: 'Harper Perennial Modern Classics',
      year: 1960,
      category: 'fiction',
      categoryName: 'Fiction',
      description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, featuring attorney Atticus Finch.',
      totalCopies: 5,
      availableCopies: 3,
      coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'A-22 / Fic-LEE',
      pages: 336,
      language: 'English',
      rating: 4.9,
      reviewsCount: 52,
      featured: true,
      popular: true,
      newlyAdded: false
    },
    {
      id: 'book-003',
      title: 'A Brief History of Time',
      author: 'Stephen Hawking',
      isbn: '978-0553380163',
      publisher: 'Bantam Books',
      year: 1988,
      category: 'science-tech',
      categoryName: 'Science and Technology',
      description: 'An iconic exploration of profound questions: How did the universe begin? Could time run backward? Is there an ultimate boundary to space?',
      totalCopies: 4,
      availableCopies: 2,
      coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'S-08 / Sci-HAWK',
      pages: 212,
      language: 'English',
      rating: 4.7,
      reviewsCount: 44,
      featured: true,
      popular: true,
      newlyAdded: false
    },
    {
      id: 'book-004',
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell & Peter Norvig',
      isbn: '978-0134610993',
      publisher: 'Pearson',
      year: 2020,
      category: 'science-tech',
      categoryName: 'Science and Technology',
      description: 'The definitive, most widely used university text on artificial intelligence, covering search algorithms, machine learning, robotics, and neural networks.',
      totalCopies: 3,
      availableCopies: 1,
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'S-19 / Comp-RUSS',
      pages: 1152,
      language: 'English',
      rating: 4.9,
      reviewsCount: 29,
      featured: false,
      popular: true,
      newlyAdded: true
    },
    {
      id: 'book-005',
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      isbn: '978-0062316097',
      publisher: 'Harper',
      year: 2014,
      category: 'history',
      categoryName: 'History',
      description: 'A groundbreaking narrative traversing 70,000 years of human evolution, exploring how biology and history have defined us and enhanced our understanding of what it means to be human.',
      totalCopies: 7,
      availableCopies: 5,
      coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'H-03 / Hist-HARA',
      pages: 443,
      language: 'English',
      rating: 4.8,
      reviewsCount: 67,
      featured: true,
      popular: true,
      newlyAdded: false
    },
    {
      id: 'book-006',
      title: 'The Guns of August',
      author: 'Barbara W. Tuchman',
      isbn: '978-0345476098',
      publisher: 'Presidio Press',
      year: 1962,
      category: 'history',
      categoryName: 'History',
      description: 'Pulitzer Prize-winning masterpiece recreating the fateful opening thirty days of the summer of 1914, which determined the course of the First World War.',
      totalCopies: 4,
      availableCopies: 3,
      coverImage: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'H-12 / Hist-TUCH',
      pages: 511,
      language: 'English',
      rating: 4.6,
      reviewsCount: 19,
      featured: false,
      popular: false,
      newlyAdded: true
    },
    {
      id: 'book-007',
      title: 'Leonardo da Vinci',
      author: 'Walter Isaacson',
      isbn: '978-1501139154',
      publisher: 'Simon & Schuster',
      year: 2017,
      category: 'biography',
      categoryName: 'Biography',
      description: 'Based on thousands of pages from Leonardo da Vinci’s astonishing notebooks, Isaacson weaves a narrative connecting his art with his visionary science.',
      totalCopies: 5,
      availableCopies: 3,
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'B-04 / Bio-ISAA',
      pages: 624,
      language: 'English',
      rating: 4.8,
      reviewsCount: 31,
      featured: true,
      popular: true,
      newlyAdded: false
    },
    {
      id: 'book-008',
      title: 'The Diary of a Young Girl',
      author: 'Anne Frank',
      isbn: '978-0553296983',
      publisher: 'Bantam',
      year: 1947,
      category: 'biography',
      categoryName: 'Biography',
      description: 'Discovered in the attic in which she spent the last years of her life, Anne Frank’s remarkable diary has become a world classic and testament to the human spirit.',
      totalCopies: 6,
      availableCopies: 5,
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'B-15 / Bio-FRAN',
      pages: 283,
      language: 'English',
      rating: 4.9,
      reviewsCount: 82,
      featured: false,
      popular: true,
      newlyAdded: false
    },
    {
      id: 'book-009',
      title: 'Principles: Life and Work',
      author: 'Ray Dalio',
      isbn: '978-1501124020',
      publisher: 'Simon & Schuster',
      year: 2017,
      category: 'business-econ',
      categoryName: 'Business and Economics',
      description: 'Ray Dalio, one of the world’s most successful investors, shares the unconventional principles that he developed, refined, and used over forty years.',
      totalCopies: 5,
      availableCopies: 3,
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'E-02 / Econ-DALI',
      pages: 592,
      language: 'English',
      rating: 4.7,
      reviewsCount: 39,
      featured: false,
      popular: true,
      newlyAdded: true
    },
    {
      id: 'book-010',
      title: 'The Intelligent Investor',
      author: 'Benjamin Graham',
      isbn: '978-0060555665',
      publisher: 'Harper Business',
      year: 1949,
      category: 'business-econ',
      categoryName: 'Business and Economics',
      description: 'The greatest investment advisor of the twentieth century, Benjamin Graham taught and inspired people worldwide through his philosophy of value investing.',
      totalCopies: 4,
      availableCopies: 2,
      coverImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'E-09 / Econ-GRAH',
      pages: 640,
      language: 'English',
      rating: 4.8,
      reviewsCount: 45,
      featured: true,
      popular: true,
      newlyAdded: false
    },
    {
      id: 'book-011',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      publisher: 'Prentice Hall',
      year: 2008,
      category: 'education',
      categoryName: 'Education and Academic Textbooks',
      description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. A revolutionary guide for all engineers.',
      totalCopies: 6,
      availableCopies: 4,
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'T-01 / Soft-MART',
      pages: 464,
      language: 'English',
      rating: 4.7,
      reviewsCount: 58,
      featured: false,
      popular: true,
      newlyAdded: true
    },
    {
      id: 'book-012',
      title: 'Campbell Biology (12th Edition)',
      author: 'Lisa A. Urry et al.',
      isbn: '978-0135188743',
      publisher: 'Pearson',
      year: 2020,
      category: 'education',
      categoryName: 'Education and Academic Textbooks',
      description: 'Setting the standard for excellence, accuracy, and innovation in biological pedagogy. Trusted by professors and biology scholars globally.',
      totalCopies: 4,
      availableCopies: 2,
      coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'T-11 / Bio-URRY',
      pages: 1488,
      language: 'English',
      rating: 4.8,
      reviewsCount: 16,
      featured: false,
      popular: false,
      newlyAdded: false
    },
    {
      id: 'book-013',
      title: 'The Hound of the Baskervilles',
      author: 'Arthur Conan Doyle',
      isbn: '978-0486282145',
      publisher: 'Dover Publications',
      year: 1902,
      category: 'mystery-thriller',
      categoryName: 'Mystery and Thriller',
      description: 'Sherlock Holmes and Dr. Watson investigate the legend of a diabolical hound haunting Dartmoor and threatening the life of Sir Henry Baskerville.',
      totalCopies: 5,
      availableCopies: 3,
      coverImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'M-05 / Myst-DOYL',
      pages: 256,
      language: 'English',
      rating: 4.7,
      reviewsCount: 34,
      featured: true,
      popular: true,
      newlyAdded: false
    },
    {
      id: 'book-014',
      title: 'Gone Girl',
      author: 'Gillian Flynn',
      isbn: '978-0307588371',
      publisher: 'Crown Publishing',
      year: 2012,
      category: 'mystery-thriller',
      categoryName: 'Mystery and Thriller',
      description: 'On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne’s fifth wedding anniversary. Presents are being wrapped when Amy disappears.',
      totalCopies: 5,
      availableCopies: 4,
      coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'M-18 / Myst-FLYN',
      pages: 432,
      language: 'English',
      rating: 4.6,
      reviewsCount: 41,
      featured: false,
      popular: true,
      newlyAdded: true
    },
    {
      id: 'book-015',
      title: 'The Odyssey',
      author: 'Homer (Trans. Emily Wilson)',
      isbn: '978-0393356250',
      publisher: 'W. W. Norton & Company',
      year: 2018,
      category: 'literature-poetry',
      categoryName: 'Literature and Poetry',
      description: 'The first English translation of Homer’s epic poem by a woman, capturing the energy, pathos, and craft of Odysseus’ ten-year quest to return home.',
      totalCopies: 5,
      availableCopies: 3,
      coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'L-02 / Po-HOME',
      pages: 592,
      language: 'English',
      rating: 4.9,
      reviewsCount: 33,
      featured: true,
      popular: false,
      newlyAdded: false
    },
    {
      id: 'book-016',
      title: 'Selected Poems',
      author: 'T. S. Eliot',
      isbn: '978-0571057061',
      publisher: 'Faber & Faber',
      year: 1954,
      category: 'literature-poetry',
      categoryName: 'Literature and Poetry',
      description: 'Contains seminal works including The Love Song of J. Alfred Prufrock, The Waste Land, and The Hollow Men by Nobel laureate T. S. Eliot.',
      totalCopies: 4,
      availableCopies: 3,
      coverImage: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'L-14 / Po-ELIO',
      pages: 144,
      language: 'English',
      rating: 4.8,
      reviewsCount: 22,
      featured: false,
      popular: false,
      newlyAdded: true
    },
    {
      id: 'book-017',
      title: 'The Little Prince',
      author: 'Antoine de Saint-Exupéry',
      isbn: '978-0156012195',
      publisher: 'Mariner Books',
      year: 1943,
      category: 'childrens',
      categoryName: "Children's Books",
      description: 'A poetic tale of an aviator stranded in the desert who meets a young prince fallen to Earth from a tiny asteroid, meditating on love, loneliness, and friendship.',
      totalCopies: 6,
      availableCopies: 5,
      coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'C-01 / Ch-EXUP',
      pages: 96,
      language: 'English',
      rating: 4.9,
      reviewsCount: 74,
      featured: true,
      popular: true,
      newlyAdded: false
    },
    {
      id: 'book-018',
      title: "Charlotte's Web",
      author: 'E. B. White',
      isbn: '978-0064400558',
      publisher: 'HarperCollins',
      year: 1952,
      category: 'childrens',
      categoryName: "Children's Books",
      description: 'The heartwarming story of a gentle pig named Wilbur and an extraordinary spider named Charlotte who determines to save his life.',
      totalCopies: 5,
      availableCopies: 4,
      coverImage: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'C-08 / Ch-WHIT',
      pages: 192,
      language: 'English',
      rating: 4.8,
      reviewsCount: 39,
      featured: false,
      popular: true,
      newlyAdded: false
    },
    {
      id: 'book-019',
      title: 'Dune',
      author: 'Frank Herbert',
      isbn: '978-0441172719',
      publisher: 'Ace Books',
      year: 1965,
      category: 'fiction',
      categoryName: 'Fiction',
      description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, who will become the mysterious man known as Muad’Dib, avenging his family.',
      totalCopies: 5,
      availableCopies: 2,
      coverImage: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'A-31 / Sci-HERB',
      pages: 688,
      language: 'English',
      rating: 4.9,
      reviewsCount: 61,
      featured: true,
      popular: true,
      newlyAdded: true
    },
    {
      id: 'book-020',
      title: 'Cosmos',
      author: 'Carl Sagan',
      isbn: '978-0345539434',
      publisher: 'Ballantine Books',
      year: 1980,
      category: 'science-tech',
      categoryName: 'Science and Technology',
      description: 'Sagan’s magnificent exploration of the universe, tracing fifteen billion years of cosmic evolution and science history that shaped human society.',
      totalCopies: 5,
      availableCopies: 3,
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
      shelfLocation: 'S-24 / Sci-SAGA',
      pages: 384,
      language: 'English',
      rating: 4.9,
      reviewsCount: 53,
      featured: true,
      popular: true,
      newlyAdded: false
    }
  ];

  const INITIAL_MEMBERS = [
    {
      id: 'user-admin',
      membershipId: 'ATH-ADM-001',
      name: 'Dr. Julian Sterling',
      email: 'admin@athenaeum.lib',
      password: 'password123',
      role: 'admin',
      phone: '+1 (555) 019-2834',
      joinedDate: '2022-01-15',
      status: 'Active',
      maxBorrowLimit: 10,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces'
    },
    {
      id: 'user-elena',
      membershipId: 'ATH-MEM-1042',
      name: 'Elena Rostova',
      email: 'elena.rostova@athenaeum.lib',
      password: 'password123',
      role: 'member',
      phone: '+1 (555) 014-9382',
      joinedDate: '2024-03-12',
      status: 'Active',
      maxBorrowLimit: 4,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces'
    },
    {
      id: 'user-marcus',
      membershipId: 'ATH-MEM-1088',
      name: 'Marcus Vance',
      email: 'marcus.vance@gmail.com',
      password: 'password123',
      role: 'member',
      phone: '+1 (555) 018-7291',
      joinedDate: '2024-05-20',
      status: 'Active',
      maxBorrowLimit: 4,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces'
    },
    {
      id: 'user-sophia',
      membershipId: 'ATH-MEM-1102',
      name: 'Sophia Chen',
      email: 'sophia.chen@university.edu',
      password: 'password123',
      role: 'member',
      phone: '+1 (555) 012-3904',
      joinedDate: '2024-06-04',
      status: 'Active',
      maxBorrowLimit: 4,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces'
    },
    {
      id: 'user-clara',
      membershipId: 'ATH-MEM-1135',
      name: 'Clara Thorne',
      email: 'clara.t@literary.org',
      password: 'password123',
      role: 'member',
      phone: '+1 (555) 016-8319',
      joinedDate: '2024-08-14',
      status: 'Suspended',
      maxBorrowLimit: 4,
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=faces'
    }
  ];

  // Current ISO date helpers
  function addDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  function formatShortDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const INITIAL_LOANS = [
    {
      id: 'loan-101',
      bookId: 'book-001',
      bookTitle: 'The Great Gatsby',
      bookAuthor: 'F. Scott Fitzgerald',
      bookCover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
      memberId: 'user-elena',
      memberName: 'Elena Rostova',
      memberEmail: 'elena.rostova@athenaeum.lib',
      borrowDate: addDays(-10),
      dueDate: addDays(4), // Due in 4 days
      returnDate: null,
      status: 'Borrowed',
      renewCount: 0
    },
    {
      id: 'loan-102',
      bookId: 'book-003',
      bookTitle: 'A Brief History of Time',
      bookAuthor: 'Stephen Hawking',
      bookCover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      memberId: 'user-elena',
      memberName: 'Elena Rostova',
      memberEmail: 'elena.rostova@athenaeum.lib',
      borrowDate: addDays(-18),
      dueDate: addDays(-2), // Overdue by 2 days
      returnDate: null,
      status: 'Overdue',
      renewCount: 1
    },
    {
      id: 'loan-103',
      bookId: 'book-004',
      bookTitle: 'Artificial Intelligence: A Modern Approach',
      bookAuthor: 'Stuart Russell & Peter Norvig',
      bookCover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      memberId: 'user-marcus',
      memberName: 'Marcus Vance',
      memberEmail: 'marcus.vance@gmail.com',
      borrowDate: addDays(-8),
      dueDate: addDays(6),
      returnDate: null,
      status: 'Borrowed',
      renewCount: 0
    },
    {
      id: 'loan-104',
      bookId: 'book-005',
      bookTitle: 'Sapiens: A Brief History of Humankind',
      bookAuthor: 'Yuval Noah Harari',
      bookCover: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80',
      memberId: 'user-sophia',
      memberName: 'Sophia Chen',
      memberEmail: 'sophia.chen@university.edu',
      borrowDate: addDays(-25),
      dueDate: addDays(-11),
      returnDate: addDays(-10),
      status: 'Returned',
      renewCount: 0
    },
    {
      id: 'loan-105',
      bookId: 'book-010',
      bookTitle: 'The Intelligent Investor',
      bookAuthor: 'Benjamin Graham',
      bookCover: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
      memberId: 'user-elena',
      memberName: 'Elena Rostova',
      memberEmail: 'elena.rostova@athenaeum.lib',
      borrowDate: addDays(-40),
      dueDate: addDays(-26),
      returnDate: addDays(-25),
      status: 'Returned',
      renewCount: 0
    }
  ];

  const INITIAL_RESERVATIONS = [
    {
      id: 'res-201',
      bookId: 'book-019',
      bookTitle: 'Dune',
      bookAuthor: 'Frank Herbert',
      bookCover: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=600&auto=format&fit=crop&q=80',
      memberId: 'user-elena',
      memberName: 'Elena Rostova',
      memberEmail: 'elena.rostova@athenaeum.lib',
      requestDate: addDays(-2),
      status: 'Pending', // Pending, Ready for Pickup, Fulfilled, Cancelled
      priorityQueue: 1
    },
    {
      id: 'res-202',
      bookId: 'book-007',
      bookTitle: 'Leonardo da Vinci',
      bookAuthor: 'Walter Isaacson',
      bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      memberId: 'user-marcus',
      memberName: 'Marcus Vance',
      memberEmail: 'marcus.vance@gmail.com',
      requestDate: addDays(-4),
      status: 'Ready for Pickup',
      priorityQueue: 1
    }
  ];

  const INITIAL_NOTIFICATIONS = [
    {
      id: 'notif-1',
      userId: 'user-elena',
      title: 'Overdue Notice',
      message: 'Your loan for "A Brief History of Time" is 2 days overdue. Please return or speak with a librarian.',
      date: addDays(-1),
      type: 'warning',
      read: false
    },
    {
      id: 'notif-2',
      userId: 'user-elena',
      title: 'Upcoming Due Date',
      message: '"The Great Gatsby" is due for return in 4 days.',
      date: addDays(0),
      type: 'info',
      read: false
    },
    {
      id: 'notif-3',
      userId: 'user-elena',
      title: 'Reservation Status',
      message: 'Your reservation for "Dune" has been acknowledged in Queue #1.',
      date: addDays(-2),
      type: 'success',
      read: true
    },
    {
      id: 'notif-all',
      userId: 'all',
      title: 'Library Hours Notice',
      message: 'Special holiday hours in effect for the upcoming long weekend. Reading rooms remain open 24/7 with digital pass.',
      date: addDays(-3),
      type: 'system',
      read: true
    }
  ];

  const INITIAL_INQUIRIES = [
    {
      id: 'inq-1',
      name: 'Alexander Grey',
      email: 'a.grey@oxford.alumni.org',
      subject: 'Rare Manuscript Consultation Access',
      category: 'Research Assistance',
      message: 'Requesting access to the 18th-century cartographic collection for academic research on maritime trade routes.',
      date: addDays(-3),
      status: 'Answered'
    }
  ];

  const INITIAL_ACTIVITY_LOGS = [
    { id: 'act-1', text: 'Elena Rostova returned "The Intelligent Investor"', time: 'Yesterday at 3:15 PM', icon: 'keyboard_return' },
    { id: 'act-2', text: 'New member registration: Clara Thorne', time: '2 days ago', icon: 'person_add' },
    { id: 'act-3', text: 'Added 5 new copies of "Dune" to Fiction stacks', time: '3 days ago', icon: 'post_add' },
    { id: 'act-4', text: 'Marcus Vance reserved "Leonardo da Vinci"', time: '4 days ago', icon: 'bookmark' }
  ];

  // In-memory fallback if localStorage is disabled or throws
  let memoryStore = null;

  class LibraryDB {
    constructor() {
      this.init();
    }

    init() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          this.seedInitialData();
        } else {
          // Validate structure
          const parsed = JSON.parse(raw);
          if (!parsed.books || !parsed.members || !parsed.loans) {
            this.seedInitialData();
          } else {
            // Update overdue loan statuses dynamically
            this.refreshOverdueStatus();
          }
        }
      } catch (err) {
        console.warn('localStorage unavailable or failed, utilizing memory fallback:', err);
        this.seedInitialData(true);
      }
    }

    seedInitialData(inMemory = false) {
      const data = {
        meta: {
          libraryName: 'Athenaeum Central Library',
          maxBorrowDays: 14,
          maxBorrowLimit: 4,
          dailyFineRate: 0.50,
          version: '2.0.0'
        },
        categories: INITIAL_CATEGORIES,
        books: INITIAL_BOOKS,
        members: INITIAL_MEMBERS,
        loans: INITIAL_LOANS,
        reservations: INITIAL_RESERVATIONS,
        notifications: INITIAL_NOTIFICATIONS,
        inquiries: INITIAL_INQUIRIES,
        activityLogs: INITIAL_ACTIVITY_LOGS
      };

      if (inMemory) {
        memoryStore = data;
      } else {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
          memoryStore = data;
        }
      }
      this.recalculateInventory();
    }

    getRawData() {
      if (memoryStore) return memoryStore;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return memoryStore;
      }
    }

    saveRawData(data) {
      if (memoryStore) {
        memoryStore = data;
        return true;
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
      } catch (e) {
        memoryStore = data;
        return true;
      }
    }

    /**
     * Recalculate available copies for every book based on active loans & reservations
     */
    recalculateInventory() {
      const data = this.getRawData();
      if (!data) return;

      const activeLoansMap = {};
      const activeResMap = {};

      data.loans.forEach(loan => {
        if (loan.status === 'Borrowed' || loan.status === 'Overdue') {
          activeLoansMap[loan.bookId] = (activeLoansMap[loan.bookId] || 0) + 1;
        }
      });

      data.reservations.forEach(res => {
        if (res.status === 'Ready for Pickup') {
          activeResMap[res.bookId] = (activeResMap[res.bookId] || 0) + 1;
        }
      });

      data.books.forEach(book => {
        const borrowed = activeLoansMap[book.id] || 0;
        const held = activeResMap[book.id] || 0;
        const calculated = Math.max(0, book.totalCopies - borrowed - held);
        book.availableCopies = calculated;
      });

      this.saveRawData(data);
    }

    /**
     * Dynamically mark unreturned loans past their dueDate as Overdue
     */
    refreshOverdueStatus() {
      const data = this.getRawData();
      if (!data || !data.loans) return;
      const today = new Date().toISOString().split('T')[0];
      let changed = false;

      data.loans.forEach(loan => {
        if (loan.status === 'Borrowed' && loan.dueDate < today && !loan.returnDate) {
          loan.status = 'Overdue';
          changed = true;
        }
      });

      if (changed) {
        this.saveRawData(data);
      }
    }

    /* -------------------------------------------------------------
     * AUTHENTICATION & SESSION
     * -----------------------------------------------------------*/

    getCurrentUser() {
      try {
        const userStr = localStorage.getItem(CURRENT_USER_KEY);
        if (userStr) {
          const user = JSON.parse(userStr);
          // Verify with latest stored member record to keep profile synchronized
          const member = this.getMemberById(user.id);
          if (member) {
            return Object.assign({}, member, { password: undefined });
          }
          return user;
        }
      } catch (e) {}
      return null;
    }

    setCurrentUser(user) {
      try {
        const safeUser = Object.assign({}, user, { password: undefined });
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
        return safeUser;
      } catch (e) {
        return null;
      }
    }

    logout() {
      try {
        localStorage.removeItem(CURRENT_USER_KEY);
      } catch (e) {}
    }

    login(email, password, expectedRole = null) {
      const data = this.getRawData();
      if (!data) return { success: false, message: 'Database connection failed.' };

      const cleanEmail = (email || '').trim().toLowerCase();
      let member = data.members.find(m => m.email.toLowerCase() === cleanEmail);

      // If account does not exist yet, automatically create it on the fly with the entered email!
      if (!member) {
        const role = expectedRole || (cleanEmail.includes('admin') ? 'admin' : 'member');
        const namePart = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = namePart.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Patron';
        member = {
          id: 'user-' + Date.now().toString(36),
          membershipId: (role === 'admin' ? 'ATH-ADM-' : 'ATH-MEM-') + Math.floor(1000 + Math.random() * 9000),
          name: formattedName,
          email: cleanEmail,
          phone: '+1 (555) 019-2834',
          password: password || 'password123',
          role: role,
          status: 'Active',
          joinedDate: new Date().toISOString().split('T')[0],
          avatar: role === 'admin'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fm=webp&q=75'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fm=webp&q=75',
          department: role === 'admin' ? 'Library Administration' : 'General Patron',
          maxBorrowLimit: role === 'admin' ? 20 : 6
        };
        data.members.push(member);
        this.saveRawData(data);
      } else {
        if (member.password !== password) {
          return { success: false, message: 'Invalid password. Please verify your credentials.' };
        }
        if (member.status === 'Suspended') {
          return { success: false, message: 'This membership account has been suspended. Please visit the circulation desk.' };
        }
        if (expectedRole && member.role !== expectedRole) {
          member.role = expectedRole;
          this.saveRawData(data);
        }
      }

      const safeUser = this.setCurrentUser(member);
      this.logActivity(`${member.name} (${member.email}) logged into the system`, 'login');
      return { success: true, user: safeUser };
    }

    register(name, email, phone, password, role = 'member') {
      const data = this.getRawData();
      if (!data) return { success: false, message: 'Database connection failed.' };

      const cleanEmail = (email || '').trim().toLowerCase();
      const exists = data.members.some(m => m.email.toLowerCase() === cleanEmail);

      if (exists) {
        return { success: false, message: 'An account with this email address already exists. Please log in.' };
      }

      const count = data.members.length + 1001;
      const newMember = {
        id: 'user-' + Date.now().toString(36),
        membershipId: role === 'admin' ? `ATH-ADM-${count}` : `ATH-MEM-${count}`,
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : '+1 (555) 000-0000',
        password: password,
        role: role === 'admin' ? 'admin' : 'member',
        joinedDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        maxBorrowLimit: role === 'admin' ? 10 : 4,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces'
      };

      data.members.push(newMember);
      this.saveRawData(data);
      this.logActivity(`New member registered: ${newMember.name} (${newMember.membershipId})`, 'person_add');

      return { success: true, member: Object.assign({}, newMember, { password: undefined }) };
    }

    /* -------------------------------------------------------------
     * BOOKS CATALOG
     * -----------------------------------------------------------*/

    getBooks() {
      this.refreshOverdueStatus();
      const data = this.getRawData();
      return data ? data.books : [];
    }

    getBookById(id) {
      const books = this.getBooks();
      return books.find(b => b.id === id || b.isbn === id) || null;
    }

    getCategories() {
      const data = this.getRawData();
      return data ? data.categories : INITIAL_CATEGORIES;
    }

    getCategoryById(id) {
      const cats = this.getCategories();
      return cats.find(c => c.id === id) || null;
    }

    addBook(bookData) {
      const data = this.getRawData();
      if (!data) return { success: false, message: 'Database error' };

      // Validate required fields
      if (!bookData.title || !bookData.author || !bookData.category) {
        return { success: false, message: 'Title, Author, and Category are required.' };
      }

      // Check unique ISBN if provided
      if (bookData.isbn && data.books.some(b => b.isbn.trim() === bookData.isbn.trim())) {
        return { success: false, message: 'A book with this ISBN already exists in the catalog.' };
      }

      const totalCopies = parseInt(bookData.totalCopies, 10) || 1;
      const catObj = this.getCategoryById(bookData.category);

      const newBook = {
        id: 'book-' + Date.now().toString(36),
        title: bookData.title.trim(),
        author: bookData.author.trim(),
        isbn: bookData.isbn ? bookData.isbn.trim() : '978-' + Math.floor(1000000000 + Math.random() * 9000000000),
        publisher: bookData.publisher ? bookData.publisher.trim() : 'Athenaeum Editions',
        year: parseInt(bookData.year, 10) || new Date().getFullYear(),
        category: bookData.category,
        categoryName: catObj ? catObj.name : bookData.category,
        description: bookData.description ? bookData.description.trim() : 'No description provided for this volume.',
        totalCopies: totalCopies,
        availableCopies: totalCopies,
        coverImage: bookData.coverImage && bookData.coverImage.trim() ? bookData.coverImage.trim() : DEFAULT_COVER,
        shelfLocation: bookData.shelfLocation ? bookData.shelfLocation.trim() : 'General Stacks',
        pages: parseInt(bookData.pages, 10) || 280,
        language: bookData.language || 'English',
        rating: 5.0,
        reviewsCount: 1,
        featured: !!bookData.featured,
        popular: false,
        newlyAdded: true
      };

      data.books.unshift(newBook);
      this.saveRawData(data);
      this.recalculateInventory();
      this.logActivity(`Added new book to catalog: "${newBook.title}" by ${newBook.author}`, 'post_add');

      return { success: true, book: newBook };
    }

    updateBook(id, bookData) {
      const data = this.getRawData();
      if (!data) return { success: false, message: 'Database error' };

      const index = data.books.findIndex(b => b.id === id);
      if (index === -1) return { success: false, message: 'Book not found' };

      const current = data.books[index];
      const newTotal = parseInt(bookData.totalCopies, 10) || current.totalCopies;

      // Count active loans
      const activeLoansCount = data.loans.filter(l => l.bookId === id && (l.status === 'Borrowed' || l.status === 'Overdue')).length;
      if (newTotal < activeLoansCount) {
        return {
          success: false,
          message: `Total copies cannot be lower than currently borrowed copies (${activeLoansCount}).`
        };
      }

      const catObj = this.getCategoryById(bookData.category || current.category);

      data.books[index] = Object.assign({}, current, {
        title: bookData.title !== undefined ? bookData.title.trim() : current.title,
        author: bookData.author !== undefined ? bookData.author.trim() : current.author,
        isbn: bookData.isbn !== undefined ? bookData.isbn.trim() : current.isbn,
        publisher: bookData.publisher !== undefined ? bookData.publisher.trim() : current.publisher,
        year: bookData.year !== undefined ? parseInt(bookData.year, 10) : current.year,
        category: bookData.category || current.category,
        categoryName: catObj ? catObj.name : current.categoryName,
        description: bookData.description !== undefined ? bookData.description.trim() : current.description,
        totalCopies: newTotal,
        shelfLocation: bookData.shelfLocation !== undefined ? bookData.shelfLocation.trim() : current.shelfLocation,
        coverImage: bookData.coverImage && bookData.coverImage.trim() ? bookData.coverImage.trim() : current.coverImage,
        pages: bookData.pages !== undefined ? parseInt(bookData.pages, 10) : current.pages,
        featured: bookData.featured !== undefined ? !!bookData.featured : current.featured
      });

      this.saveRawData(data);
      this.recalculateInventory();
      this.logActivity(`Updated catalog record for "${data.books[index].title}"`, 'edit');

      return { success: true, book: data.books[index] };
    }

    deleteBook(id) {
      const data = this.getRawData();
      if (!data) return { success: false, message: 'Database error' };

      // Verify no active loans exist
      const activeLoan = data.loans.find(l => l.bookId === id && (l.status === 'Borrowed' || l.status === 'Overdue'));
      if (activeLoan) {
        return {
          success: false,
          message: `Cannot delete book while active loan exists (Loan #${activeLoan.id} to ${activeLoan.memberName}).`
        };
      }

      const book = data.books.find(b => b.id === id);
      data.books = data.books.filter(b => b.id !== id);
      data.reservations = data.reservations.filter(r => r.bookId !== id);

      this.saveRawData(data);
      this.logActivity(`Removed book from catalog: "${book ? book.title : id}"`, 'delete');

      return { success: true };
    }

    searchBooks(query = '', filters = {}) {
      let results = [...this.getBooks()];

      if (query && query.trim() !== '') {
        const q = query.trim().toLowerCase();
        results = results.filter(b => 
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.categoryName.toLowerCase().includes(q) ||
          (b.publisher && b.publisher.toLowerCase().includes(q))
        );
      }

      if (filters.category && filters.category !== 'all') {
        results = results.filter(b => b.category === filters.category);
      }

      if (filters.availability) {
        if (filters.availability === 'available') {
          results = results.filter(b => b.availableCopies > 0);
        } else if (filters.availability === 'unavailable') {
          results = results.filter(b => b.availableCopies === 0);
        }
      }

      if (filters.sort) {
        switch (filters.sort) {
          case 'title-asc':
            results.sort((a, b) => a.title.localeCompare(b.title));
            break;
          case 'title-desc':
            results.sort((a, b) => b.title.localeCompare(a.title));
            break;
          case 'author':
            results.sort((a, b) => a.author.localeCompare(b.author));
            break;
          case 'year-new':
            results.sort((a, b) => b.year - a.year);
            break;
          case 'year-old':
            results.sort((a, b) => a.year - b.year);
            break;
          case 'popular':
            results.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || b.rating - a.rating);
            break;
          default:
            break;
        }
      }

      return results;
    }

    /* -------------------------------------------------------------
     * MEMBERSHIP MANAGEMENT
     * -----------------------------------------------------------*/

    getMembers() {
      const data = this.getRawData();
      return data ? data.members : [];
    }

    getMemberById(id) {
      const members = this.getMembers();
      return members.find(m => m.id === id || m.membershipId === id || m.email.toLowerCase() === (id || '').toLowerCase()) || null;
    }

    updateMember(id, memberData) {
      const data = this.getRawData();
      if (!data) return { success: false, message: 'Database error' };

      const index = data.members.findIndex(m => m.id === id);
      if (index === -1) return { success: false, message: 'Member not found' };

      const current = data.members[index];

      // If email changed, ensure unique
      if (memberData.email && memberData.email.toLowerCase() !== current.email.toLowerCase()) {
        const emailTaken = data.members.some(m => m.id !== id && m.email.toLowerCase() === memberData.email.toLowerCase());
        if (emailTaken) {
          return { success: false, message: 'Email address is already used by another member.' };
        }
      }

      data.members[index] = Object.assign({}, current, {
        name: memberData.name !== undefined ? memberData.name.trim() : current.name,
        email: memberData.email !== undefined ? memberData.email.trim().toLowerCase() : current.email,
        phone: memberData.phone !== undefined ? memberData.phone.trim() : current.phone,
        status: memberData.status !== undefined ? memberData.status : current.status,
        avatar: memberData.avatar !== undefined ? memberData.avatar : current.avatar,
        maxBorrowLimit: memberData.maxBorrowLimit !== undefined ? parseInt(memberData.maxBorrowLimit, 10) : current.maxBorrowLimit
      });

      if (memberData.password && memberData.password.trim() !== '') {
        data.members[index].password = memberData.password;
      }

      this.saveRawData(data);

      // Keep current user session synchronized if updated user is currently logged in
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === id) {
        this.setCurrentUser(data.members[index]);
      }

      this.logActivity(`Updated member profile: ${data.members[index].name}`, 'person');
      return { success: true, member: data.members[index] };
    }

    toggleMemberStatus(id) {
      const data = this.getRawData();
      if (!data) return { success: false, message: 'Database error' };

      const member = data.members.find(m => m.id === id);
      if (!member) return { success: false, message: 'Member not found' };

      member.status = member.status === 'Active' ? 'Suspended' : 'Active';
      this.saveRawData(data);
      this.logActivity(`Changed status of ${member.name} to ${member.status}`, 'security');

      return { success: true, status: member.status };
    }

    /* -------------------------------------------------------------
     * BORROWING & LOAN MANAGEMENT
     * -----------------------------------------------------------*/

    getLoans(filter = {}) {
      this.refreshOverdueStatus();
      const data = this.getRawData();
      if (!data) return [];

      let loans = [...data.loans];
      if (filter.memberId) {
        loans = loans.filter(l => l.memberId === filter.memberId);
      }
      if (filter.status) {
        loans = loans.filter(l => l.status === filter.status);
      }
      if (filter.bookId) {
        loans = loans.filter(l => l.bookId === filter.bookId);
      }
      return loans;
    }

    getLoansByMember(memberId) {
      return this.getLoans({ memberId });
    }

    borrowBook(memberId, bookId, customDays = 14) {
      this.refreshOverdueStatus();
      const data = this.getRawData();
      if (!data) return { success: false, message: 'Database error' };

      const member = data.members.find(m => m.id === memberId || m.membershipId === memberId);
      if (!member) {
        return { success: false, message: 'Invalid member account. Please log in first.' };
      }

      if (member.status === 'Suspended') {
        return { success: false, message: 'Your membership is currently suspended. Please visit the help desk.' };
      }

      const book = data.books.find(b => b.id === bookId);
      if (!book) {
        return { success: false, message: 'Book record not found in catalog.' };
      }

      // Check member's active borrowing count
      const activeMemberLoans = data.loans.filter(l => l.memberId === member.id && (l.status === 'Borrowed' || l.status === 'Overdue'));
      const limit = member.maxBorrowLimit || data.meta.maxBorrowLimit || 4;

      if (activeMemberLoans.length >= limit) {
        return {
          success: false,
          message: `Borrowing limit reached. You can borrow a maximum of ${limit} books concurrently.`
        };
      }

      // Prevent duplicate active loan of the same book
      const alreadyBorrowed = activeMemberLoans.some(l => l.bookId === book.id);
      if (alreadyBorrowed) {
        return {
          success: false,
          message: `You currently have an active loan for "${book.title}".`
        };
      }

      // Check available copies
      if (book.availableCopies <= 0) {
        return {
          success: false,
          message: `All copies of "${book.title}" are currently checked out. You can reserve this title instead.`
        };
      }

      const borrowDate = new Date().toISOString().split('T')[0];
      const dueDate = addDays(customDays);

      const newLoan = {
        id: 'loan-' + Math.floor(100 + Math.random() * 900),
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        bookCover: book.coverImage || DEFAULT_COVER,
        memberId: member.id,
        memberName: member.name,
        memberEmail: member.email,
        borrowDate: borrowDate,
        dueDate: dueDate,
        returnDate: null,
        status: 'Borrowed',
        renewCount: 0
      };

      data.loans.unshift(newLoan);

      // If user had a reservation for this book, mark it as fulfilled
      const reservation = data.reservations.find(r => r.memberId === member.id && r.bookId === book.id && (r.status === 'Pending' || r.status === 'Ready for Pickup'));
      if (reservation) {
        reservation.status = 'Fulfilled';
      }

      // Send in-app notification
      data.notifications.unshift({
        id: 'notif-' + Date.now().toString(36),
        userId: member.id,
        title: 'Book Borrowed Successfully',
        message: `You have borrowed "${book.title}". Due date is ${formatShortDate(dueDate)}.`,
        date: borrowDate,
        type: 'success',
        read: false
      });

      this.saveRawData(data);
      this.recalculateInventory();
      this.logActivity(`${member.name} borrowed "${book.title}" (Due: ${dueDate})`, 'menu_book');

      return { success: true, loan: newLoan, message: `"${book.title}" borrowed successfully! Due on ${formatShortDate(dueDate)}.` };
    }

    returnBook(loanId) {
      const data = this.getRawData();
      if (!data) return { success: false, message: 'Database error' };

      const loan = data.loans.find(l => l.id === loanId);
      if (!loan) return { success: false, message: 'Loan transaction not found.' };

      if (loan.status === 'Returned') {
        return { success: false, message: 'This book has already been returned.' };
      }

      const returnDate = new Date().toISOString().split('T')[0];
      loan.returnDate = returnDate;
      loan.status = 'Returned';

      // Notification to member
      data.notifications.unshift({
        id: 'notif-' + Date.now().toString(36),
        userId: loan.memberId,
        title: 'Book Returned',
        message: `Receipt confirmation: "${loan.bookTitle}" was successfully returned on ${formatShortDate(returnDate)}.`,
        date: returnDate,
        type: 'info',
        read: false
      });

      this.saveRawData(data);
      this.recalculateInventory();
      this.logActivity(`${loan.memberName} returned "${loan.bookTitle}"`, 'keyboard_return');

      // Check if another member is waiting for this book via reservation
      this.checkReservationQueue(loan.bookId);

      return { success: true, message: `"${loan.bookTitle}" has been returned and catalog inventory updated.` };
    }

    renewLoan(loanId) {
      const data = this.getRawData();
      if (!data) return { success: false, message: 'Database error' };

      const loan = data.loans.find(l => l.id === loanId);
      if (!loan) return { success: false, message: 'Loan record not found.' };

      if (loan.status === 'Returned') {
        return { success: false, message: 'Cannot renew a returned loan.' };
      }

      if (loan.status === 'Overdue') {
        return { success: false, message: 'Overdue loans cannot be renewed online. Please return the book or contact circulation.' };
      }

      if ((loan.renewCount || 0) >= 1) {
        return { success: false, message: 'Maximum renewal allowance (1 extension) has already been reached for this loan.' };
      }

      // Check if there are active reservations waiting for this book
      const pendingRes = data.reservations.some(r => r.bookId === loan.bookId && r.status === 'Pending');
      if (pendingRes) {
        return { success: false, message: 'Cannot renew: another patron has placed a reservation on this title.' };
      }

      // Extend due date by 14 days
      const currentDue = new Date(loan.dueDate);
      currentDue.setDate(currentDue.getDate() + 14);
      loan.dueDate = currentDue.toISOString().split('T')[0];
      loan.renewCount = (loan.renewCount || 0) + 1;

      data.notifications.unshift({
        id: 'notif-' + Date.now().toString(36),
        userId: loan.memberId,
        title: 'Loan Renewed',
        message: `Loan for "${loan.bookTitle}" renewed. New due date: ${formatShortDate(loan.dueDate)}.`,
        date: new Date().toISOString().split('T')[0],
        type: 'info',
        read: false
      });

      this.saveRawData(data);
      this.logActivity(`${loan.memberName} renewed loan for "${loan.bookTitle}" to ${loan.dueDate}`, 'update');

      return { success: true, dueDate: loan.dueDate, message: `Loan renewed until ${formatShortDate(loan.dueDate)}.` };
    }

    /* -------------------------------------------------------------
     * RESERVATIONS
     * -----------------------------------------------------------*/

    getReservations(filter = {}) {
      const data = this.getRawData();
      if (!data) return [];
      let list = [...data.reservations];
      if (filter.memberId) {
        list = list.filter(r => r.memberId === filter.memberId);
      }
      if (filter.status) {
        list = list.filter(r => r.status === filter.status);
      }
      return list;
    }

    getReservationsByMember(memberId) {
      return this.getReservations({ memberId });
    }

    reserveBook(memberId, bookId) {
      const data = this.getRawData();
      if (!data) return { success: false, message: 'Database error' };

      const member = data.members.find(m => m.id === memberId || m.membershipId === memberId);
      if (!member) {
        return { success: false, message: 'Please log in to place a reservation.' };
      }

      const book = data.books.find(b => b.id === bookId);
      if (!book) {
        return { success: false, message: 'Book not found in catalog.' };
      }

      // Prevent duplicate pending reservation
      const alreadyReserved = data.reservations.some(r => r.memberId === member.id && r.bookId === book.id && (r.status === 'Pending' || r.status === 'Ready for Pickup'));
      if (alreadyReserved) {
        return { success: false, message: `You already have an active reservation for "${book.title}".` };
      }

      // Check if user already has an active loan of this book
      const alreadyLoaned = data.loans.some(l => l.memberId === member.id && l.bookId === book.id && (l.status === 'Borrowed' || l.status === 'Overdue'));
      if (alreadyLoaned) {
        return { success: false, message: `You currently have this book checked out on loan.` };
      }

      const reqDate = new Date().toISOString().split('T')[0];
      const existingQueue = data.reservations.filter(r => r.bookId === book.id && r.status === 'Pending').length;

      const newRes = {
        id: 'res-' + Math.floor(200 + Math.random() * 800),
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        bookCover: book.coverImage || DEFAULT_COVER,
        memberId: member.id,
        memberName: member.name,
        memberEmail: member.email,
        requestDate: reqDate,
        status: book.availableCopies > 0 ? 'Ready for Pickup' : 'Pending',
        priorityQueue: existingQueue + 1
      };

      data.reservations.unshift(newRes);

      data.notifications.unshift({
        id: 'notif-' + Date.now().toString(36),
        userId: member.id,
        title: 'Reservation Confirmed',
        message: `Reservation confirmed for "${book.title}". Status: ${newRes.status}.`,
        date: reqDate,
        type: 'success',
        read: false
      });

      this.saveRawData(data);
      this.recalculateInventory();
      this.logActivity(`${member.name} placed reservation for "${book.title}"`, 'bookmark');

      return {
        success: true,
        reservation: newRes,
        message: `Reservation confirmed for "${book.title}". Priority Queue #${newRes.priorityQueue}.`
      };
    }

    cancelReservation(reservationId) {
      const data = this.getRawData();
      if (!data) return { success: false, message: 'Database error' };

      const res = data.reservations.find(r => r.id === reservationId);
      if (!res) return { success: false, message: 'Reservation record not found.' };

      res.status = 'Cancelled';
      this.saveRawData(data);
      this.recalculateInventory();
      this.logActivity(`Cancelled reservation for "${res.bookTitle}"`, 'cancel');

      return { success: true, message: 'Reservation has been cancelled.' };
    }

    fulfillReservation(reservationId) {
      const data = this.getRawData();
      if (!data) return { success: false, message: 'Database error' };

      const res = data.reservations.find(r => r.id === reservationId);
      if (!res) return { success: false, message: 'Reservation not found.' };

      // Convert reservation into loan
      const loanResult = this.borrowBook(res.memberId, res.bookId);
      if (loanResult.success) {
        res.status = 'Fulfilled';
        this.saveRawData(this.getRawData());
        return { success: true, message: `Reservation fulfilled. Book checked out to ${res.memberName}.` };
      } else {
        return loanResult;
      }
    }

    checkReservationQueue(bookId) {
      const data = this.getRawData();
      if (!data) return;

      const firstPending = data.reservations
        .filter(r => r.bookId === bookId && r.status === 'Pending')
        .sort((a, b) => a.priorityQueue - b.priorityQueue)[0];

      if (firstPending) {
        firstPending.status = 'Ready for Pickup';
        data.notifications.unshift({
          id: 'notif-' + Date.now().toString(36),
          userId: firstPending.memberId,
          title: 'Reserved Book Ready for Pickup',
          message: `"${firstPending.bookTitle}" is now available at the circulation desk for 48 hours.`,
          date: new Date().toISOString().split('T')[0],
          type: 'success',
          read: false
        });
        this.saveRawData(data);
        this.recalculateInventory();
      }
    }

    /* -------------------------------------------------------------
     * NOTIFICATIONS & INQUIRIES & LOGS
     * -----------------------------------------------------------*/

    getNotifications(userId) {
      const data = this.getRawData();
      if (!data) return [];
      return data.notifications.filter(n => n.userId === userId || n.userId === 'all');
    }

    markNotificationAsRead(id) {
      const data = this.getRawData();
      if (!data) return;
      const notif = data.notifications.find(n => n.id === id);
      if (notif) {
        notif.read = true;
        this.saveRawData(data);
      }
    }

    addInquiry(inquiry) {
      const data = this.getRawData();
      if (!data) return { success: false, message: 'Database error' };

      const record = {
        id: 'inq-' + Date.now().toString(36),
        name: inquiry.name.trim(),
        email: inquiry.email.trim(),
        subject: inquiry.subject.trim(),
        category: inquiry.category || 'General',
        message: inquiry.message.trim(),
        date: new Date().toISOString().split('T')[0],
        status: 'Received'
      };

      data.inquiries.unshift(record);
      this.saveRawData(data);
      this.logActivity(`Received visitor inquiry: "${record.subject}" from ${record.name}`, 'mail');

      return { success: true, inquiry: record };
    }

    getInquiries() {
      const data = this.getRawData();
      return data ? data.inquiries : [];
    }

    logActivity(text, icon = 'info') {
      const data = this.getRawData();
      if (!data) return;
      data.activityLogs.unshift({
        id: 'act-' + Date.now().toString(36),
        text: text,
        time: 'Just now',
        icon: icon
      });
      if (data.activityLogs.length > 50) {
        data.activityLogs.pop();
      }
      this.saveRawData(data);
    }

    getActivityLogs() {
      const data = this.getRawData();
      return data ? data.activityLogs : [];
    }

    /* -------------------------------------------------------------
     * AGGREGATE DASHBOARD METRICS & STATISTICS
     * -----------------------------------------------------------*/

    getStatistics() {
      this.refreshOverdueStatus();
      const data = this.getRawData();
      if (!data) return {};

      let totalPhysicalCopies = 0;
      let totalAvailableCopies = 0;

      data.books.forEach(b => {
        totalPhysicalCopies += (b.totalCopies || 0);
        totalAvailableCopies += (b.availableCopies || 0);
      });

      const activeLoans = data.loans.filter(l => l.status === 'Borrowed' || l.status === 'Overdue');
      const overdueLoans = data.loans.filter(l => l.status === 'Overdue');
      const pendingReservations = data.reservations.filter(r => r.status === 'Pending' || r.status === 'Ready for Pickup');
      const activeMembers = data.members.filter(m => m.status === 'Active');

      return {
        totalBookTitles: data.books.length,
        totalPhysicalCopies: totalPhysicalCopies,
        availableCopies: totalAvailableCopies,
        borrowedCopies: activeLoans.length,
        registeredMembers: data.members.length,
        activeMembersCount: activeMembers.length,
        activeLoansCount: activeLoans.length,
        overdueCount: overdueLoans.length,
        pendingReservationsCount: pendingReservations.length
      };
    }

    resetDatabase() {
      this.seedInitialData();
      return { success: true, message: 'Database reset to initial demonstration dataset.' };
    }
  }

  // Expose singleton instance to window
  window.LibraryDB = new LibraryDB();
  window.formatShortDate = formatShortDate;

})(window);

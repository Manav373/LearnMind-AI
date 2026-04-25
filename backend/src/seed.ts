import Concept from './models/Concept';
import Course from './models/Course';

const conceptsData = [
  { name: 'Variables & Data Types', description: 'Understanding primitive types, variables, and type systems in programming.', category: 'Programming Basics', difficulty: 'beginner', order: 1, estimatedMinutes: 8, deps: [] },
  { name: 'Control Flow', description: 'If/else statements, switch cases, and conditional logic patterns.', category: 'Programming Basics', difficulty: 'beginner', order: 2, estimatedMinutes: 10, deps: ['Variables & Data Types'] },
  { name: 'Loops', description: 'For loops, while loops, do-while, and iteration patterns.', category: 'Programming Basics', difficulty: 'beginner', order: 3, estimatedMinutes: 10, deps: ['Control Flow'] },
  { name: 'Functions', description: 'Function declarations, parameters, return values, and scope.', category: 'Programming Basics', difficulty: 'beginner', order: 4, estimatedMinutes: 12, deps: ['Loops'] },
  { name: 'Arrays', description: 'Array data structure, indexing, traversal, and common operations.', category: 'Data Structures', difficulty: 'beginner', order: 5, estimatedMinutes: 10, deps: ['Functions'] },
  { name: 'Strings', description: 'String manipulation, common methods, and pattern matching basics.', category: 'Data Structures', difficulty: 'beginner', order: 6, estimatedMinutes: 10, deps: ['Arrays'] },
  { name: 'Objects & Hash Maps', description: 'Key-value pairs, hash maps, dictionaries, and their applications.', category: 'Data Structures', difficulty: 'intermediate', order: 7, estimatedMinutes: 15, deps: ['Arrays'] },
  { name: 'Recursion', description: 'Recursive thinking, base cases, and recursive problem solving.', category: 'Algorithms', difficulty: 'intermediate', order: 8, estimatedMinutes: 15, deps: ['Functions'] },
  { name: 'Sorting Algorithms', description: 'Bubble sort, merge sort, quicksort — understanding and implementation.', category: 'Algorithms', difficulty: 'intermediate', order: 9, estimatedMinutes: 20, deps: ['Arrays', 'Recursion'] },
  { name: 'Searching Algorithms', description: 'Linear search, binary search, and search optimization techniques.', category: 'Algorithms', difficulty: 'intermediate', order: 10, estimatedMinutes: 15, deps: ['Arrays', 'Sorting Algorithms'] },
  { name: 'Linked Lists', description: 'Singly and doubly linked lists, node operations, and traversal.', category: 'Data Structures', difficulty: 'intermediate', order: 11, estimatedMinutes: 15, deps: ['Objects & Hash Maps'] },
  { name: 'Stacks & Queues', description: 'Stack (LIFO) and Queue (FIFO) data structures and their use cases.', category: 'Data Structures', difficulty: 'intermediate', order: 12, estimatedMinutes: 12, deps: ['Linked Lists'] },
  { name: 'Trees', description: 'Binary trees, BST, tree traversal (inorder, preorder, postorder).', category: 'Data Structures', difficulty: 'advanced', order: 13, estimatedMinutes: 20, deps: ['Recursion', 'Linked Lists'] },
  { name: 'Graphs', description: 'Graph representation, BFS, DFS, and common graph algorithms.', category: 'Data Structures', difficulty: 'advanced', order: 14, estimatedMinutes: 25, deps: ['Trees', 'Stacks & Queues'] },
  { name: 'Dynamic Programming', description: 'Memoization, tabulation, and solving optimization problems.', category: 'Algorithms', difficulty: 'advanced', order: 15, estimatedMinutes: 25, deps: ['Recursion', 'Arrays'] },
  { name: 'Time & Space Complexity', description: 'Big-O notation, analyzing algorithm efficiency, and optimization.', category: 'Algorithms', difficulty: 'intermediate', order: 16, estimatedMinutes: 15, deps: ['Sorting Algorithms', 'Searching Algorithms'] },
];

/**
 * Seeds the database with initial concepts and courses if empty.
 */
export const seedConcepts = async () => {
  const conceptCount = await Concept.countDocuments();
  if (conceptCount === 0) {
    console.log('🌱 Seeding concepts...');
    const created: Record<string, any> = {};
    for (const c of conceptsData) {
      const doc = await Concept.create({
        name: c.name, description: c.description, category: c.category,
        difficulty: c.difficulty as any, order: c.order, estimatedMinutes: c.estimatedMinutes,
      });
      created[c.name] = doc;
    }
    for (const c of conceptsData) {
      if (c.deps.length > 0) {
        const depIds = c.deps.map(d => created[d]?._id).filter(Boolean);
        await Concept.findByIdAndUpdate(created[c.name]._id, { dependencies: depIds });
      }
    }
    console.log(`✅ Seeded ${conceptsData.length} concepts.`);
  }

  const courseCount = await Course.countDocuments();
  if (courseCount === 0) {
    console.log('🌱 Seeding courses...');
    const allConcepts = await Concept.find();
    
    await Course.create([
      {
        title: 'Mastering Programming Fundamentals',
        description: 'From variables to recursion, master the core building blocks of any language.',
        category: 'Programming Basics',
        concepts: allConcepts.filter(c => ['Programming Basics', 'Data Structures'].includes(c.category)).map(c => c._id),
        level: 'beginner',
        thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=60'
      },
      {
        title: 'Advanced Algorithms & Data Structures',
        description: 'Dive deep into graph theory, dynamic programming, and algorithm optimization.',
        category: 'Computer Science',
        concepts: allConcepts.filter(c => ['Algorithms', 'Data Structures'].includes(c.category) && c.difficulty === 'advanced').map(c => c._id),
        level: 'advanced',
        thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60'
      }
    ]);
    console.log('✅ Seeded 2 courses.');
  }
};

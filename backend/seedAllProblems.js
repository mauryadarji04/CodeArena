import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';

dotenv.config();

const problems = [
  // ARRAY
  { problemNumber: 1, title: "Two Sum", difficulty: "Easy", tags: ["array", "hashmap"], problemStatement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", constraints: "• 2 ≤ nums.length ≤ 10⁴\n• -10⁹ ≤ nums[i] ≤ 10⁹", sampleTestCases: [{ input: "[2,7,11,15]\n9", output: "[0,1]" }], hiddenTestCases: [{ input: "[3,2,4]\n6", output: "[1,2]" }] },
  { problemNumber: 2, title: "Campus Pair Finder", difficulty: "Easy", tags: ["array", "hashmap"], problemStatement: "Given an array of student roll numbers and a cutoff score, find two students whose combined score equals the cutoff.", constraints: "• 2 ≤ length ≤ 10⁴\n• 1 ≤ score ≤ 100", sampleTestCases: [{ input: "5\n1 2 3 4 5\n6", output: "1 3" }], hiddenTestCases: [{ input: "4\n10 20 30 40\n50", output: "1 2" }] },
  { problemNumber: 3, title: "Binary Search", difficulty: "Easy", tags: ["array", "binary-search"], problemStatement: "Given a sorted array and target, return the index of target or -1 if not found.", constraints: "• 1 ≤ nums.length ≤ 10⁴\n• All integers unique", sampleTestCases: [{ input: "[-1,0,3,5,9,12]\n9", output: "4" }], hiddenTestCases: [{ input: "[-1,0,3,5,9,12]\n2", output: "-1" }] },
  { problemNumber: 4, title: "Maximum Subarray", difficulty: "Medium", tags: ["array", "dynamic-programming"], problemStatement: "Find the contiguous subarray with the largest sum.", constraints: "• 1 ≤ nums.length ≤ 10⁵\n• -10⁴ ≤ nums[i] ≤ 10⁴", sampleTestCases: [{ input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" }], hiddenTestCases: [{ input: "[5,4,-1,7,8]", output: "23" }] },
  { problemNumber: 5, title: "Rotate Array by K Steps", difficulty: "Medium", tags: ["array", "math"], problemStatement: "Rotate an array to the right by k steps.", constraints: "• 1 ≤ nums.length ≤ 10⁵\n• 0 ≤ k ≤ 10⁵", sampleTestCases: [{ input: "[1,2,3,4,5,6,7]\n3", output: "[5,6,7,1,2,3,4]" }], hiddenTestCases: [{ input: "[-1,-100,3,99]\n2", output: "[3,99,-1,-100]" }] },
  { problemNumber: 6, title: "Find Missing Number", difficulty: "Easy", tags: ["array", "bit-manipulation"], problemStatement: "Given an array containing n distinct numbers from 0 to n, find the missing number.", constraints: "• n == nums.length\n• 1 ≤ n ≤ 10⁴", sampleTestCases: [{ input: "[3,0,1]", output: "2" }], hiddenTestCases: [{ input: "[0,1]", output: "2" }] },
  { problemNumber: 7, title: "Maximum Product Subarray", difficulty: "Medium", tags: ["array", "dynamic-programming"], problemStatement: "Find the contiguous subarray with the largest product.", constraints: "• 1 ≤ nums.length ≤ 2×10⁴\n• -10 ≤ nums[i] ≤ 10", sampleTestCases: [{ input: "[2,3,-2,4]", output: "6" }], hiddenTestCases: [{ input: "[-2,0,-1]", output: "0" }] },
  { problemNumber: 8, title: "Move Zeroes to End", difficulty: "Easy", tags: ["array", "two-pointers"], problemStatement: "Move all zeroes to the end while maintaining relative order of non-zero elements.", constraints: "• 1 ≤ nums.length ≤ 10⁴\n• -2³¹ ≤ nums[i] ≤ 2³¹-1", sampleTestCases: [{ input: "[0,1,0,3,12]", output: "[1,3,12,0,0]" }], hiddenTestCases: [{ input: "[0]", output: "[0]" }] },

  // STRING
  { problemNumber: 9, title: "Valid Parentheses", difficulty: "Easy", tags: ["string", "stack"], problemStatement: "Determine if brackets are valid and properly closed.", constraints: "• 1 ≤ s.length ≤ 10⁴\n• s consists of '()[]{}' only", sampleTestCases: [{ input: "()", output: "true" }, { input: "(]", output: "false" }], hiddenTestCases: [{ input: "{[]}", output: "true" }] },
  { problemNumber: 10, title: "Reverse String", difficulty: "Easy", tags: ["string", "two-pointers"], problemStatement: "Reverse a string in-place with O(1) extra memory.", constraints: "• 1 ≤ s.length ≤ 10⁵", sampleTestCases: [{ input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }], hiddenTestCases: [{ input: '["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }] },
  { problemNumber: 11, title: "First Unique Character", difficulty: "Easy", tags: ["string", "hashmap"], problemStatement: "Find the first non-repeating character and return its index.", constraints: "• 1 ≤ s.length ≤ 10⁵\n• lowercase letters only", sampleTestCases: [{ input: "leetcode", output: "0" }], hiddenTestCases: [{ input: "aabb", output: "-1" }] },
  { problemNumber: 12, title: "Check Palindrome String", difficulty: "Easy", tags: ["string", "two-pointers"], problemStatement: "Check if a string is a palindrome, ignoring non-alphanumeric characters.", constraints: "• 1 ≤ s.length ≤ 2×10⁵", sampleTestCases: [{ input: "A man, a plan, a canal: Panama", output: "true" }], hiddenTestCases: [{ input: "race a car", output: "false" }] },
  { problemNumber: 13, title: "Longest Common Prefix", difficulty: "Easy", tags: ["string"], problemStatement: "Find the longest common prefix string amongst an array of strings.", constraints: "• 1 ≤ strs.length ≤ 200\n• 0 ≤ strs[i].length ≤ 200", sampleTestCases: [{ input: '["flower","flow","flight"]', output: '"fl"' }], hiddenTestCases: [{ input: '["dog","racecar","car"]', output: '""' }] },
  { problemNumber: 14, title: "Anagram Validator", difficulty: "Easy", tags: ["string", "hashmap"], problemStatement: "Check if two strings are anagrams of each other.", constraints: "• 1 ≤ s.length, t.length ≤ 5×10⁴\n• lowercase letters only", sampleTestCases: [{ input: "anagram\nnagaram", output: "true" }], hiddenTestCases: [{ input: "rat\ncar", output: "false" }] },
  { problemNumber: 15, title: "String Compression", difficulty: "Medium", tags: ["string", "two-pointers"], problemStatement: "Compress a string using counts of repeated characters (e.g., 'aabccc' → 'a2b1c3').", constraints: "• 1 ≤ chars.length ≤ 2000", sampleTestCases: [{ input: '["a","a","b","b","c","c","c"]', output: '["a","2","b","2","c","3"]' }], hiddenTestCases: [{ input: '["a"]', output: '["a"]' }] },

  // STACK / QUEUE
  { problemNumber: 16, title: "Implement Queue using Stacks", difficulty: "Easy", tags: ["stack", "queue", "design"], problemStatement: "Implement FIFO queue using only two stacks.", constraints: "• 1 ≤ x ≤ 9\n• At most 100 calls", sampleTestCases: [{ input: '["MyQueue","push","push","peek","pop"]', output: "[null,null,null,1,1]" }], hiddenTestCases: [{ input: '["MyQueue","push","pop"]', output: "[null,null,1]" }] },
  { problemNumber: 17, title: "Next Greater Element", difficulty: "Medium", tags: ["stack", "array"], problemStatement: "For each element, find the next greater element to its right.", constraints: "• 1 ≤ nums.length ≤ 10⁴", sampleTestCases: [{ input: "[4,5,2,10]", output: "[5,10,10,-1]" }], hiddenTestCases: [{ input: "[1,2,1]", output: "[2,-1,-1]" }] },
  { problemNumber: 18, title: "Evaluate Postfix Expression", difficulty: "Medium", tags: ["stack"], problemStatement: "Evaluate the value of an arithmetic expression in Reverse Polish Notation.", constraints: "• 1 ≤ tokens.length ≤ 10⁴", sampleTestCases: [{ input: '["2","1","+","3","*"]', output: "9" }], hiddenTestCases: [{ input: '["4","13","5","/","+"]', output: "6" }] },
  { problemNumber: 19, title: "Stack Using Single Queue", difficulty: "Medium", tags: ["stack", "queue"], problemStatement: "Implement a LIFO stack using only one queue.", constraints: "• 1 ≤ x ≤ 9\n• At most 100 calls", sampleTestCases: [{ input: '["MyStack","push","push","top","pop"]', output: "[null,null,null,2,2]" }], hiddenTestCases: [{ input: '["MyStack","push","pop"]', output: "[null,null,1]" }] },
  { problemNumber: 20, title: "Minimum Stack Design", difficulty: "Medium", tags: ["stack", "design"], problemStatement: "Design a stack that supports push, pop, top, and retrieving minimum element in O(1).", constraints: "• -2³¹ ≤ val ≤ 2³¹-1\n• At most 3×10⁴ calls", sampleTestCases: [{ input: '["MinStack","push","push","push","getMin"]', output: "[null,null,null,null,-2]" }], hiddenTestCases: [{ input: '["MinStack","push","getMin"]', output: "[null,null,0]" }] },

  // LINKED LIST
  { problemNumber: 21, title: "Merge Two Sorted Lists", difficulty: "Easy", tags: ["linked-list", "recursion"], problemStatement: "Merge two sorted linked lists into one sorted list.", constraints: "• [0, 50] nodes\n• -100 ≤ Node.val ≤ 100", sampleTestCases: [{ input: "[1,2,4]\n[1,3,4]", output: "[1,1,2,3,4,4]" }], hiddenTestCases: [{ input: "[]\n[]", output: "[]" }] },
  { problemNumber: 22, title: "Reverse Linked List", difficulty: "Easy", tags: ["linked-list", "recursion"], problemStatement: "Reverse a singly linked list.", constraints: "• [0, 5000] nodes\n• -5000 ≤ Node.val ≤ 5000", sampleTestCases: [{ input: "[1,2,3,4,5]", output: "[5,4,3,2,1]" }], hiddenTestCases: [{ input: "[1,2]", output: "[2,1]" }] },
  { problemNumber: 23, title: "Detect Loop in Linked List", difficulty: "Easy", tags: ["linked-list", "two-pointers"], problemStatement: "Detect if a linked list has a cycle using Floyd's algorithm.", constraints: "• [0, 10⁴] nodes", sampleTestCases: [{ input: "[3,2,0,-4], pos=1", output: "true" }], hiddenTestCases: [{ input: "[1], pos=-1", output: "false" }] },
  { problemNumber: 24, title: "Find Middle of Linked List", difficulty: "Easy", tags: ["linked-list", "two-pointers"], problemStatement: "Find the middle node of a linked list.", constraints: "• [1, 100] nodes", sampleTestCases: [{ input: "[1,2,3,4,5]", output: "[3,4,5]" }], hiddenTestCases: [{ input: "[1,2,3,4,5,6]", output: "[4,5,6]" }] },

  // RECURSION / BACKTRACKING
  { problemNumber: 25, title: "Climbing Stairs", difficulty: "Easy", tags: ["dynamic-programming", "recursion"], problemStatement: "Count distinct ways to climb n stairs (1 or 2 steps at a time).", constraints: "• 1 ≤ n ≤ 45", sampleTestCases: [{ input: "2", output: "2" }, { input: "3", output: "3" }], hiddenTestCases: [{ input: "5", output: "8" }] },
  { problemNumber: 26, title: "Generate All Subsets", difficulty: "Medium", tags: ["recursion", "backtracking"], problemStatement: "Generate all possible subsets (power set) of a given set.", constraints: "• 1 ≤ nums.length ≤ 10", sampleTestCases: [{ input: "[1,2,3]", output: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]" }], hiddenTestCases: [{ input: "[0]", output: "[[],[0]]" }] },
  { problemNumber: 27, title: "Tower of Hanoi", difficulty: "Medium", tags: ["recursion"], problemStatement: "Solve Tower of Hanoi puzzle - move n disks from source to destination.", constraints: "• 1 ≤ n ≤ 15", sampleTestCases: [{ input: "3", output: "7 moves" }], hiddenTestCases: [{ input: "4", output: "15 moves" }] },
  { problemNumber: 28, title: "Permutations of a String", difficulty: "Medium", tags: ["recursion", "backtracking"], problemStatement: "Generate all permutations of a string.", constraints: "• 1 ≤ s.length ≤ 6", sampleTestCases: [{ input: "abc", output: '["abc","acb","bac","bca","cab","cba"]' }], hiddenTestCases: [{ input: "ab", output: '["ab","ba"]' }] },

  // DYNAMIC PROGRAMMING
  { problemNumber: 29, title: "Fibonacci with Memoization", difficulty: "Easy", tags: ["dynamic-programming", "recursion"], problemStatement: "Calculate nth Fibonacci number using memoization.", constraints: "• 0 ≤ n ≤ 30", sampleTestCases: [{ input: "4", output: "3" }], hiddenTestCases: [{ input: "10", output: "55" }] },
  { problemNumber: 30, title: "House Robber Problem", difficulty: "Medium", tags: ["dynamic-programming"], problemStatement: "Rob houses to maximize money without robbing adjacent houses.", constraints: "• 1 ≤ nums.length ≤ 100\n• 0 ≤ nums[i] ≤ 400", sampleTestCases: [{ input: "[1,2,3,1]", output: "4" }], hiddenTestCases: [{ input: "[2,7,9,3,1]", output: "12" }] },
  { problemNumber: 31, title: "Minimum Cost Climbing Stairs", difficulty: "Easy", tags: ["dynamic-programming"], problemStatement: "Find minimum cost to reach the top of stairs.", constraints: "• 2 ≤ cost.length ≤ 1000\n• 0 ≤ cost[i] ≤ 999", sampleTestCases: [{ input: "[10,15,20]", output: "15" }], hiddenTestCases: [{ input: "[1,100,1,1,1,100,1,1,99,1]", output: "6" }] },

  // BINARY SEARCH
  { problemNumber: 32, title: "First and Last Occurrence", difficulty: "Medium", tags: ["array", "binary-search"], problemStatement: "Find first and last position of target in sorted array.", constraints: "• 0 ≤ nums.length ≤ 10⁵", sampleTestCases: [{ input: "[5,7,7,8,8,10]\n8", output: "[3,4]" }], hiddenTestCases: [{ input: "[5,7,7,8,8,10]\n6", output: "[-1,-1]" }] },
  { problemNumber: 33, title: "Search in Rotated Sorted Array", difficulty: "Medium", tags: ["array", "binary-search"], problemStatement: "Search for target in a rotated sorted array.", constraints: "• 1 ≤ nums.length ≤ 5000", sampleTestCases: [{ input: "[4,5,6,7,0,1,2]\n0", output: "4" }], hiddenTestCases: [{ input: "[4,5,6,7,0,1,2]\n3", output: "-1" }] },

  // TREE
  { problemNumber: 34, title: "Binary Tree Inorder Traversal", difficulty: "Easy", tags: ["tree", "dfs"], problemStatement: "Return inorder traversal of binary tree nodes.", constraints: "• [0, 100] nodes", sampleTestCases: [{ input: "[1,null,2,3]", output: "[1,3,2]" }], hiddenTestCases: [{ input: "[]", output: "[]" }] },
  { problemNumber: 35, title: "Maximum Depth of Binary Tree", difficulty: "Easy", tags: ["tree", "recursion"], problemStatement: "Find the maximum depth of a binary tree.", constraints: "• [0, 10⁴] nodes", sampleTestCases: [{ input: "[3,9,20,null,null,15,7]", output: "3" }], hiddenTestCases: [{ input: "[1,null,2]", output: "2" }] },
  { problemNumber: 36, title: "Check Symmetric Tree", difficulty: "Easy", tags: ["tree", "recursion"], problemStatement: "Check if a binary tree is symmetric around its center.", constraints: "• [1, 1000] nodes", sampleTestCases: [{ input: "[1,2,2,3,4,4,3]", output: "true" }], hiddenTestCases: [{ input: "[1,2,2,null,3,null,3]", output: "false" }] },

  // GRAPH
  { problemNumber: 37, title: "Breadth First Search (BFS)", difficulty: "Medium", tags: ["graph", "bfs"], problemStatement: "Implement BFS traversal on a graph.", constraints: "• 1 ≤ nodes ≤ 100", sampleTestCases: [{ input: "[[1,2],[3],[3],[]]", output: "[0,1,2,3]" }], hiddenTestCases: [{ input: "[[1],[]]", output: "[0,1]" }] },
  { problemNumber: 38, title: "Depth First Search (DFS)", difficulty: "Medium", tags: ["graph", "dfs"], problemStatement: "Implement DFS traversal on a graph.", constraints: "• 1 ≤ nodes ≤ 100", sampleTestCases: [{ input: "[[1,2],[3],[3],[]]", output: "[0,1,3,2]" }], hiddenTestCases: [{ input: "[[1],[]]", output: "[0,1]" }] },

  // GREEDY / MISC
  { problemNumber: 39, title: "Activity Selection Problem", difficulty: "Medium", tags: ["greedy"], problemStatement: "Select maximum number of non-overlapping activities.", constraints: "• 1 ≤ n ≤ 10⁵", sampleTestCases: [{ input: "start=[1,3,0,5,8,5]\nend=[2,4,6,7,9,9]", output: "4" }], hiddenTestCases: [{ input: "start=[1]\nend=[2]", output: "1" }] },
  { problemNumber: 40, title: "Best Time to Buy and Sell Stock", difficulty: "Easy", tags: ["array", "greedy"], problemStatement: "Find maximum profit from buying and selling stock once.", constraints: "• 1 ≤ prices.length ≤ 10⁵\n• 0 ≤ prices[i] ≤ 10⁴", sampleTestCases: [{ input: "[7,1,5,3,6,4]", output: "5" }], hiddenTestCases: [{ input: "[7,6,4,3,1]", output: "0" }] }
];

const seedProblems = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    await Problem.deleteMany({});
    console.log('Cleared existing problems');
    
    await Problem.insertMany(problems);
    console.log(`Seeded ${problems.length} problems`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding problems:', error);
    process.exit(1);
  }
};

seedProblems();

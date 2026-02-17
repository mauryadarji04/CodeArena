import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';

dotenv.config();

const problems = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["array", "hashmap"],
    problemStatement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    constraints: "• 2 ≤ nums.length ≤ 10⁴\n• -10⁹ ≤ nums[i] ≤ 10⁹\n• -10⁹ ≤ target ≤ 10⁹\n• Only one valid answer exists",
    sampleTestCases: [
      { input: "[2,7,11,15]\n9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." }
    ],
    hiddenTestCases: [
      { input: "[3,2,4]\n6", output: "[1,2]" },
      { input: "[3,3]\n6", output: "[0,1]" }
    ]
  },
  {
    title: "Campus Pair Finder",
    difficulty: "Easy",
    tags: ["array", "hashmap"],
    problemStatement: "Given an array of student roll numbers and a cutoff score, find two students whose combined score equals the cutoff. Return the indices of these two students.",
    constraints: "• 2 ≤ rollNumbers.length ≤ 10⁴\n• 1 ≤ rollNumbers[i] ≤ 100\n• 1 ≤ cutoff ≤ 200\n• Exactly one valid pair exists",
    sampleTestCases: [
      { input: "5\n1 2 3 4 5\n6", output: "1 3", explanation: "Students at index 1 (score 2) and index 3 (score 4) have combined score of 6." }
    ],
    hiddenTestCases: [
      { input: "4\n10 20 30 40\n50", output: "1 2" }
    ]
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["string", "stack"],
    problemStatement: "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
    constraints: "• 1 ≤ s.length ≤ 10⁴\n• s consists of parentheses only '()[]{}'",
    sampleTestCases: [
      { input: "()", output: "true", explanation: "The string has valid matching parentheses." },
      { input: "()[]{}", output: "true", explanation: "All brackets are properly matched." },
      { input: "(]", output: "false", explanation: "Mismatched bracket types." }
    ],
    hiddenTestCases: [
      { input: "([)]", output: "false" },
      { input: "{[]}", output: "true" }
    ]
  },
  {
    title: "Reverse String",
    difficulty: "Easy",
    tags: ["string", "two-pointers"],
    problemStatement: "Write a function that reverses a string. The input string is given as an array of characters. You must do this by modifying the input array in-place with O(1) extra memory.",
    constraints: "• 1 ≤ s.length ≤ 10⁵\n• s[i] is a printable ascii character",
    sampleTestCases: [
      { input: '["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: "The string 'hello' is reversed to 'olleh'." }
    ],
    hiddenTestCases: [
      { input: '["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
    ]
  },
  {
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["array", "dynamic-programming"],
    problemStatement: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
    constraints: "• 1 ≤ nums.length ≤ 10⁵\n• -10⁴ ≤ nums[i] ≤ 10⁴",
    sampleTestCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "[4,-1,2,1] has the largest sum = 6." }
    ],
    hiddenTestCases: [
      { input: "[1]", output: "1" },
      { input: "[5,4,-1,7,8]", output: "23" }
    ]
  },
  {
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["linked-list", "recursion"],
    problemStatement: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list. The list should be made by splicing together the nodes of the first two lists. Return the head of the merged linked list.",
    constraints: "• The number of nodes in both lists is in the range [0, 50]\n• -100 ≤ Node.val ≤ 100\n• Both list1 and list2 are sorted in non-decreasing order",
    sampleTestCases: [
      { input: "[1,2,4]\n[1,3,4]", output: "[1,1,2,3,4,4]", explanation: "Merging [1,2,4] and [1,3,4] results in [1,1,2,3,4,4]." }
    ],
    hiddenTestCases: [
      { input: "[]\n[]", output: "[]" },
      { input: "[]\n[0]", output: "[0]" }
    ]
  },
  {
    title: "Binary Search",
    difficulty: "Easy",
    tags: ["array", "binary-search"],
    problemStatement: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
    constraints: "• 1 ≤ nums.length ≤ 10⁴\n• -10⁴ < nums[i], target < 10⁴\n• All integers in nums are unique\n• nums is sorted in ascending order",
    sampleTestCases: [
      { input: "[-1,0,3,5,9,12]\n9", output: "4", explanation: "9 exists in nums and its index is 4." }
    ],
    hiddenTestCases: [
      { input: "[-1,0,3,5,9,12]\n2", output: "-1" }
    ]
  },
  {
    title: "First Unique Character",
    difficulty: "Easy",
    tags: ["string", "hashmap"],
    problemStatement: "Given a string s, find the first non-repeating character in it and return its index. If it does not exist, return -1.",
    constraints: "• 1 ≤ s.length ≤ 10⁵\n• s consists of only lowercase English letters",
    sampleTestCases: [
      { input: "leetcode", output: "0", explanation: "The first non-repeating character is 'l' at index 0." },
      { input: "loveleetcode", output: "2", explanation: "The first non-repeating character is 'v' at index 2." }
    ],
    hiddenTestCases: [
      { input: "aabb", output: "-1" }
    ]
  },
  {
    title: "Implement Queue using Stacks",
    difficulty: "Easy",
    tags: ["stack", "queue", "design"],
    problemStatement: "Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).",
    constraints: "• 1 ≤ x ≤ 9\n• At most 100 calls will be made to push, pop, peek, and empty\n• All calls to pop and peek are valid",
    sampleTestCases: [
      { input: '["MyQueue","push","push","peek","pop","empty"]\n[[],[1],[2],[],[],[]]', output: "[null,null,null,1,1,false]", explanation: "Queue operations work as expected." }
    ],
    hiddenTestCases: [
      { input: '["MyQueue","push","pop","empty"]\n[[],[1],[],[]]', output: "[null,null,1,true]" }
    ]
  },
  {
    title: "Climbing Stairs",
    difficulty: "Easy",
    tags: ["dynamic-programming", "recursion"],
    problemStatement: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    constraints: "• 1 ≤ n ≤ 45",
    sampleTestCases: [
      { input: "2", output: "2", explanation: "There are two ways: 1+1 or 2." },
      { input: "3", output: "3", explanation: "There are three ways: 1+1+1, 1+2, or 2+1." }
    ],
    hiddenTestCases: [
      { input: "5", output: "8" }
    ]
  }
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

# Adding Problems to CodeArena

## Quick Start

### 1. Seed Initial Problems
Run this command from the backend directory:
```bash
node seedProblems.js
```

This will add 10 sample problems to your database.

### 2. Add More Problems via API

**Endpoint:** POST `/api/problems`

**Example Request:**
```javascript
fetch('http://localhost:3001/api/problems', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Reverse Linked List",
    difficulty: "Easy",
    tags: ["linked-list", "recursion"],
    problemStatement: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    constraints: "• The number of nodes in the list is the range [0, 5000]\n• -5000 ≤ Node.val ≤ 5000",
    sampleTestCases: [
      {
        input: "[1,2,3,4,5]",
        output: "[5,4,3,2,1]",
        explanation: "Reverse the linked list."
      }
    ],
    hiddenTestCases: [
      { input: "[1,2]", output: "[2,1]" },
      { input: "[]", output: "[]" }
    ]
  })
})
```

## Problem Categories to Add (20-30 problems)

### Arrays (5-7 problems)
- Two Sum ✓
- Campus Pair Finder ✓
- Maximum Subarray ✓
- Binary Search ✓
- Rotate Array
- Contains Duplicate
- Product of Array Except Self

### Strings (4-5 problems)
- Valid Parentheses ✓
- Reverse String ✓
- First Unique Character ✓
- Valid Anagram
- Longest Substring Without Repeating Characters

### Stack/Queue (3-4 problems)
- Implement Queue using Stacks ✓
- Min Stack
- Valid Parentheses (uses stack) ✓
- Evaluate Reverse Polish Notation

### Linked List (3-4 problems)
- Merge Two Sorted Lists ✓
- Reverse Linked List
- Linked List Cycle
- Remove Nth Node From End

### Recursion (2-3 problems)
- Climbing Stairs ✓
- Fibonacci Number
- Power of Two

### Dynamic Programming (2-3 problems)
- Climbing Stairs ✓
- House Robber
- Coin Change

## Problem Template

```javascript
{
  title: "Problem Title",
  difficulty: "Easy" | "Medium" | "Hard",
  tags: ["tag1", "tag2"],
  problemStatement: "Clear problem description...",
  constraints: "• Constraint 1\n• Constraint 2",
  sampleTestCases: [
    {
      input: "input format",
      output: "expected output",
      explanation: "why this output (optional)"
    }
  ],
  hiddenTestCases: [
    { input: "test input", output: "expected output" }
  ]
}
```

## Tips for Creating Problems

1. **Rewrite existing problems** - Take inspiration from LeetCode/HackerRank but rewrite in your own words
2. **Change the story** - Same algorithm, different context (e.g., "Two Sum" → "Campus Pair Finder")
3. **Adjust difficulty** - Modify constraints to make easier/harder
4. **Add real-world context** - Use college/campus scenarios for relatability
5. **Test thoroughly** - Ensure sample and hidden test cases cover edge cases

## Sources for Problem Ideas (Legal)
- Codeforces problem statements (rewrite in your own words)
- GeeksforGeeks practice problems (adapt, don't copy)
- University DSA lab assignments
- Competitive programming blogs
- HackerEarth practice sections

## Current Problems in Database
1. Two Sum (Easy)
2. Campus Pair Finder (Easy)
3. Valid Parentheses (Easy)
4. Reverse String (Easy)
5. Maximum Subarray (Medium)
6. Merge Two Sorted Lists (Easy)
7. Binary Search (Easy)
8. First Unique Character (Easy)
9. Implement Queue using Stacks (Easy)
10. Climbing Stairs (Easy)

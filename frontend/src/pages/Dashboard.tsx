import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Send } from 'lucide-react'

export default function Dashboard() {
  const [code, setCode] = useState('// Write your solution here\nfunction twoSum(nums, target) {\n    \n}')

  const handleSubmit = () => {
    console.log('Submitted code:', code)
    alert('Code submitted!')
  }

  const handleRun = () => {
    console.log('Running code:', code)
    alert('Code executed!')
  }

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Left Panel - Question */}
      <div className="w-1/2 border-r border-border overflow-y-auto">
        <div className="p-6 h-full">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-3">Two Sum</h1>
            <span className="bg-green-500/20 text-green-600 px-3 py-1 rounded-full text-sm font-medium">Easy</span>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Problem Statement</h3>
              <p className="text-muted-foreground leading-relaxed">
                Given an array of integers <code className="bg-muted px-2 py-1 rounded text-sm">nums</code> and an integer <code className="bg-muted px-2 py-1 rounded text-sm">target</code>, 
                return indices of the two numbers such that they add up to target.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Example</h3>
              <div className="bg-muted/50 p-4 rounded-lg border">
                <div className="font-mono text-sm space-y-1">
                  <div><span className="font-semibold">Input:</span> nums = [2,7,11,15], target = 9</div>
                  <div><span className="font-semibold">Output:</span> [0,1]</div>
                  <div><span className="font-semibold">Explanation:</span> Because nums[0] + nums[1] == 9, we return [0, 1].</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Constraints</h3>
              <ul className="text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>2 ≤ nums.length ≤ 10⁴</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>-10⁹ ≤ nums[i] ≤ 10⁹</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>-10⁹ ≤ target ≤ 10⁹</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Only one valid answer exists</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div className="w-1/2 flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Code Editor</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRun}>
                <Play className="w-4 h-4 mr-2" />
                Run
              </Button>
              <Button size="sm" onClick={handleSubmit}>
                <Send className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-4">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-full bg-muted/50 border border-border rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Write your code here..."
          />
        </div>
      </div>
    </div>
  )
}
/**
 * Recruitment Chat Evaluation Script
 *
 * Run with: npx ts-node evals/run-eval.ts
 * Or: npx tsx evals/run-eval.ts
 */

import { goldenQASet, evaluateResponse, GoldenQA } from './recruitment-golden-qa'

const API_URL = process.env.API_URL || 'http://localhost:3001/api/chat'

interface EvalResult {
  id: string
  question: string
  passed: boolean
  score: number
  missing: string[]
  violations: string[]
  response: string
  responseTime: number
}

async function sendQuestion(question: string): Promise<{ response: string; time: number }> {
  const start = Date.now()

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: question }],
      mode: 'recruit',
    }),
  })

  const data = await res.json()
  const time = Date.now() - start

  return { response: data.message || '', time }
}

async function runEval(qa: GoldenQA): Promise<EvalResult> {
  console.log(`  Testing: ${qa.id}...`)

  const { response, time } = await sendQuestion(qa.question)
  const result = evaluateResponse(response, qa)

  return {
    id: qa.id,
    question: qa.question,
    passed: result.passed,
    score: result.score,
    missing: result.missing,
    violations: result.violations,
    response,
    responseTime: time,
  }
}

function printReport(results: EvalResult[]) {
  console.log('\n' + '='.repeat(60))
  console.log('📊 RECRUITMENT CHAT EVALUATION REPORT')
  console.log('='.repeat(60) + '\n')

  // Summary
  const passed = results.filter((r) => r.passed).length
  const total = results.length
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / total
  const avgTime = results.reduce((sum, r) => sum + r.responseTime, 0) / total

  console.log(`✅ Passed: ${passed}/${total} (${Math.round((passed / total) * 100)}%)`)
  console.log(`📈 Average Score: ${(avgScore * 100).toFixed(1)}%`)
  console.log(`⏱️  Average Response Time: ${Math.round(avgTime)}ms`)
  console.log('')

  // Detailed results
  console.log('-'.repeat(60))
  console.log('DETAILED RESULTS')
  console.log('-'.repeat(60))

  for (const r of results) {
    const status = r.passed ? '✅ PASS' : '❌ FAIL'
    console.log(`\n${status} | ${r.id} | Score: ${(r.score * 100).toFixed(0)}%`)
    console.log(`   Q: "${r.question.slice(0, 50)}..."`)

    if (r.missing.length > 0) {
      console.log(`   ⚠️  Missing: ${r.missing.join(', ')}`)
    }
    if (r.violations.length > 0) {
      console.log(`   🚫 Violations: ${r.violations.join(', ')}`)
    }
  }

  // Failed tests detail
  const failed = results.filter((r) => !r.passed)
  if (failed.length > 0) {
    console.log('\n' + '-'.repeat(60))
    console.log('FAILED TEST RESPONSES')
    console.log('-'.repeat(60))

    for (const r of failed) {
      console.log(`\n❌ ${r.id}`)
      console.log(`Question: ${r.question}`)
      console.log(`Response:\n${r.response.slice(0, 500)}...`)
      console.log(`Missing: ${r.missing.join(', ')}`)
      console.log(`Violations: ${r.violations.join(', ')}`)
    }
  }

  // Format check
  console.log('\n' + '-'.repeat(60))
  console.log('FORMAT CHECKS')
  console.log('-'.repeat(60))

  for (const r of results) {
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(r.response)
    const hasBullets = r.response.includes('•') || r.response.includes('- ')
    const hasFollowUp = r.response.toLowerCase().includes('want to know more')
    const wordCount = r.response.split(/\s+/).length

    const formatStatus = hasEmoji && hasBullets && hasFollowUp ? '✅' : '⚠️'
    console.log(
      `${formatStatus} ${r.id}: emoji=${hasEmoji ? '✓' : '✗'} bullets=${hasBullets ? '✓' : '✗'} followUp=${hasFollowUp ? '✓' : '✗'} words=${wordCount}`
    )
  }

  console.log('\n' + '='.repeat(60))
  console.log('END OF REPORT')
  console.log('='.repeat(60) + '\n')
}

async function main() {
  console.log('🚀 Starting Recruitment Chat Evaluation...\n')
  console.log(`API URL: ${API_URL}`)
  console.log(`Test cases: ${goldenQASet.length}\n`)

  const results: EvalResult[] = []

  for (const qa of goldenQASet) {
    try {
      const result = await runEval(qa)
      results.push(result)
    } catch (error) {
      console.error(`  ❌ Error testing ${qa.id}:`, error)
      results.push({
        id: qa.id,
        question: qa.question,
        passed: false,
        score: 0,
        missing: ['ERROR'],
        violations: [],
        response: `Error: ${error}`,
        responseTime: 0,
      })
    }
  }

  printReport(results)

  // Exit with error code if any tests failed
  const allPassed = results.every((r) => r.passed)
  process.exit(allPassed ? 0 : 1)
}

main()

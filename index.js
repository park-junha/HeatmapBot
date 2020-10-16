const { Octokit } = require('@octokit/core')
const _ = require('lodash')

const owner = process.env.OWNER
const repo = process.env.REPO
const token = process.env.TOKEN

if (_.isUndefined(owner)) {
  console.error('FATAL: env var OWNER is undefined')
  process.exit(1)
}

if (_.isUndefined(repo)) {
  console.error('FATAL: env var REPO is undefined')
  process.exit(1)
}

if (_.isUndefined(token)) {
  console.error('FATAL: env var TOKEN is undefined')
  process.exit(1)
}

const octokit = new Octokit({
  auth: token
})

octokit.request('POST /repos/{owner}/{repo}/issues', {
  owner: owner,
  repo: repo,
  title: Number(new Date()).toString()
})
.then((res) => {
  console.log(`Created new issue ${res.data.number}`)
  console.log(`Response:\n${JSON.stringify(res, null, 2)}`)
  const issueNumber = res.data.number
  return octokit.request(
    'PATCH /repos/{owner}/{repo}/issues/{issue_number}', {
    owner: owner,
    repo: repo,
    issue_number: issueNumber,
    state: 'closed'
  })
})
.then((res) => {
  if (!_.isUndefined(res.data.state) && res.data.state === 'closed') {
    console.log(`Successfully closed issue ${res.data.number}`)
    console.log(`Response:\n${JSON.stringify(res, null, 2)}`)
  } else {
    throw 'Failed to close issue opened by script'
  }
})
.catch((err) => {
  console.error(`FATAL: ${err}`)
})

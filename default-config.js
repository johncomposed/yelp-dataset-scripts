module.exports = {
  knex: {
    client: 'pg',
    connection: {
    },

    searchPath: 'knex,public'
  },
  limit: 10000,
  start: 0,
  checks: [
    'countReviewsInSentences'
  ]
}

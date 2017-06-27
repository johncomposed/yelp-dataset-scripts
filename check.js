const config = require('./config');
const fs = require('fs');

const knex = require('knex')(config.knex);

const checkFns = {
  countReviewsInSentences,
  lastSentenceRows,
  findSentenceRows
}

config.checks.forEach(fn => checkFns[fn] ? checkFns[fn]() : console.log('Err - not found:', fn));

function countReviewsInSentences() {
  knex('sentences')
  .countDistinct('review_id')
  .then(n => {
    console.log('distinct review_ids', n)
  })
}


function lastSentenceRows() {
  knex('sentences')
  .count('id')
  .then(n => {
    let max = n[0]['count("id")'];
    console.log('Max:', max); // 35 324 302

    knex
      .select('sentence', 'id')
      .from('sentences')
      .offset(max - 10)
      .limit(11)
      .then(rows => {
        console.log('Last rows', rows)
        return 'ok'
      })
    
  })
}



function findSentenceRows() {
  let review_limit = 5;

  knex
  .select('review_id', 'text')
  .from('reviews')
  .limit(review_limit)
  .offset(4153150 - review_limit)
  .then(rows => {
    console.log(rows)
    let ids = rows.map(r => r.review_id);
    let sentences = knex
      .select('review_id', 'sentence')
      .from('reviews')
      .where('review_id', ids[0])

    let find_sentences = ids.slice(0, -1).reduce((s, id) => {
      return s.orWhere({'review_id': id})
    }, sentences);

    return find_sentences.then(s_rows => {
      console.log('S_ROWS', s_rows);
    });


  })

}

const config = require('./config');

const fs = require('fs');
const tokenizer = require('sbd');
const R = require('rambda');
const knex = require('knex')(config.knex);

const { 
  limit, // 10000
  start  // 0, //1221000 // 3251000
} = config;


function flatMap(arr, lambda) {
  return Array.prototype.concat.apply([], arr.map(lambda)); 
}


function timeout(sentences) {
  return new Promise(function(resolve, reject) {
    console.log(sentences);
    setTimeout(resolve, 2000);
    return sentences;
  });
}

function insert(sentences) {
  return knex.batchInsert('sentences', sentences, 50);
}

function unSanitize(text) {
  return (text||"")
  .replace(/\([^()]*\)/gm, ' ') // Stuff inside parens isn't very useful
  .replace(/(&quot;|&comma;|&apos;|\\n)/g, match => {
    switch(match) {
      case '&quot;': return '"';
      case "&comma;": return ',';
      case "&apos;": return "'";
      case "\\n": return "\n";
    }
  })
}


function makeSentences(offset, max) {
  return knex
    .select()
    .from('reviews')
    .limit(limit)
    .offset(offset)
    .then(rows => {
      let sentences = flatMap(rows, (cols) => {
        return tokenizer
          .sentences(unSanitize(cols.text), {newline_boundaries: true})
          .map((sentence, sentence_index) => Object.assign(
            R.omit(['text'], cols),
            { 
              id: `${cols.review_id}_${sentence_index}`,
              sentence_index,
              sentence
            }))
      })

      return insert(sentences)
        .then(ids => { 
          console.log(`Inserted ${offset} - ${offset + limit}`);
          if(offset < max) makeSentences(offset + limit, max);
        })
    })
}





// Go!
knex('reviews').count('review_id').then(max => {
  console.log('Max rows:', max); // 4153150  // 4153150
  makeSentences(start, max[0]['count("review_id")'])
})




var sampleSql = `SELECT TOP 1000 [Category], [Amount] FROM dbo.Table
WHERE X = Y AND [Amount] = 3 ORDER BY Name DESC`

var mongoQuery = 'db.'

sampleSql = sampleSql.toLowerCase()
  .replace(/\[/g, '')
  .replace(/\]/g, '')
  .replace('dbo.', '')
  .replace('\n', ' ')
console.log(sampleSql)
// FROM <table> 	            1.
if (sampleSql.includes('join')) {
  mongoQuery += sampleSql.substring(sampleSql.indexOf(' from ') + 5, sampleSql.indexOf(' join '))
                         .replace(' ', '')
  // mongoQuery += sampleSql.substring(sampleSql.indexOf(' join ') + 5, sampleSql.indexOf(' on '))
  // how to handle joins?
} else {
  mongoQuery += sampleSql.substring(sampleSql.indexOf(' from ') + 5, sampleSql.indexOf(' where '))
                         .replace(' ', '')
}

// Determine query type 	    1.5.
if (sampleSql.startsWith('select')) {
  mongoQuery += '.find({ '
} else if (sampleSql.startsWith('insert')) {
  mongoQuery += '.insert'
} else if (sampleSql.startsWith('update')) {
  mongoQuery += '.update'
} else if (sampleSql.startsWith('delete')) {
  mongoQuery += '.delete'
} else {
  console.log('invalid query')
}

// WHERE <predicate on rows> 	  2.
var whereClause = ''

if (sampleSql.includes('group by')) {
  whereClause = sampleSql.substring(sampleSql.indexOf(' where ') + 6, sampleSql.indexOf(' group by '))
} else if (sampleSql.includes('order by')) {
  whereClause = sampleSql.substring(sampleSql.indexOf(' where ') + 6, sampleSql.indexOf(' order by '))
} else {
  whereClause = sampleSql.substring(sampleSql.indexOf(' where ') + 6)
}

if (whereClause.includes(' and ')) {
  mongoQuery += whereClause.replace(/=/g, ':').replace(/ and /g, ', ').trimStart().trimEnd()
} else {
  mongoQuery += whereClause.replace('=', ':').trimStart().trimEnd()
}

// GROUP BY <columns> 	        3.
// HAVING <predicate on groups> 4.

// SELECT <columns> 	          5.
var columns = sampleSql.substring(sampleSql.indexOf('select ') + 7, sampleSql.indexOf(' from '))
                       .replace(/top [0-9]+/g, '')
                       .replace(' ', '')

if (columns !== '*') {
  mongoQuery += ' }, { '

  columns.split(',').forEach((column, i) => {
    mongoQuery += `${column}: 1`

    if (i < columns.split(',').length - 1) {
      mongoQuery += ', '
    }
  })
}

mongoQuery += ' })'

// ORDER BY <columns> 	        6.
if (sampleSql.includes('order by')) {
  // need to handle multiple sorts?
  mongoQuery += '.sort({ ' 
    + sampleSql.substring(sampleSql.indexOf(' order by ') + 10)
               .replace(/ asc/g, ': 1')
               .replace(/ desc/g, ': -1')
    + ' })'
}

// OFFSET 	                    7.
// FETCH FIRST 	                8.

if (sampleSql.includes(' top ')) {
  mongoQuery += '.limit({ ' 
    + sampleSql.substring(sampleSql.indexOf(' top ') + 5, sampleSql.indexOf(' top ') + 9) // hack, need to add regex
    + ' })'
}


console.log(mongoQuery)

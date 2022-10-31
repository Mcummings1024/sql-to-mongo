

var sampleSql = 'SELECT TOP 1000 * FROM dbo.Table WHERE X = Y ORDER BY Name DESC'
var mongoQuery = 'db.'

sampleSql = sampleSql.toLowerCase()
  .replace('[', '')
  .replace(']', '')
  .replace('dbo.', '')
  .replace('\n', ' ')

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

// WHERE <predicate on rows> 	2.
var whereClause = ''

if (sampleSql.includes('group by')) {
  whereClause = sampleSql.substring(sampleSql.indexOf(' where ') + 6, sampleSql.indexOf(' group by '))
} else if (sampleSql.includes('order by')) {
  whereClause = sampleSql.substring(sampleSql.indexOf(' where ') + 6, sampleSql.indexOf(' order by '))
} else {
  whereClause = sampleSql.substring(sampleSql.indexOf(' where ') + 6)
}

if (whereClause.includes(' and ')) {

} else {
  mongoQuery += whereClause.replace('=', ':').trimStart().trimEnd()
}

// GROUP BY <columns> 	        3.
// HAVING <predicate on groups> 4.

// SELECT <columns> 	        5.
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

// ORDER BY <columns> 	        6.

// OFFSET 	                    7.
// FETCH FIRST 	                8.

mongoQuery += ' })'

console.log(mongoQuery)

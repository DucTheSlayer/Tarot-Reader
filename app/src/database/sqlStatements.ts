/** Split our migration SQL without splitting semicolons inside quoted copy. */
export function migrationStatements(...sources: string[]): string[] {
  const sql = sources.join('\n')
  const statements: string[] = []
  let buffer = ''
  let quote = ''
  let comment = false
  const finish = () => {
    const statement = buffer.trim()
    if (statement && !/^(?:BEGIN\b|COMMIT\b|PRAGMA\s+user_version\b)/i.test(statement)) statements.push(statement)
    buffer = ''
  }
  for (let index = 0; index < sql.length; index++) {
    const char = sql[index]
    if (comment) {
      if (char === '\n') { comment = false; buffer += '\n' }
      continue
    }
    if (quote) {
      buffer += char
      if (char === quote) {
        if (sql[index + 1] === quote) buffer += sql[++index]
        else quote = ''
      }
    } else if (char === '-' && sql[index + 1] === '-') {
      comment = true
      index++
    } else if (char === "'" || char === '"') {
      quote = char
      buffer += char
    } else if (char === ';') finish()
    else buffer += char
  }
  if (quote) throw new Error('Unterminated SQL string in migration')
  finish()
  return statements
}

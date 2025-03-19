import mysql from 'serverless-mysql'

export const db = mysql({
  config: {
    host: 'localhost',
    user: 'root',
    password: '26052004',
    port: 3306,
    database: 'academia_cisco',
    }
})
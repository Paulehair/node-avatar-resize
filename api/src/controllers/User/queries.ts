import { User } from "../../models/User";

const { Pool } = require('pg')

const pool = new Pool({
    user: 'root',
    host: 'db',
    database: 'db',
    password: 'root',
    port: 5432,
});

const usersRowsToArray = (rows:[]) => {
    const res:[Object?] = []

    rows.forEach((item:any) => {
        const row = item.row.split(',')
        
        res.push({
            id: parseInt(row[0].slice(1,2)),
            username: row[1],
            email: row[2]
        })
    })

    return res
}

export const insertUser = (user:User):any => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO "user" (username, password, email) VALUES ($1, $2, $3) RETURNING id'
        const values = [user.username, user.password, user.email]
    
        pool.query(query, values, (err:any, res:any) => {
            if (err) reject(err)

            resolve(res)
        })
    })
}

export const getUser = (userID:Number = -1):any => {
    return new Promise((resolve, reject) => {
        const query = `SELECT (id, username, email, avatar) FROM "user" ${userID !== -1 ? 'WHERE id=$1' : ''}`
        const values = userID !== -1 ? [userID] : []

        pool.query(query, values, (err:any, res:any) => {
            if (err) reject(err)

            resolve(usersRowsToArray(res.rows))
        })
    })
}
import { User } from "../../models/User";

const { Pool } = require('pg')

const pool = new Pool({
    user: 'root',
    host: 'db',
    database: 'db',
    password: 'root',
    port: 5432,
});

export const insertUser = (user:User):any => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO "user" (username, password, email) VALUES ($1, $2, $3) RETURNING id'
        const values = [user.username, user.password, user.email]
    
        pool.query(query, values, (err, res) => {
            if (err) {
                reject(err)
            }
            resolve(res)
        })
    })
}
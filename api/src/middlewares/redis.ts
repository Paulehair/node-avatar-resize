import redis from 'redis'

const client = redis.createClient({
    host: 'redis-server',
    port: 6379,
    password: 'pwd-redis'
});


export const setImageInCache = (imgID:string, imgData:string):any => {
    return new Promise((resolve, reject) => {
        client.set(imgID, imgData, (err, rep) => {
            if (err) reject(err)
            resolve(rep)
        })
    })
}


export const getImageFromCache = (imgID:string):any => {
    return new Promise((resolve, reject) => {
        client.get(imgID, (err, rep) => {
            if (err) reject(err)
            resolve(rep)
        })
    })
}
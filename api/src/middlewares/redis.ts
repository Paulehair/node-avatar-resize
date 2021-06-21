import redis from 'redis'

const client = redis.createClient({
    host: 'redis-server',
    port: 6379,
    password: 'pwd-redis'
});


export const setImageInCache = (imgID:string, imgData:string):any => {
    return client.set(imgID, imgData, (setErr, rep) => {
        if (setErr) return

        console.log('redis:', rep)
    })
}


export const getImageFromCache = (imgID:string):any => {
    return client.get(imgID, (getErr, rep) => {
        if (getErr) {
            return
        }

        console.log('redis:', rep)
    })
}
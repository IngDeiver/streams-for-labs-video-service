import http from 'http'
import '../config/dotenv'
const TOKEN = process.env.VAULT_TOKEN

export const queryVault = (uri: string) => {

  return new Promise((resolve, reject) => {
    const options = {
      port: 80,
      host: process.env.VAULT_HOST,
      path: uri,
      headers:{
        'Authorization': `Bearer ${TOKEN}`
      }
    }
  
    http.get(options, response => {
      let body = '';
    
      response.on('data',chunk => {
        body += chunk
      })
    
      response.on('end', () => {
        const {data}  = JSON.parse(body)
        resolve(data)
      })
    
    
    }).on('error', (e) => {
      reject(e)
    });
  })
}

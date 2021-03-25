import http from 'http'
import '../config/dotenv'
const TOKEN = process.env.VAULT_TOKEN

export const queryVault = (uri: string) => {

  return new Promise((resolve, reject) => {
    const options = {
      headers:{
        'Authorization': `Bearer ${TOKEN}`
      }
    }
  
    http.get(`${process.env.VAULT_HOST}${uri}`, options, response => {
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

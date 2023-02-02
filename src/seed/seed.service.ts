import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface.ts';


@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios;


 async executeSeed(){
    const {data}= await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=500');
    data.results.forEach(({name, url}) => {
     const seg= url.split('/');
     const no: number=+seg[seg.length-2]
     console.log({name, no});
    } )
    
    return data.results;
  }
}

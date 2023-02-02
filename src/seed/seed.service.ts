import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface.ts';


@Injectable()
export class SeedService {

  private readonly axios: AxiosInstance = axios;
  

  constructor(  
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
){}



 async executeSeed(){
  await this.pokemonModel.deleteMany();
    const {data}= await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=500');
    const pokemonToInsert: {name: string, no: number}[]=[];

    
    data.results.forEach(async ({name, url}) => {
     const seg= url.split('/');
     const no: number=+seg[seg.length-2]
     
     pokemonToInsert.push({name, no});
     });

     await this.pokemonModel.insertMany(pokemonToInsert);

    
    return 'Seed excecuted';
  }
}

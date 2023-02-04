import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

  private defaultLimit;


  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
    ) {
      this.defaultLimit= configService.get<number>('default_limit');
    

  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`Pokemon exist in db ${JSON.stringify(error.keyValue)}`);

      }
      console.log(error);
      throw new InternalServerErrorException(`Cant't create pokemon - check server logs`);

    }

  }

  async findAll(paginationDto: PaginationDto) {
    const { limit= this.defaultLimit, offset=0 }= paginationDto;
    const pokemons = await this.pokemonModel.find()
    .limit(limit).skip(offset).sort({
      no: 1
    }).select('-__v');
    return pokemons;
  }


  async findOne(term: string) {
    let pokemon: Pokemon;


    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    //MOngo ID
    if (isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }




    //Name

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLocaleLowerCase().trim() });

    }

    if (!pokemon) throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`)


    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term);
    try {
      if (UpdatePokemonDto.name)
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();

      await pokemon.updateOne(updatePokemonDto, { new: true });


      return { ...pokemon.toJSON(), ...updatePokemonDto };

    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`Pokemon exist in db ${JSON.stringify(error.keyValue)}`);

      }
      console.log(error);
      throw new InternalServerErrorException(`Cant't create pokemon - check server logs`);

    }


  }

  async remove(id: string) {
    const result= await this.pokemonModel.deleteOne({_id: id});
   if (result.deletedCount===0){
    throw new BadRequestException(`Pokemon with id "${id}" not found`);
    
   }
    return;
}
}
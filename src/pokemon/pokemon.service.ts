import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {


  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {

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

  async findAll() {
    const pokemons = await this.pokemonModel.find();
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

  remove(id: string) {
    return id;
}
}
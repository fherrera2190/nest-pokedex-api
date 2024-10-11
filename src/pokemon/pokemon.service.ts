import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    console.log(createPokemonDto);

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    const pokemons = this.pokemonModel.find();
    return pokemons;
  }

  async findOne(query: string) {
    let pokemon: Pokemon;
    if (!isNaN(+query)) {
      pokemon = await this.pokemonModel.findOne({ no: query });
    }

    if (!pokemon && isValidObjectId(query)) {
      pokemon = await this.pokemonModel.findById(query);
    }
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({
        name: query.toLowerCase().trim(),
      });
    }

    if (!pokemon) throw new NotFoundException(`Pokemon ${query} not found`);
    return pokemon;
  }

  async update(query: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(query);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase().trim();

    try {
      await pokemon.updateOne(updatePokemonDto, {
        new: true,
      });
    } catch (error) {
      this.handleExceptions(error);
    }
    return { ...pokemon.toJSON(), ...updatePokemonDto };
  }

  async remove(id: string) {
    //const pokemon = await this.findOne(query);
    //if (pokemon) await pokemon.deleteOne();
    //const result = await this.pokemonModel.findByIdAndDelete(query);
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0)
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    return;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db ${JSON.stringify(error.keyValue)}`,
      );
    }
    console.log(error);
    throw new InternalServerErrorException(
      'Can not create pokemon - Check server logs',
    );
  }
}

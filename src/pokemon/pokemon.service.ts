import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private readonly defaulLimit:number;

  constructor(
    //Inyectamos el modelo de pokemon, para poder hacer operaciones con las base  de datos
    @InjectModel( Pokemon.name )
    private readonly pokemonModel:Model<Pokemon>,
    private readonly configService:ConfigService
    
  ) {
    this.defaulLimit = configService.get<number>('defaultLimit') ?? 7;
  }


  async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name= createPokemonDto.name.toLowerCase();

    try{
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;

    }catch(error){
      this.handleExceptions(error);
    }  
    
  }

  findAll(paginationDto:PaginationDto) {

    const { limit = this.defaulLimit,offset = 0 } = paginationDto
    return this.pokemonModel.find()
    .limit(limit)
    .skip(offset)
    .sort({
      no:1
    })
    .select('-__v')
    ;
  }

  
  async findOne(term: string) {
    
    let pokemon:Pokemon|null=null;

    //Busqueda por el numero del registro
    if( !isNaN(Number(+term))){
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    //Busqueda por el Id de Mongo
    if(!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    //Busqueda por nombre
    if( !pokemon){
      pokemon = await this.pokemonModel.findOne({name:term.toLowerCase().trim()});
    }

    if( !pokemon ){
        throw new NotFoundException(`El pokemon con el termino de busqueda ${term} no fue encontrado`);
    }
   
    return pokemon;
  }


  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term); 

    if(updatePokemonDto.name)updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto);
      return {...pokemon.toJSON(),...updatePokemonDto};

    } catch (error) {
      this.handleExceptions(error);
    }
  
    
  }

  async remove(id: string) {

    const result = await this.pokemonModel.findByIdAndDelete(id);

    if(!result) throw new NotFoundException(`El pokemon con el id ${id} no fue encontrado`);
    
    return {
      message:'Pokemon eliminado con exito',
      pokemon:result
    };

  }


  private handleExceptions(error:any){
    if(error.code ===11000){
      throw new BadRequestException(`El nombre o el numero del pokemon ya existe ${JSON.stringify(error.keyValue)}`);
    }

    throw new InternalServerErrorException('Error al crear el pokemon - Verifique los logs');
  }
}

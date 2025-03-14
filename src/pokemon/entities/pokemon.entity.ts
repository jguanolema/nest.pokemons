import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema()
export class Pokemon extends Document{

    //Propiedades del paquete mongoose
    @Prop({
        unique:true, //unico
        index:true // indexado para busquedas
    })   
    name: string;

      //Propiedades del paquete mongoose
      @Prop({
        unique:true, //unico
        index:true // indexado para busquedas
    })   
    no:number;
}


export const PokemonSchema =  SchemaFactory.createForClass(Pokemon);